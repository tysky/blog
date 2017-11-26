import Express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import methodOverride from 'method-override';

import Post from './entities/Post';
import NotFoundError from './errors/NotFoundError';

const app = new Express();

const logger = morgan('combined');
app.use(logger);
app.set('view engine', 'pug');
// app.use('/assets', Express.static(process.env.NODE_PATH));
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: false }));

let posts = [ //eslint-disable-line
  new Post('hello', 'how are your?'),
  new Post('nodejs', 'story about nodejs'),
];

app.get('/', (req, res) => {
  res.render('posts/index', { posts });
});

app.get('/posts', (req, res) => {
  res.render('posts/index', { posts });
});

app.get('/posts/new', (req, res) => {
  res.render('posts/new', { form: {}, errors: {} });
});

app.get('/posts/:id', (req, res, next) => {
  const post = posts.find(_post => _post.id.toString() === req.params.id);
  if (post) {
    res.render('posts/show', { post });
  } else {
    next(new NotFoundError());
  }
});

app.get('/posts/:id', (req, res) => {
  const post = posts.find(_post => _post.id.toString() === req.params.id);
  res.render('posts/show', { post });
});

app.post('/posts', (req, res) => {
  const { title, body } = req.body;

  const errors = {};
  if (!title) {
    errors.title = "Can't be blank";
  }

  if (!body) {
    errors.body = "Can't be blank";
  }

  if (Object.keys(errors).length === 0) {
    const post = new Post(title, body);
    posts.push(post);
    res.redirect(`/posts/${post.id}`);
    return;
  }

  res.status(422);
  res.render('posts/new', { form: req.body, errors });
});

app.get('/posts/:id/edit', (req, res) => {
  const post = posts.find(_post => _post.id.toString() === req.params.id);
  const { id, title, body } = post;
  res.render('posts/edit', { post, form: { id, title, body }, errors: {} });
});

app.patch('/posts/:id', (req, res) => {
  const post = posts.find(_post => _post.id.toString() === req.params.id);
  const { title, body } = req.body;

  const errors = {};
  if (!title) {
    errors.title = "Can't be blank";
  }

  if (!body) {
    errors.body = "Can't be blank";
  }

  if (Object.keys(errors).length === 0) {
    post.title = title;
    post.body = body;
    res.redirect(`/posts/${post.id}/edit`);
    return;
  }

  res.status(422);
  res.render('posts/edit', { post, form: req.body, errors });
});

app.delete('/posts/:id', (req, res) => {
  const post = posts.find(_post => _post.id.toString() === req.params.id);
  posts = posts.filter(el => el !== post);
  res.redirect(302, '/');
});

app.use((req, res, next) => {
  next(new NotFoundError());
});

app.use((err, req, res, next) => { //eslint-disable-line
  res.status(err.status);
  switch (err.status) {
    case 404:
      res.render(err.status.toString());
      break;
    default:
      res.render('500');
  }
});

export default app;
