import {
  describe, test, expect, vi,
} from 'vitest';

import createResponse from '#lib/response';

describe('lib - function "createResponse"', async () => {
  test('create response without args', async () => {
    const response = createResponse();
    expect(response.status).toBe(400);
    expect(response.message).toBe('Bad Request');
    expect(response.headers).instanceOf(Headers);
    expect(response.type).toBe(null);
    expect(response.body).toBe(undefined);
    expect(response()).toBeInstanceOf(Response);
  });

  test('create response with invalid status code', async () => {
    expect(() => { createResponse({ status: 0 }); }).toThrow();
  });

  test('create response with invalid message', async () => {
    expect(() => { createResponse({ message: 0 }); }).toThrow();
  });

  test('create response with invalid headers', async () => {
    expect(() => { createResponse({ headers: 0 }); }).toThrow();
    expect(() => { createResponse({ headers: { object: {} } }); }).toThrow();
  });

  test('create response with invalid type', async () => {
    expect(() => { createResponse({ type: 0 }); }).toThrow();
  });

  test('set type when creating response', async () => {
    const response = createResponse({ type: 'application/json' });
    expect(response.header['Content-Type']).toEqual('application/json');
  });

  test('set status code', async () => {
    const response = createResponse();
    response.status = 201;
    expect(response.status).toBe(201);
    expect(response.message).toBe('Created');
  });

  test('set status code not allowed with body', async () => {
    console.warn = vi.fn();
    const response = createResponse();
    response.body = 'body';
    response.status = 204;
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(response.body).toBe(undefined);
  });

  test('set message', async () => {
    const response = createResponse();
    response.message = 'message';
    expect(response.message).toBe('message');
    response.status = 201;
    expect(response.message).toBe('message');
  });

  test('get & set header as an object', async () => {
    const response = createResponse();
    response.header['Content-Type'] = 'application/json';
    expect(response.header['Content-Type']).toEqual('application/json');
  });

  test('get & set headers as a headers instance', async () => {
    const response = createResponse();
    expect(response.headers).instanceOf(Headers);
    response.headers.set('Content-Type', 'application/json');
    expect(response.headers.get('Content-Type')).toEqual('application/json');
    response.headers.set('Set-Cookie', 'gingerbread');
    response.headers.append('Set-Cookie', 'macaron');
    expect(response.headers.getSetCookie()).toEqual(['gingerbread', 'macaron']);
  });

  test('get headers object', async () => {
    const response = createResponse();
    response.headers.set('Content-Type', 'application/json');
    expect(response.headersObject).toEqual({ 'content-type': 'application/json' });
    // note: headers are case-insensitive, when converted to object, all keys are lowercased
  });

  test('set headers', async () => {
    const response = createResponse();
    response.headers = { 'Content-Type': 'application/json' };
    expect(response.headers.get('Content-Type')).toEqual('application/json');
  });

  test('get & set cookie as an Object', async () => {
    const response = createResponse();
    response.cookie.key = 'value';
    response.cookie.append('key', 'value2');
    console.log(response.cookies);
    // expect(response.cookie.key).toEqual('value');
  });

  // test('get & set cookies as an instance', async () => {
  //   const response = createResponse();
  //   response.cookie.set('key', 'value', { maxAge: 60 * 60 });
  //   expect(response.cookie.get('key')).toEqual('value');
  //   expect(response.cookies.key).toEqual('value');
  // });

  test('set type', async () => {
    const response = createResponse();
    response.type = 'application/json';
    expect(response.type).toBe('application/json');
  });

  test('set body as an object', async () => {
    const response = createResponse();
    response.body = { key: 'value' };
    expect(response.type).toBe('application/json');
    expect(response.body).toEqual({ key: 'value' });
    expect(response.bodyString).toBe(JSON.stringify({ key: 'value' }));
  });

  test('set body as a FormData instance', async () => {
    const response = createResponse();
    response.body = new FormData();
    expect(response.type).toBe('multipart/form-data');
  });

  test('set body as a URLSearchParams instance', async () => {
    const response = createResponse();
    response.body = new URLSearchParams();
    expect(response.type).toBe('application/x-www-form-urlencoded');
  });

  test('set body as a Blob instance', async () => {
    const response = createResponse();
    response.body = new Blob(['body'], { type: 'image/png' });
    expect(response.type).toBe('image/png');
  });

  test('set body as HTML', async () => {
    console.warn = vi.fn();
    const response = createResponse();
    response.body = '<!DOCTYPE HTML><html></html>';
    expect(response.body).toBe('<!DOCTYPE HTML><html></html>');
    expect(response.type).toBe('text/html');
  });

  test('set body as string', async () => {
    console.warn = vi.fn();
    const response = createResponse();
    response.status = 204;
    response.body = 'body';
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(response.body).toBe('body');
    expect(response.type).toBe('text/plain');
  });

  test.skip('update status code after set body', async () => {
    const response = createResponse();
    expect(response.status).toBe(400);
    response.body = { key: 'value' };
    expect(response.status).toBe(200);
  });

  test('if already set, not update status code after set body', async () => {
    const response = createResponse();
    response.status = 201;
    expect(response.status).toBe(201);
    response.body = { key: 'value' };
    expect(response.status).toBe(201);
  });

  test('set body with invalid type', async () => {
    const response = createResponse();
    expect(() => { response.invalid = 'invalid'; }).toThrow();
  });
});
