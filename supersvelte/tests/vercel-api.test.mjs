import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import handler from '../../api/icons.mjs';

const catalog = JSON.parse(readFileSync(new URL('../server/data/icons.json', import.meta.url), 'utf8'));
const request = (path, method = 'GET') => handler.fetch(new Request(`https://example.test${path}`, { method }));

test('Vercel API returns the complete authoritative Rust catalog', async () => {
  const response = request('/api/icons');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), catalog);
  assert.equal(catalog.length, 755);
});

test('Vercel API returns the original SVG for every icon', async () => {
  for (const icon of catalog) {
    const response = request(`/api/icons?name=${encodeURIComponent(icon.name)}`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { name: icon.name, code: icon.svg });
  }
});

test('unknown icons return a JSON 404', async () => {
  const response = request('/api/icons?name=not-an-icon');
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'Icon not found' });
});

test('API rejects writes and supports HEAD', async () => {
  assert.equal(request('/api/icons', 'POST').status, 405);
  const response = request('/api/icons', 'HEAD');
  assert.equal(response.status, 200);
  assert.equal(await response.text(), '');
});

test('Vercel routes existing code URLs to the icon function', () => {
  const config = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'));
  assert.ok(config.rewrites.some((rule) => rule.source === '/api/icons/:name/code' && rule.destination === '/api/icons?name=:name'));
});
