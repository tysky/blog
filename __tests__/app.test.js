import request from 'supertest';
import app from '../src';

test('request', async () => {
  const res = await request(app).get('/');
  if (res.error) {
    throw new Error('Error detected!');
  }
  expect(res.status).toBe(200);
});
