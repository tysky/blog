import Express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import methodOverride from 'method-override';

import encrypt from './encrypt';
import flash from './flash';
import User from './entities/User';
import Guest from './entities/Guest';
import Post from './entities/Post';
import NotFoundError from './errors/NotFoundError';
import AccessDeniedError from './errors/AccessDeniedError';

const app = new Express();

const logger = morgan('combined');
app.use(logger);
app.set('view engine', 'pug');
// app.use('/assets', Express.static(process.env.NODE_PATH));
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'secret key',
  resave: false,
  saveUninitialized: false,
}));
app.use(flash());

const requiredAuth = (req, res, next) => { // eslint-disable-line
  if (res.locals.currentUser.isGuest()) {
    return next(new AccessDeniedError());
  }
  next();
};

const users = [new User('admin', encrypt('qwerty'))];

let posts = [ //eslint-disable-line
  new Post('hello', 'how are your?'),
  new Post('nodejs', 'story about nodejs'),
];

app.use((req, res, next) => {
  if (req.session && req.session.nickname) {
    const { nickname } = req.session;
    res.locals.currentUser = users.find(user => user.nickname === nickname);
  } else {
    res.locals.currentUser = new Guest();
  }
  next();
});

app.get('/', (req, res) => {
  res.render('index', { posts });
});

app.get('/users/new', (req, res) => {
  res.render('users/new', { form: {}, errors: {} });
});

app.post('/users', (req, res) => {
  const { nickname, password } = req.body;

  const errors = {};
  if (!nickname) {
    errors.nickname = "Can't be blank";
  } else {
    const uniq = users.find(user => user.nickname === nickname) === undefined;
    if (!uniq) {
      errors.nickname = 'Already exist';
    }
  }

  if (!password) {
    errors.password = "Can't be blank";
  }

  if (Object.keys(errors).length === 0) {
    const user = new User(nickname, encrypt(password));
    users.push(user);
    res.flash('info', `Welcome, ${user.nickname}!`);
    res.redirect('/');
    return;
  }

  res.status(422);
  res.render('users/new', { form: req.body, errors });
});

app.get('/session/new', (req, res) => {
  res.render('session/new', { form: {} });
});

app.post('/session', (req, res) => {
  const { nickname, password } = req.body;
  const user = users.find(_user => _user.nickname === nickname);
  if (user && user.passwordDigest === encrypt(password)) {
    req.session.nickname = user.nickname;
    res.flash('info', `Welcome, ${user.nickname}!`);
    res.redirect('/');
    return;
  }
  res.status(422);
  res.render('session/new', { form: req.body, error: 'Invalid nickname or password' });
});

app.delete('/session', (req, res) => {
  delete req.session.nickname;
  res.flash('info', `Good bye, ${res.locals.currentUser.nickname}`);
  res.redirect('/');
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

app.delete('/posts/:id', requiredAuth, (req, res) => {
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
