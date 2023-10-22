import Bun from 'bun';

Bun.serve({
  fetch(req) {
    console.log(req);
    const url = new URL(req.url);
    console.log(url);
    console.log(url.toJSON());
    return new Response('Bun!');
  },
});
