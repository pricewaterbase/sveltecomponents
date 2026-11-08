export type Icon = { name: string; svg: string };
type CodeResponse = { name: string; code: string };

const API = '/api';
const codeCache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

export async function fetchIcons(): Promise<Icon[]> {
  const res = await fetch(`${API}/icons`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Serwer odpowiedział kodem ${res.status}`);
  const data = (await res.json()) as Icon[];
  if (!Array.isArray(data)) throw new Error('Nieprawidłowa odpowiedź serwera');
  return data;
}

export function getCachedCode(name: string): string | undefined {
  return codeCache.get(name);
}

/** Fetches generated code from the backend (single source of truth), cached. */
export function fetchCode(name: string): Promise<string> {
  const k = name;
  const hit = codeCache.get(k);
  if (hit !== undefined) return Promise.resolve(hit);
  const pending = inflight.get(k);
  if (pending) return pending;
  const p = fetch(`${API}/icons/${encodeURIComponent(name)}/code`)
    .then(async (res) => {
      if (!res.ok) throw new Error(`Nie udało się pobrać kodu (${res.status})`);
      const body = (await res.json()) as CodeResponse;
      codeCache.set(k, body.code);
      return body.code;
    })
    .finally(() => inflight.delete(k));
  inflight.set(k, p);
  return p;
}

export function prefetchCode(name: string): void {
  fetchCode(name).catch(() => {});
}

/**
 * Copies code while preserving the user activation: synchronous writeText when
 * cached, otherwise a ClipboardItem with a promised Blob (Safari-friendly).
 * Resolves with the code; rejects with { error, code? }.
 */
export async function copyIconCode(name: string): Promise<string> {
  const cached = getCachedCode(name);
  const clip = navigator.clipboard;
  if (!clip) {
    throw { error: new Error('Schowek jest niedostępny w tej przeglądarce'), code: cached ?? (await fetchCode(name)) };
  }
  if (cached !== undefined) {
    try { await clip.writeText(cached); return cached; }
    catch (error) { throw { error, code: cached }; }
  }
  const codePromise = fetchCode(name);
  try {
    if (typeof ClipboardItem !== 'undefined' && clip.write) {
      await clip.write([new ClipboardItem({ 'text/plain': codePromise.then((c) => new Blob([c], { type: 'text/plain' })) })]);
    } else {
      await clip.writeText(await codePromise);
    }
    return await codePromise;
  } catch (error) {
    let code: string | undefined;
    try { code = await codePromise; } catch (e) { throw { error: e }; }
    throw { error, code };
  }
}
