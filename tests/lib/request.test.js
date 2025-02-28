import {
  describe, test, expect, vi,
} from 'vitest';

import createRequest from '#lib/request';

describe('lib - function "createRequest"', async () => {
  const createReq = () => ({
    method: 'GET',
    url: 'http://localhost:6000/users?role=admin&array=1&array=2&array=3',
    headers: new Headers({
      cookie: 'session=2718281828; user=John Doe',
      connection: 'keep-alive',
      'user-agent': 'Bun/1.0.26',
      'content-type': 'application/json',
      accept: '*/*',
      host: 'localhost:6000',
      'accept-encoding': 'gzip, deflate, br',
    }),
    arrayBuffer: vi.fn(),
    blob: vi.fn(),
    formData: vi.fn(),
    json: vi.fn(async () => ({ test: 'test' })),
    text: vi.fn(),
  });

  const req = createReq();

  const request = createRequest(req);

  test('get property from req', async () => {
    expect(request.method).toBe('GET');
    const { method } = request;
    expect(method).toBe('GET');
  });

  test('get property by alias', async () => {
    expect(request.path).toBe('/users');
  });

  test('get property from url', async () => {
    expect(request.host).toBe('localhost:6000');
  });

  test('get property URL', async () => {
    expect(request.URL).toBeInstanceOf(URL);
  });

  test('get property from query', async () => {
    expect(request.query.role).toBe('admin');
    const { role } = request.query;
    expect(role).toBe('admin');
  });

  test('get property from query with multiple values', async () => {
    expect(request.query.array).toEqual(['1', '2', '3']);
  });

  test('get property type', async () => {
    expect(request.type).toBe('application/json');
  });

  test('get property cookies', async () => {
    expect(request.cookies).toEqual({ session: '2718281828', user: 'John Doe' });
  });

  test('set property', async () => {
    expect(() => {
      request.method = 'POST';
    }).toThrow();
  });

  test('get body will call reader only once and use cache after', async () => {
    await request.body();
    await request.body();
    expect(req.json).toHaveBeenCalledTimes(1);
  });

  test('pick body reader by type', async () => {
    req.headers.set('content-type', 'text/html');

    const requestWithTextType = createRequest(req);

    requestWithTextType.body();

    expect(req.text).toHaveBeenCalledTimes(1);

    req.headers.set('content-type', 'multipart/form-data');

    const requestWithFormData = createRequest(req);

    requestWithFormData.body();

    expect(req.formData).toHaveBeenCalledTimes(1);
  });

  test.skip('throw error for invalid body reader', async () => {
    console.error = vi.fn();

    req.headers.set('content-type', 'invalid');

    const requestWithInvalidType = createRequest(req);

    await requestWithInvalidType.body();

    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
