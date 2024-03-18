import {
  describe, test, expect,
} from 'bun:test';

import createRequest from '#lib/request';

describe('lib - function "createRequest"', async () => {
  const createReq = () => ({
    method: 'GET',
    url: 'http://localhost:6000/users?role=admin&array=1&array=2&array=3',
    headers: new Headers({
      connection: 'keep-alive',
      'user-agent': 'Bun/1.0.26',
      'content-type': 'application/json',
      accept: '*/*',
      host: 'localhost:6000',
      'accept-encoding': 'gzip, deflate, br',
    }),
  });

  const req = createReq();

  const request = createRequest(req);

  test('get property from req', async () => {
    expect(request.method).toBe('GET');
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
  });

  test('get property from query with multiple values', async () => {
    expect(request.query.array).toEqual(['1', '2', '3']);
  });

  test('get property type', async () => {
    expect(request.type).toBe('application/json');
  });

  test('set property', async () => {
    expect(() => { request.method = 'POST'; }).toThrow();
  });
});
