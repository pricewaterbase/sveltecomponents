import icons from '../supersvelte/server/data/icons.json' with { type: 'json' };

const iconsByName = new Map(icons.map((icon) => [icon.name, icon]));
const headers = {
  'Cache-Control': 'public, max-age=0, s-maxage=3600',
  'X-Content-Type-Options': 'nosniff',
};

export default {
  fetch(request) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return Response.json({ error: 'Method not allowed' }, {
        status: 405,
        headers: { Allow: 'GET, HEAD' },
      });
    }

    const name = new URL(request.url).searchParams.get('name');
    const icon = name === null ? null : iconsByName.get(name);
    if (name !== null && !icon) {
      return Response.json({ error: 'Icon not found' }, { status: 404 });
    }

    if (request.method === 'HEAD') {
      return new Response(null, { headers: { ...headers, 'Content-Type': 'application/json' } });
    }

    return Response.json(icon ? { name: icon.name, code: icon.svg } : icons, { headers });
  },
};
