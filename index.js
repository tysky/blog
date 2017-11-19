import Express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import Post from './entities/Post';

const app = new Express();

const logger = morgan('combined');
app.use(logger);
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }));

let posts = [
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

export default app;
