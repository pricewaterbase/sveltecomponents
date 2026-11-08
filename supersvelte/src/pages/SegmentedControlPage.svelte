<script lang="ts">
  import type { Component } from 'svelte';
  import LibraryIcon from '../components/LibraryIcon.svelte';
  import BaseSegmentedControl from '../components/segmented-control/BaseSegmentedControl.svelte';
  import ThemeSegmentedControl from '../components/segmented-control/ThemeSegmentedControl.svelte';
  import BlockSegmentedControl from '../components/segmented-control/BlockSegmentedControl.svelte';
  import DisabledSegmentedControl from '../components/segmented-control/DisabledSegmentedControl.svelte';
  import DisabledOptionSegmentedControl from '../components/segmented-control/DisabledOptionSegmentedControl.svelte';
  import ScrollableSegmentedControl from '../components/segmented-control/ScrollableSegmentedControl.svelte';
  import baseSrc from '../components/segmented-control/BaseSegmentedControl.svelte?raw';
  import themeSrc from '../components/segmented-control/ThemeSegmentedControl.svelte?raw';
  import blockSrc from '../components/segmented-control/BlockSegmentedControl.svelte?raw';
  import disabledSrc from '../components/segmented-control/DisabledSegmentedControl.svelte?raw';
  import disabledOptSrc from '../components/segmented-control/DisabledOptionSegmentedControl.svelte?raw';
  import scrollSrc from '../components/segmented-control/ScrollableSegmentedControl.svelte?raw';
  import engineSrc from '../components/segmented-control/SegmentedControl.svelte?raw';

  type Pref = 'system' | 'light' | 'dark';
  type Demo = { id: string; title: string; note: string; file: string; comp: Component<any>; src: string };
  const demos: Demo[] = [
    { id: 'base', title: 'Podstawowy', note: 'Trzy opcje, przesuwany znacznik. Strzałki zmieniają fokus, Enter lub spacja wybiera.', file: 'BaseSegmentedControl.svelte', comp: BaseSegmentedControl, src: baseSrc },
    { id: 'theme', title: 'Motyw', note: 'Ikony Sun, Moon i Desktop z biblioteki wklejone inline. Steruje motywem całej aplikacji.', file: 'ThemeSegmentedControl.svelte', comp: ThemeSegmentedControl, src: themeSrc },
    { id: 'block', title: 'Pełna szerokość', note: 'Właściwość block rozciąga opcje równo na całą szerokość kontenera.', file: 'BlockSegmentedControl.svelte', comp: BlockSegmentedControl, src: blockSrc },
    { id: 'disabled', title: 'Wyłączony', note: 'Cała grupa wyłączona — bez fokusu i bez zmiany wartości.', file: 'DisabledSegmentedControl.svelte', comp: DisabledSegmentedControl, src: disabledSrc },
    { id: 'disabled-option', title: 'Wyłączona opcja', note: 'Pojedyncza opcja Successful jest wyłączona, pozostałe działają.', file: 'DisabledOptionSegmentedControl.svelte', comp: DisabledOptionSegmentedControl, src: disabledOptSrc },
    { id: 'scrollable', title: 'Przewijany', note: 'Zbyt wiele opcji — kontrolka przewija się poziomo zamiast wylewać.', file: 'ScrollableSegmentedControl.svelte', comp: ScrollableSegmentedControl, src: scrollSrc },
  ];
  const shared = [
    { id: 'engine', file: 'SegmentedControl.svelte', note: 'Wspólny silnik: grupa i opcje w jednym komponencie (part="Option"). Domyślne tokeny są ograniczone do samej kontrolki.', src: engineSrc },
  ];

  let { onToast, themePref, setTheme }: { onToast: (text: string) => void; themePref: Pref; setTheme: (p: Pref) => void } = $props();
  let tab = $state<Record<string, 'preview' | 'code'>>({});
  let open = $state<Record<string, boolean>>({});
  let copiedId = $state<string | null>(null);
  let manual = $state<{ file: string; error: string; code: string } | null>(null);
  let copiedTimer: ReturnType<typeof setTimeout> | undefined;

  function errText(e: unknown) {
    if (e instanceof Error) return e.name === 'NotAllowedError' ? `Odmowa dostępu do schowka: ${e.message}` : e.message;
    return String(e);
  }

  async function copy(id: string, file: string, code: string) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Schowek jest niedostępny w tym kontekście przeglądarki.');
      await navigator.clipboard.writeText(code);
      clearTimeout(copiedTimer);
      copiedId = id;
      copiedTimer = setTimeout(() => (copiedId = null), 1400);
      onToast(`Skopiowano: ${file}`);
    } catch (e) {
      manual = { file, error: errText(e), code };
    }
  }

  function selectAll(node: HTMLTextAreaElement) { node.focus(); node.select(); }
  function lines(s: string) { return s.split('\n').length; }
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape' && manual) manual = null; }} />

<div class="mp" data-testid="page-segmented-control">
  <header class="head">
    <h1 class="font-medium">Segmented Control</h1>
    <p>Przełącznik segmentowy w Svelte 5: sześć wariantów na wspólnym silniku. Strzałki przenoszą fokus, Enter lub spacja wybiera opcję.</p>
  </header>

  <section class="demos">
    {#each demos as d (d.id)}
      {@const view = tab[d.id] ?? 'preview'}
      <article class="card" class:code-view={view === 'code'} data-testid={`card-segmented-${d.id}`}>
        <div class="card-head">
          <div class="ttl">
            <h2 class="font-medium">{d.title}</h2>
          </div>
          <div class="seg" role="tablist" aria-label={`Widok: ${d.title}`}>
            <button role="tab" aria-selected={view === 'preview'} class:on={view === 'preview'} onclick={() => (tab[d.id] = 'preview')} data-testid={`tab-preview-${d.id}`}>Podgląd</button>
            <button role="tab" aria-selected={view === 'code'} class:on={view === 'code'} onclick={() => (tab[d.id] = 'code')} data-testid={`tab-code-${d.id}`}>Kod</button>
          </div>
        </div>
        {#if view === 'preview'}
          <div class="stage">
            {#if d.id === 'theme'}
              <ThemeSegmentedControl value={themePref} onChange={setTheme} />
            {:else}
              <d.comp />
            {/if}
          </div>
          <p class="note">{d.note}</p>
        {:else}
          <div class="code">
            <div class="code-bar">
              <span class="code-filename">svelte<span class="language">{d.file}</span></span>
              <button class="copy" onclick={() => copy(d.id, d.file, d.src)} data-testid={`button-copy-${d.id}`}>
                <LibraryIcon name={copiedId === d.id ? 'Check' : 'Copy'} size={14} />{copiedId === d.id ? 'Skopiowano' : 'Kopiuj'}
              </button>
            </div>
            <pre><code>{d.src}</code></pre>
          </div>
        {/if}
        {#if view === 'code'}<p class="note code-note">{lines(d.src)} linii · Kod komponentu gotowy do skopiowania</p>{/if}
      </article>
    {/each}
  </section>

  <section class="shared">
    <h2 class="font-medium sec">Wspólne pliki</h2>
    <p class="sec-note">Wszystkie warianty importują <code>./SegmentedControl.svelte</code>. Ikony motywu są wklejone bezpośrednio w kod przykładu.</p>
    {#each shared as s (s.id)}
      <div class="src" data-testid={`shared-${s.id}`}>
        <div class="src-head">
          <button type="button" class="source-title source-toggle" aria-expanded={!!open[s.id]} aria-controls={`source-${s.id}`} aria-label={`Kod źródłowy ${s.file}`} onclick={() => (open[s.id] = !open[s.id])} data-testid={`button-toggle-shared-${s.id}`}>
            <span class="file strong">{s.file}</span>
            <span class="cnt">{lines(s.src)} linii</span>
            <svg class="chev" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.3415 4.74742C11.7185 4.41753 12.2815 4.41753 12.6585 4.74742L16.6585 8.24742C17.0741 8.61111 17.1162 9.24287 16.7526 9.6585C16.3889 10.0741 15.7571 10.1163 15.3415 9.75258L12 6.82877L8.65849 9.75258C8.24285 10.1163 7.61109 10.0741 7.24741 9.6585C6.88373 9.24287 6.92584 8.61111 7.34148 8.24742L11.3415 4.74742ZM7.24603 14.3578C7.60885 13.9414 8.24052 13.8979 8.65692 14.2608L12 17.1737L15.3431 14.2608C15.7594 13.8979 16.3911 13.9414 16.7539 14.3578C17.1167 14.7742 17.0733 15.4058 16.6569 15.7687L12.6569 19.2539C12.2804 19.582 11.7196 19.582 11.3431 19.2539L7.34305 15.7687C6.92666 15.4058 6.88322 14.7742 7.24603 14.3578Z" fill="currentColor"/></svg>
          </button>
          <button class="copy" onclick={() => copy(s.id, s.file, s.src)} data-testid={`button-copy-${s.id}`}>
            <LibraryIcon name={copiedId === s.id ? 'Check' : 'Copy'} size={14} />{copiedId === s.id ? 'Skopiowano' : 'Kopiuj'}
          </button>
        </div>
        <div id={`source-${s.id}`} class="src-body" hidden={!open[s.id]}>
          <p class="note">{s.note}</p>
          <div class="code">
            <!-- svelte-ignore a11y_no_noninteractive_tabindex (Scrollable source must be keyboard reachable.) -->
            <pre class="tall" tabindex="0" aria-label={`Kod ${s.file}`}><code>{s.src}</code></pre>
          </div>
        </div>
      </div>
    {/each}
  </section>
</div>

{#if manual}
  <div class="overlay" role="presentation" onclick={(e) => { if (e.target === e.currentTarget) manual = null; }}>
    <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="sdlg-title">
      <h2 id="sdlg-title">Skopiuj ręcznie</h2>
      <p class="err" data-testid="text-segmented-clipboard-error">Nie udało się skopiować automatycznie. {manual.error}</p>
      <p class="hint">Kod <strong>{manual.file}</strong> jest zaznaczony. Naciśnij Ctrl+C lub Cmd+C.</p>
      <textarea readonly use:selectAll data-testid="textarea-segmented-manual-copy">{manual.code}</textarea>
      <div class="actions"><button class="primary" onclick={() => (manual = null)} data-testid="button-close-segmented-dialog">Gotowe</button></div>
    </div>
  </div>
{/if}

<style>
  .font-medium { font-weight: 500; }
  .mp { min-width: 0; max-width: 880px; margin: 0 auto; }
  .head { margin-bottom: 36px; }
  .head h1 { margin: 0 0 10px; font-size: 26px; letter-spacing: -.025em; }
  .head p { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.55; max-width: 60ch; }
  .demos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px 24px; align-items: start; }
  .card { min-width: 0; border: 0; border-radius: 0; background: transparent; display: flex; flex-direction: column; }
  .card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 2px 12px; }
  .ttl { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .ttl h2 { margin: 0; font-size: 15px; line-height: 1.5; }
  .file { font-size: 12px; color: var(--faint); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .file.strong { color: var(--text); font-size: 13px; font-weight: 500; }
  .seg { display: flex; gap: 2px; padding: 0; border-radius: 999px; background: transparent; flex: none; }
  .seg button { border: 0; background: none; border-radius: 999px; min-height: 32px; padding: 6px 12px; font-size: 13px; color: var(--muted); cursor: pointer; transition: background .15s, color .15s; }
  .seg button:hover { color: var(--text); }
  .seg button.on { background: var(--active); color: var(--text); }
  .stage { min-height: 224px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 36px 18px; margin: 0; border: 1px solid var(--divider); border-radius: 18px; background: var(--surface); }
  .stage { min-width: 0; }
  .stage > :global(*) { max-width: 100%; }
  .note { margin: 0; padding: 12px 2px 0; font-size: 12px; line-height: 1.5; color: var(--muted); min-height: 48px; }
  .code { min-width: 0; display: flex; flex-direction: column; flex: 1; background: var(--field); }
  .card > .code { margin: 0; border: 0; border-radius: 18px; overflow: hidden; height: 224px; flex: none; }
  .code-bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 12px 8px 16px; border-bottom: 0; background: var(--active); font-size: 12px; color: var(--muted); }
  .code-filename { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .language { margin-left: 8px; color: var(--faint); font-size: 11px; }
  pre { margin: 0; padding: 16px; max-height: 300px; overflow: auto; scrollbar-width: none; background: var(--field); font-size: 12px; line-height: 1.7; tab-size: 2; flex: 1; }
  pre::-webkit-scrollbar { display: none; }
  pre.tall { max-height: 460px; }
  pre code, code { font-family: Arial, Helvetica, sans-serif; white-space: pre; }
  .sec-note code { white-space: normal; background: var(--field); padding: 1px 5px; border-radius: 4px; }
  .copy { display: inline-flex; align-items: center; gap: 6px; min-height: 30px; border: 0; background: transparent; border-radius: 999px; padding: 5px 12px; font-size: 12px; cursor: pointer; color: var(--muted); flex: none; }
  .copy:hover { background: var(--hover); }
  .shared { margin-top: 48px; }
  .source-toggle { border: 0; background: none; color: inherit; font: inherit; text-align: left; cursor: pointer; border-radius: 999px; }
  .source-toggle:hover { background: var(--hover); }
  .chev { width: 16px; height: 16px; flex: none; color: var(--muted); }
  .src-body[hidden] { display: none; }
  .sec { margin: 0 0 6px; font-size: 17px; }
  .sec-note { margin: 0 0 18px; color: var(--muted); font-size: 13px; line-height: 1.5; }
  .src { border: 0; border-radius: 18px; background: var(--field); margin-bottom: 10px; overflow: hidden; }
  .src-head { display: flex; align-items: center; gap: 8px; padding: 10px 12px 8px 8px; }
  .source-title { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; padding: 6px 8px; }
  .cnt { font-size: 12px; color: var(--faint); margin-left: auto; flex: none; }
  .src .note { padding: 0 16px 16px; min-height: 0; }
  .overlay { position: fixed; inset: 0; background: var(--overlay); display: grid; place-items: center; padding: 16px; z-index: 60; animation: fade .15s; }
  .dialog { background: var(--surface); border-radius: 18px; width: min(640px, 100%); padding: 24px; box-shadow: var(--shadow-pop); animation: pop .18s ease-out; }
  .dialog h2 { margin: 0 0 10px; font-size: 18px; font-weight: 600; }
  .err { color: var(--danger); font-size: 13px; margin: 0 0 8px; overflow-wrap: anywhere; }
  .hint { color: var(--muted); font-size: 14px; line-height: 1.5; margin: 0 0 14px; }
  .hint strong { color: var(--text); }
  textarea { width: 100%; height: 260px; resize: vertical; font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.55; border: 0; border-radius: 10px; padding: 12px; background: var(--field); color: var(--text); }
  .actions { display: flex; justify-content: flex-end; margin-top: 16px; }
  .primary { background: var(--text); color: var(--bg); border: 0; border-radius: 999px; padding: 9px 16px; font-size: 14px; font-weight: 500; cursor: pointer; }
  @media (max-width: 767px) {
    .demos { grid-template-columns: 1fr; }
    .head h1 { font-size: 24px; }
    .card-head { padding: 0 2px 12px; gap: 8px; }
    .language { display: none; }
    pre { max-height: 260px; }
  }
</style>
