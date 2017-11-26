import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import app from '..';


describe('requests', () => {
  beforeAll(() => {
    jasmine.addMatchers(matchers); //eslint-disable-line
  });

  test('GET /', async () => {
    const res = await request(app).get('/');
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET /undefined', async () => {
    const res = await request(app).get('/undefined');
    expect(res).toHaveHTTPStatus(404);
  });

  it('GET /posts', async () => {
    const res = await request(app).get('/posts');
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET /posts/new', async () => {
    const res = await request(app)
      .get('/posts/new');
    expect(res).toHaveHTTPStatus(200);
  });

  it('POST /posts', async () => {
    const res = await request(app)
      .post('/posts')
      .type('form')
      .send({ title: 'post title', body: 'post body' });
    expect(res).toHaveHTTPStatus(302);
  });

  it('POST /posts (errors)', async () => {
    const res = await request(app)
      .post('/posts');
    expect(res).toHaveHTTPStatus(422);
  });

  it('GET /posts/:id', async () => {
    const query = request(app);
    const res1 = await query
      .post('/posts')
      .type('form')
      .send({ title: 'post title', body: 'post body' });
    const res2 = await query.get(res1.headers.location);
    expect(res2).toHaveHTTPStatus(200);
  });

  it('GET posts/:id 404', async () => {
    const res = await request(app).get('/posts/100');
    expect(res).toHaveHTTPStatus(404);
  });

  it('GET posts/:id/edit', async () => {
    const res1 = await request(app)
      .post('/posts')
      .type('form')
      .send({ title: 'post title', body: 'post body' });
    expect(res1).toHaveHTTPStatus(302);
    const url = res1.headers.location;
    const res2 = await request(app)
      .get(url);
    expect(res2).toHaveHTTPStatus(200);
  });

  it('PATCH posts/:id', async () => {
    const res1 = await request(app)
      .post('/posts')
      .type('form')
      .send({ title: 'post title', body: 'post body' });
    const url = res1.headers.location.match(/\/posts\/\d+/)[0];
    const res2 = await request(app)
      .patch(url)
      .type('form')
      .send({ title: 'new post title', body: 'new post body' });
    expect(res2).toHaveHTTPStatus(302);
  });

  it('PATCH posts/:id (unproccessable entity)', async () => {
    const res1 = await request(app)
      .post('/posts')
      .type('form')
      .send({ title: 'post title', body: 'post body' });
    const url = res1.headers.location.match(/\/posts\/\d+/)[0];
    const res2 = await request(app)
      .patch(url);
    expect(res2).toHaveHTTPStatus(422);
  });

  it('DELETE posts/:id', async () => {
    const res1 = await request(app)
      .post('/posts')
      .type('form')
      .send({ title: 'post title', body: 'post body' });
    const url = res1.headers.location.match(/\/posts\/\d+/)[0];
    const res2 = await request(app)
      .delete(url);
    expect(res2).toHaveHTTPStatus(302);
  });
});
