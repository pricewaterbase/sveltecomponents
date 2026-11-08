import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchIcons, fetchCode, copyIconCode } from '../src/lib/icons.ts';

test('catalog, SVG-only copy, code cache and honest clipboard fallback', async () => {
  const oldFetch = globalThis.fetch;
  const oldNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const copied = [];
  let requests = 0;
  globalThis.fetch = async (url) => {
    requests++;
    if (url === '/api/icons') return Response.json([{ name: 'Test', svg: '<svg/>' }]);
    assert.equal(url, '/api/icons/Test/code');
    return Response.json({ name: 'Test', code: '<svg/>' });
  };
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { clipboard: { writeText: async (text) => copied.push(text) } },
  });
  try {
    assert.equal((await fetchIcons()).length, 1);
    await fetchCode('Test');
    const before = requests;
    assert.equal(await copyIconCode('Test'), '<svg/>');
    assert.equal(requests, before, 'cached copies must not await another request');
    assert.equal(copied[0], '<svg/>');

    navigator.clipboard.writeText = async () => { throw new DOMException('Denied', 'NotAllowedError'); };
    await assert.rejects(copyIconCode('Test'), (failure) => {
      assert.equal(failure.error.name, 'NotAllowedError');
      assert.equal(failure.code, '<svg/>', 'must offer code for manual copying');
      return true;
    });
    navigator.clipboard = undefined;
    await assert.rejects(copyIconCode('Test'), (failure) => {
      assert.equal(failure.code, '<svg/>');
      return true;
    });
    globalThis.fetch = async () => new Response('Offline', { status: 503 });
    await assert.rejects(fetchIcons(), /503/);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldNavigator) Object.defineProperty(globalThis, 'navigator', oldNavigator);
  }
});
