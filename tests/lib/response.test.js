import {
  describe, test, expect, mock,
} from 'bun:test';

import createResponse from '#lib/response';

describe('lib - function "createResponse"', async () => {
  test('create response without args', async () => {
    const response = createResponse();
    expect(response.status).toBe(400);
    expect(response.message).toBe('Bad Request');
    expect(response.headers).toEqual({});
    expect(response.type).toBe(undefined);
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

  test('set status code', async () => {
    const response = createResponse();
    response.status = 201;
    expect(response.status).toBe(201);
    expect(response.message).toBe('Created');
  });

  test('set status code not allowed body', async () => {
    console.warn = mock();
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

  test('set headers', async () => {
    const response = createResponse();
    response.headers = { 'Content-Type': 'application/json' };
    expect(response.headers).toEqual({ 'Content-Type': 'application/json' });
  });

  test('set type', async () => {
    const response = createResponse();
    response.type = 'application/json';
    expect(response.type).toBe('application/json');
  });

  test('set body as string', async () => {
    console.warn = mock();
    const response = createResponse();
    response.status = 204;
    response.body = 'body';
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(response.body).toBe('body');
    expect(response.type).toBe('text/plain');
  });

  test('set body as a Blob instance', async () => {
    const response = createResponse();
    response.body = new Blob(['body'], { type: 'image/png' });
    expect(response.type).toBe('image/png');
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

  test('set body as an object', async () => {
    const response = createResponse();
    response.body = { key: 'value' };
    expect(response.type).toBe('application/json');
    expect(response.body).toEqual({ key: 'value' });
    expect(response.stringedBody).toBe(JSON.stringify({ key: 'value' }));
  });

  test('update status code after set body', async () => {
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
});
