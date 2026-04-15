import { describe, test, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';

// supertest is already in devDependencies

describe('POST /api/tutor', () => {
  test('returns 400 when text is missing', async () => {
    const res = await request(app).post('/api/tutor').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('returns 400 when text is empty string', async () => {
    const res = await request(app).post('/api/tutor').send({ text: '' });
    expect(res.status).toBe(400);
  });

  test('returns 400 when text exceeds 2000 chars', async () => {
    const res = await request(app)
      .post('/api/tutor')
      .send({ text: 'a'.repeat(2001) });
    expect(res.status).toBe(400);
  });
});
// NOTE: We do NOT test the actual Gemini call in unit tests (costs money + network).
// Rate limit test omitted from unit tests — requires 11 sequential requests which is flaky.
// Integration tested manually after deploy.
