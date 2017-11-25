import Express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import methodOverride from 'method-override';

import Post from './entities/Post';

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

app.get('/posts/:id', (req, res) => {
  const post = posts.find(_post => _post.id.toString() === req.params.id);
  res.render('posts/show', { post });
});

app.post('/posts', (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    const error = {
      title: 'Error! Title is empty!',
      body: 'Error! Post is empty!',
    };
    res.status(422);
    res.render('posts/show', error);
  } else {
    const newPost = new Post(title, body);
    posts.push(newPost);
    res.redirect(302, `/posts/${newPost.id}`);
  }
});

app.get('/posts/:id/edit', (req, res) => {
  const post = posts.find(_post => _post.id.toString() === req.params.id);
  const { id, title, body } = post;
  res.render('posts/edit', { post, form: { id, title, body }, errors: {} });
});

app.patch('/posts/:id', (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    const error = {
      title: 'Error! Title is empty!',
      body: 'Error! Post is empty!',
    };
    res.status(422);
    res.render('posts/show', error);
  } else {
    const post = posts.find(_post => _post.id.toString() === req.params.id);
    post.title = title;
    post.body = body;
    res.redirect(302, `/posts/${post.id}`);
  }
});

app.delete('/posts/:id', (req, res) => {
  const post = posts.find(_post => _post.id.toString() === req.params.id);
  posts = posts.filter(el => el !== post);
  res.redirect(302, '/');
});

export default app;
