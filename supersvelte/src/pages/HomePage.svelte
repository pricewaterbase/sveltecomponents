<script lang="ts">
  type Target = 'icons' | 'menu';
  let { onNavigate }: { onNavigate: (e: MouseEvent, to: Target) => void } = $props();
</script>

<div class="home" data-testid="page-home">
  <section class="hero">
    <p class="eyebrow">supersvelte</p>
    <h1>Interfejsy, które po prostu działają.</h1>
    <p class="lead">Spokojne, dopracowane komponenty dla Svelte 5. Bez ciężaru, bez zbędnych decyzji.</p>
    <div class="cta">
      <a class="pill" href="/icons" onclick={(e) => onNavigate(e, 'icons')} data-testid="link-home-icons">Zacznij od ikon</a>
      <a class="quiet" href="/menu" onclick={(e) => onNavigate(e, 'menu')} data-testid="link-home-library">Zobacz bibliotekę</a>
    </div>
  </section>

  <section class="mark" aria-hidden="true">
    <span class="word">supersvelte</span>
    <span class="disc d1"></span><span class="disc d2"></span><span class="disc d3"></span>
  </section>

  <section class="statement">
    <h2>Mniej szumu.<br />Więcej produktu.</h2>
    <div class="cols">
      <div><h3>Svelte 5</h3><p>Runes, snippety i czysty TypeScript. Kod, który czyta się jak dokumentacja.</p></div>
      <div><h3>Jasny i ciemny</h3><p>Każdy element szanuje motyw systemu i Twój wybór.</p></div>
      <div><h3>Kopiuj i dostosuj</h3><p>Bez zależności do instalowania. Bierzesz kod i jest Twój.</p></div>
    </div>
  </section>

  <section class="closing">
    <p class="big">Zbuduj coś prostego.</p>
    <a class="pill" href="/icons" onclick={(e) => onNavigate(e, 'icons')} data-testid="link-home-icons-bottom">Otwórz bibliotekę ikon</a>
  </section>
</div>

<style>
  .home { max-width: 1080px; margin: 0 auto; }
  .hero { min-height: calc(100dvh - 52px); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding-bottom: 12vh; }
  .eyebrow { margin: 0 0 28px; font-size: 14px; color: var(--muted); }
  h1 { margin: 0; max-width: 16ch; font-size: clamp(34px, 5vw, 60px); font-weight: 400; line-height: 1.08; letter-spacing: -.035em; }
  .lead { margin: 28px 0 40px; max-width: 42ch; font-size: 17px; line-height: 1.55; color: var(--muted); }
  .cta { display: flex; gap: 20px; align-items: center; flex-wrap: wrap; justify-content: center; }
  .pill { display: inline-flex; align-items: center; height: 44px; padding: 0 22px; border-radius: 999px; background: var(--text); color: var(--bg); font-size: 15px; text-decoration: none; transition: opacity .15s; }
  .pill:hover { opacity: .85; }
  .quiet { font-size: 15px; color: var(--text); text-decoration: none; border-bottom: 1px solid var(--border-strong); padding-bottom: 2px; }
  .quiet:hover { border-color: var(--text); }

  .mark { position: relative; height: clamp(320px, 52vw, 560px); border-radius: 28px; background: var(--field); overflow: hidden; display: grid; place-items: center; }
  .word { position: relative; z-index: 2; font-size: clamp(48px, 11vw, 148px); letter-spacing: -.06em; color: var(--text); }
  .disc { position: absolute; border-radius: 50%; border: 1px solid var(--border-strong); }
  .d1 { width: 70%; aspect-ratio: 1; left: -18%; top: 30%; }
  .d2 { width: 46%; aspect-ratio: 1; right: -8%; top: -24%; background: var(--surface); border-color: var(--divider); }
  .d3 { width: 14%; aspect-ratio: 1; right: 22%; bottom: 10%; background: var(--text); border: 0; }

  .statement { padding: 160px 0 0; }
  h2 { margin: 0 0 88px; font-size: clamp(30px, 4vw, 48px); font-weight: 400; line-height: 1.1; letter-spacing: -.03em; }
  .cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px; border-top: 1px solid var(--divider); padding-top: 32px; }
  h3 { margin: 0 0 10px; font-size: 16px; font-weight: 500; }
  .cols p { margin: 0; font-size: 15px; line-height: 1.55; color: var(--muted); }

  .closing { padding: 200px 0 120px; display: flex; flex-direction: column; align-items: center; gap: 36px; text-align: center; }
  .big { margin: 0; font-size: clamp(30px, 4vw, 48px); letter-spacing: -.03em; }
  @media (max-width: 767px) {
    .lead { font-size: 16px; }
    .statement { padding-top: 96px; }
    h2 { margin-bottom: 48px; }
    .cols { grid-template-columns: 1fr; gap: 28px; }
    .closing { padding: 120px 0 64px; }
  }
</style>
