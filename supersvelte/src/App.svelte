<script lang="ts">
  import { onMount } from 'svelte';
  import LibraryIcon from './components/LibraryIcon.svelte';
  import HomePage from './pages/HomePage.svelte';
  import MenuPage from './pages/MenuPage.svelte';
  import SegmentedControlPage from './pages/SegmentedControlPage.svelte';
  import ButtonPage from './pages/ButtonPage.svelte';
  import EmptyMessagePage from './pages/EmptyMessagePage.svelte';
  import MarkdownPage from './pages/MarkdownPage.svelte';
  import PopoverPage from './pages/PopoverPage.svelte';
  import DatePickerPage from './pages/DatePickerPage.svelte';
  import SearchEmptyMessage from './components/empty-message/SearchEmptyMessage.svelte';
  import Button from './components/button/Button.svelte';
  import ThemeSegmentedControl from './components/segmented-control/ThemeSegmentedControl.svelte';
  import { fetchIcons, prefetchCode, copyIconCode, type Icon } from './lib/icons';

  let icons = $state<Icon[]>([]);
  let status = $state<'loading' | 'ready' | 'error'>('loading');
  let loadError = $state('');
  let query = $state('');
  let sidebarOpen = $state(false);
  let copied = $state<string | null>(null);
  let toast = $state<{ id: number; text: string } | null>(null);
  let manual = $state<{ name: string; error: string; code: string } | null>(null);
  type Route = 'home' | 'icons' | 'menu' | 'segmented-control' | 'button' | 'empty-message' | 'markdown' | 'popover' | 'date-picker';
  const paths: Record<Route, string> = { home: '/', icons: '/icons', menu: '/menu', 'segmented-control': '/segmented-control', button: '/button', 'empty-message': '/empty-message', markdown: '/markdown', popover: '/popover', 'date-picker': '/date-picker' };
  const titles: Record<Route, string> = { home: 'supersvelte', icons: 'supersvelte · ikony', menu: 'Menu · supersvelte', 'segmented-control': 'Segmented Control · supersvelte', button: 'Button · supersvelte', 'empty-message': 'Empty Message · supersvelte', markdown: 'Markdown · supersvelte', popover: 'Popover · supersvelte', 'date-picker': 'DatePicker · supersvelte' };
  const routeOf = (path: string): Route => { const p = path.replace(/\/+$/, '') || '/'; return (Object.keys(paths) as Route[]).find((r) => paths[r] === p) ?? 'home'; };
  let route = $state<Route>(routeOf(location.pathname));
  function go(e: MouseEvent, to: Route) {
    sidebarOpen = false;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const path = paths[to];
    if (location.pathname !== path) history.pushState({ route: to }, '', path);
    route = to;
    window.scrollTo(0, 0);
  }
  onMount(() => {
    const h = () => (route = routeOf(location.pathname));
    window.addEventListener('popstate', h);
    return () => window.removeEventListener('popstate', h);
  });
  $effect(() => { document.title = titles[route]; });
  let toastTimer: ReturnType<typeof setTimeout> | undefined;
  let copiedTimer: ReturnType<typeof setTimeout> | undefined;

  type Pref = 'system' | 'light' | 'dark';
  const THEME_KEY = 'icon-library-theme';
  const initialPref = document.documentElement.dataset.themePref;
  let themePref = $state<Pref>(initialPref === 'light' || initialPref === 'dark' ? initialPref : 'system');
  let systemDark = $state(typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches);
  const resolved = $derived(themePref === 'system' ? (systemDark ? 'dark' : 'light') : themePref);

  $effect(() => {
    const r = document.documentElement;
    r.dataset.theme = resolved;
    r.dataset.themePref = themePref;
    r.style.colorScheme = resolved;
  });

  function setTheme(p: Pref) {
    themePref = p;
    try { if (p === 'system') localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, p); } catch {}
  }

  onMount(() => {
    if (typeof matchMedia !== 'function') return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const h = (e: MediaQueryListEvent) => (systemDark = e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  });

  const filtered = $derived.by(() => {
    const normalize = (name: string) => name.toLowerCase().replace(/[\s_-]+/g, '');
    const q = normalize(query.trim());
    if (!q) return icons;
    return icons.filter((i) => normalize(i.name).includes(q));
  });

  async function load() {
    status = 'loading';
    loadError = '';
    try {
      icons = (await fetchIcons()).sort((a, b) => a.name.localeCompare(b.name));
      status = 'ready';
    } catch (e) {
      loadError = e instanceof Error ? e.message : String(e);
      status = 'error';
    }
  }
  onMount(load);

  function showToast(text: string) {
    clearTimeout(toastTimer);
    toast = { id: Date.now(), text };
    toastTimer = setTimeout(() => (toast = null), 2200);
  }

  function errText(e: unknown) {
    if (e instanceof Error) return e.name === 'NotAllowedError' ? `Odmowa dostępu do schowka: ${e.message}` : e.message;
    return String(e);
  }

  async function copy(icon: Icon) {
    try {
      await copyIconCode(icon.name);
      clearTimeout(copiedTimer);
      copied = icon.name;
      copiedTimer = setTimeout(() => (copied = null), 1400);
      showToast(`Skopiowano SVG: ${icon.name}`);
    } catch (raw) {
      const r = raw as { error?: unknown; code?: string };
      if (r?.code !== undefined) {
        manual = { name: icon.name, error: errText(r.error), code: r.code };
      } else {
        showToast(`Błąd: ${errText(r?.error ?? raw)}`);
      }
    }
  }

  function focusSearch() { document.getElementById('search')?.focus(); }

  function selectAll(node: HTMLTextAreaElement) {
    node.focus();
    node.select();
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') { if (manual) manual = null; else if (sidebarOpen) sidebarOpen = false; }
    if (route === 'icons' && e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
      e.preventDefault();
      document.getElementById('search')?.focus();
    }
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="shell">
  <aside class="side" class:open={sidebarOpen} aria-label="Nawigacja">
    <div class="side-top">
      <a class="brand font-medium" href="/" onclick={(e) => go(e, 'home')} data-testid="link-brand">
        supersvelte
      </a>
      <button class="ibtn close-mobile" aria-label="Zamknij menu" title="Zamknij menu" onclick={() => (sidebarOpen = false)} data-testid="button-collapse">
        <LibraryIcon name="Sidebar" />
      </button>
    </div>
    <nav class="side-nav" aria-label="Główna">
      <a class="side-link" class:on={route === 'home'} href="/" aria-current={route === 'home' ? 'page' : undefined} onclick={(e) => go(e, 'home')} data-testid="link-home">
        <span class="font-medium">Start</span>
      </a>
      <a class="side-link" class:on={route === 'icons'} href="/icons" aria-current={route === 'icons' ? 'page' : undefined} onclick={(e) => go(e, 'icons')} data-testid="link-icons">
        <span class="font-medium">Ikony</span>
      </a>
      <a class="side-link" class:on={route === 'menu'} href="/menu" aria-current={route === 'menu' ? 'page' : undefined} onclick={(e) => go(e, 'menu')} data-testid="link-menu">
        <span class="font-medium">Menu</span>
      </a>
      <a class="side-link" class:on={route === 'segmented-control'} href="/segmented-control" aria-current={route === 'segmented-control' ? 'page' : undefined} onclick={(e) => go(e, 'segmented-control')} data-testid="link-segmented-control">
        <span class="font-medium">Segmented Control</span>
      </a>
      <a class="side-link" class:on={route === 'button'} href="/button" aria-current={route === 'button' ? 'page' : undefined} onclick={(e) => go(e, 'button')} data-testid="link-button">
        <span class="font-medium">Button</span>
      </a>
      <a class="side-link" class:on={route === 'empty-message'} href="/empty-message" aria-current={route === 'empty-message' ? 'page' : undefined} onclick={(e) => go(e, 'empty-message')} data-testid="link-empty-message">
        <span class="font-medium">Empty Message</span>
      </a>
      <a class="side-link" class:on={route === 'markdown'} href="/markdown" aria-current={route === 'markdown' ? 'page' : undefined} onclick={(e) => go(e, 'markdown')} data-testid="link-markdown">
        <span class="font-medium">Markdown</span>
      </a>
      <a class="side-link" class:on={route === 'popover'} href="/popover" aria-current={route === 'popover' ? 'page' : undefined} onclick={(e) => go(e, 'popover')} data-testid="link-popover">
        <span class="font-medium">Popover</span>
      </a>
      <a class="side-link" class:on={route === 'date-picker'} href="/date-picker" aria-current={route === 'date-picker' ? 'page' : undefined} onclick={(e) => go(e, 'date-picker')} data-testid="link-date-picker">
        <span class="font-medium">DatePicker</span>
      </a>
    </nav>
    <div class="side-footer" data-testid="group-theme">
      <ThemeSegmentedControl value={themePref} onChange={setTheme} size="xs" />
    </div>
  </aside>
  {#if sidebarOpen}<button class="scrim" aria-label="Zamknij menu" onclick={() => (sidebarOpen = false)}></button>{/if}

  <div class="main-col">
    <header class="top">
      <button class="ibtn menu-btn" aria-label="Otwórz menu" onclick={() => (sidebarOpen = true)} data-testid="button-menu">
        <LibraryIcon name="Menu" />
      </button>
      <a class="top-title" href="/" onclick={(e) => go(e, 'home')}>supersvelte</a>
    </header>

    <main class="page" class:home-route={route === 'home'} class:menu-route={route !== 'icons'} id="biblioteka">
      {#if route === 'home'}
        <HomePage onNavigate={go} />
      {:else if route === 'menu'}
        <MenuPage onToast={showToast} />
      {:else if route === 'segmented-control'}
        <SegmentedControlPage onToast={showToast} {themePref} {setTheme} />
      {:else if route === 'button'}
        <ButtonPage onToast={showToast} />
      {:else if route === 'empty-message'}
        <EmptyMessagePage onToast={showToast} />
      {:else if route === 'markdown'}
        <MarkdownPage onToast={showToast} />
      {:else if route === 'popover'}
        <PopoverPage onToast={showToast} />
      {:else if route === 'date-picker'}
        <DatePickerPage onToast={showToast} />
      {:else}
      <div class="col">
        <h1 class="title font-medium">Biblioteka ikon</h1>
        <label class="search">
          <span class="sr">Szukaj ikon</span>
          <LibraryIcon name="Search" />
          <input id="search" type="search" placeholder="Szukaj ikon" autocomplete="off" spellcheck="false" bind:value={query} data-testid="input-search" />
          {#if query}
            <button class="clear" aria-label="Wyczyść wyszukiwanie" onclick={() => { query = ''; focusSearch(); }} data-testid="button-clear-search">
              <LibraryIcon name="CloseBold" size={14} />
            </button>
          {:else}<kbd>/</kbd>{/if}
        </label>
        <div class="meta">
          {#if status === 'ready'}
            <span aria-live="polite" data-testid="text-results">{#if query.trim()}<b>{filtered.length}</b> z {icons.length}{:else}<b data-testid="text-library-count">{icons.length} ikon</b>{/if}</span>
            <span class="sr" data-testid="text-count">{icons.length}</span>
            <span class="hint-line">Kliknij ikonę, aby skopiować SVG</span>
          {:else if status === 'loading'}<span>Wczytywanie…</span>{/if}
        </div>

        {#if status === 'loading'}
          <div class="grid" aria-busy="true" aria-label="Ładowanie ikon">
            {#each Array(24) as _, i (i)}
              <div class="tile skeleton" style="animation-delay:{(i % 8) * 60}ms"><span class="glyph"></span><span class="sk-line"></span></div>
            {/each}
          </div>
        {:else if status === 'error'}
          <div class="state" role="alert">
            <h2>Nie udało się wczytać ikon</h2>
            <p>{loadError}</p>
            <button class="primary" onclick={load} data-testid="button-retry">Spróbuj ponownie</button>
          </div>
        {:else if filtered.length === 0}
          {#if icons.length === 0}
            <div class="state">
              <h2>Biblioteka jest pusta</h2>
              <p>Serwer nie zwrócił żadnych ikon.</p>
            </div>
          {:else}
            <div class="empty-results" role="status">
              <SearchEmptyMessage query={query.trim()} />
              <Button variant="solid" size="sm" onClick={() => { query = ''; focusSearch(); }} data-testid="button-reset-search">Wyczyść</Button>
            </div>
          {/if}
        {:else}
          <ul class="grid" data-testid="grid-icons">
            {#each filtered as icon (icon.name)}
              <li>
                <button class="tile" class:copied={copied === icon.name} title={icon.name} aria-label={`Kopiuj SVG: ${icon.name}`}
                  onpointerenter={() => prefetchCode(icon.name)} onfocus={() => prefetchCode(icon.name)} onclick={() => copy(icon)} data-testid={`button-icon-${icon.name}`}>
                  <span class="glyph" aria-hidden="true">{@html icon.svg}</span>
                  <span class="name">{copied === icon.name ? 'Skopiowano' : icon.name}</span>
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
      {/if}
    </main>
  </div>
</div>

{#if toast}
  {#key toast.id}
    <div class="toast" role="status" data-testid="status-toast">
      <LibraryIcon name="Check" size={16} />
      {toast.text}
    </div>
  {/key}
{/if}

{#if manual}
  <div class="overlay" role="presentation" onclick={(e) => { if (e.target === e.currentTarget) manual = null; }}>
    <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
      <h2 id="dlg-title">Skopiuj ręcznie</h2>
      <p class="err" data-testid="text-clipboard-error">{manual.error}</p>
      <p class="hint">Kod ikony <strong>{manual.name}</strong> jest zaznaczony. Naciśnij Ctrl+C lub Cmd+C.</p>
      <textarea readonly use:selectAll data-testid="textarea-manual-copy">{manual.code}</textarea>
      <div class="actions"><button class="primary" onclick={() => (manual = null)} data-testid="button-close-dialog">Gotowe</button></div>
    </div>
  </div>
{/if}

<style>
  .font-medium { font-weight: 500; }
  .brand.font-medium, .title.font-medium { font-weight: 500; }
  .shell { display: flex; min-height: 100dvh; background: var(--bg); }
  .side { width: 260px; flex: none; position: sticky; top: 0; height: 100dvh; display: flex; flex-direction: column; padding: 6px 8px; background: var(--sidebar); border-right: 1px solid var(--divider); z-index: 40; overflow: auto; }
  .close-mobile { display: none; }
  .side-top { display: flex; align-items: center; justify-content: space-between; height: 48px; padding: 0 0 0 10px; margin-bottom: 8px; }
  .brand { display: flex; align-items: center; gap: 4px; font-weight: 400; font-size: 18px; letter-spacing: -.01em; color: var(--text); text-decoration: none; }
  .ibtn { border: 0; background: none; width: 36px; height: 36px; border-radius: 8px; display: grid; place-items: center; cursor: pointer; color: var(--muted); flex: none; }
  .ibtn:hover { background: var(--hover); color: var(--text); }
  .side-nav { display: grid; gap: 1px; }
  .side-link { display: flex; align-items: center; gap: 10px; width: 100%; height: 36px; padding: 0 10px; border-radius: 10px; font-size: 14px; color: var(--text); text-decoration: none; }
  .side-link:hover { background: var(--hover); }
  .side-link.on { background: var(--active); }
  .side-link span:first-of-type { flex: 1; }
  kbd { font-family: Arial, Helvetica, sans-serif; font-size: 11px; padding: 2px 6px; color: var(--faint); border: 1px solid var(--border); border-radius: 5px; }

  .main-col { flex: 1; min-width: 0; display: flex; flex-direction: column; min-height: 100dvh; }
  .top { position: sticky; top: 0; z-index: 20; height: 52px; display: flex; align-items: center; gap: 4px; padding: 0 12px; background: var(--bg); }
  .menu-btn { display: none; }
  .top-title { display: none; padding: 6px 8px; border-radius: 8px; text-decoration: none; color: var(--text); font-size: 18px; font-weight: 400; }
  .top-title:hover { background: var(--hover); }
  .side-footer { margin-top: auto; padding: 16px 10px max(12px, env(safe-area-inset-bottom)); display: flex; align-items: center; justify-content: flex-start; }

  .page { flex: 1; padding: clamp(72px, 15vh, 160px) 32px 80px; }
  .page.menu-route { padding-top: clamp(40px, 8vh, 88px); }
  .page.home-route { padding: 0 32px 96px; }
  .col { max-width: 768px; margin: 0 auto; }
  .title { margin: 0 0 32px; text-align: center; font-family: Arial, Helvetica, sans-serif !important; font-size: 26px; font-weight: 400; letter-spacing: -.025em; line-height: 1.25; }
  .search { display: flex; align-items: center; gap: 12px; height: 52px; padding: 0 14px 0 20px; border-radius: 28px; background: var(--composer); box-shadow: var(--shadow-composer); color: var(--muted); cursor: text; border: 1px solid var(--border); transition: border-color .12s, background .12s; }
  .search:focus-within { border-color: var(--border-strong); background: var(--bg); }
  .search input { flex: 1; min-width: 0; border: 0; outline: none; background: none; font-size: 16px; color: var(--text); }
  .search input::placeholder { color: var(--faint); }
  .search input::-webkit-search-cancel-button { display: none; }
  .search kbd { margin-right: 4px; }
  .clear { width: 28px; height: 28px; border-radius: 50%; border: 0; background: none; color: var(--muted); display: grid; place-items: center; cursor: pointer; }
  .clear:hover { background: var(--hover); color: var(--text); }
  .meta { display: flex; justify-content: center; align-items: baseline; gap: 12px; flex-wrap: wrap; min-height: 20px; margin: 18px 2px 42px; font-size: 12px; color: var(--muted); }
  .meta b { font-weight: 400; color: var(--muted); }
  .hint-line { color: var(--faint); }
  .grid { list-style: none; margin: 0 -6px; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(116px, 1fr)); gap: 8px; }
  .tile { width: 100%; height: 92px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 8px; border: 0; border-radius: 12px; background: none; cursor: pointer; color: var(--text); transition: background .12s; }
  .tile:hover { background: var(--hover); }
  .tile:active .glyph { transform: scale(.9); }
  .glyph { width: 40px; height: 40px; display: grid; place-items: center; transition: transform .15s; }
  .glyph :global(svg) { width: 36px; height: 36px; }
  .name { max-width: 100%; font-size: 12px; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tile.copied { background: var(--active); }
  .tile.copied .name { color: var(--text); font-weight: 600; animation: fade .2s; }
  .skeleton { cursor: default; animation: pulse 1.4s ease-in-out infinite; }
  .skeleton .glyph { border-radius: 7px; background: var(--skeleton); }
  .sk-line { width: 55%; height: 8px; border-radius: 4px; background: var(--skeleton); }
  .state { padding: 40px 0; text-align: center; }
  .empty-results { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 0 18px 24px; }
  .state h2 { font-size: 17px; font-weight: 600; margin: 0 0 6px; }
  .state p { color: var(--muted); font-size: 14px; line-height: 1.55; margin: 0 auto 18px; max-width: 52ch; overflow-wrap: anywhere; }
  .primary { background: var(--text); color: var(--bg); border: 0; border-radius: 999px; padding: 9px 16px; font-size: 14px; font-weight: 500; cursor: pointer; }
  .primary:hover { opacity: .85; }

  .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--toast-bg); color: var(--toast-text); font-size: 14px; padding: 10px 16px; border-radius: 999px; display: flex; align-items: center; gap: 8px; animation: rise .2s ease-out; z-index: 50; box-shadow: var(--shadow-pop); white-space: nowrap; max-width: calc(100vw - 32px); overflow: hidden; text-overflow: ellipsis; }
  .overlay { position: fixed; inset: 0; background: var(--overlay); display: grid; place-items: center; padding: 16px; z-index: 60; animation: fade .15s; }
  .dialog { background: var(--surface); border-radius: 18px; width: min(560px, 100%); padding: 24px; box-shadow: var(--shadow-pop); animation: pop .18s ease-out; }
  .dialog h2 { margin: 0 0 10px; font-size: 18px; font-weight: 600; }
  .err { color: var(--danger); font-size: 13px; margin: 0 0 8px; overflow-wrap: anywhere; }
  .hint { color: var(--muted); font-size: 14px; line-height: 1.5; margin: 0 0 14px; }
  .hint strong { color: var(--text); }
  textarea { width: 100%; height: 220px; resize: vertical; font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.55; border: 0; border-radius: 10px; padding: 12px; background: var(--field); color: var(--text); }
  .actions { display: flex; justify-content: flex-end; margin-top: 16px; }
  .scrim { display: none; }

  @media (max-width: 767px) {
    .side { display: flex; position: fixed; top: 0; left: 0; height: 100dvh; width: 280px; transform: translateX(-100%); transition: transform .22s ease; }
    .side.open { transform: none; box-shadow: var(--shadow-pop); }
    .scrim { display: block; position: fixed; inset: 0; background: var(--overlay); border: 0; z-index: 30; }
    .menu-btn { display: grid; }
    .close-mobile { display: grid; }
    .top-title { display: block; font-size: 17px; }
    .top { padding: 0 8px; }
    .page { padding: 56px 20px 64px; }
    .page.menu-route { padding: 28px 16px 64px; }
    .page.home-route { padding: 0 16px 64px; }
    .title { font-size: 24px; margin-bottom: 24px; }
    .hint-line { display: none; }
    .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 0 -4px; }
    .tile { height: 84px; }
  }
</style>
