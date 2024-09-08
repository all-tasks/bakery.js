import { Bun } from 'bun';

const port = 4444;

Bun.serve({
  port,
  fetch() {
    return new Response('', {
      statusText: 'customStatusText',
    });
  },
});

const host = `http://localhost:${port}`;

await fetch(`${host}`)
  .then((res) => {
    console.debug({ res, statusText: res.statusText });
  });