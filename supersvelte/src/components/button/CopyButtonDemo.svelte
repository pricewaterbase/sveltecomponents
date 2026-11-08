<script lang="ts">
 import CopyButton from './CopyButton.svelte';
 let value=$state('Tekst skopiowany z przycisku Svelte 5.');
</script>
<div class="row">
 <CopyButton copyValue={value}>{#snippet children({copied})}<span>{copied ? 'Copied!' : 'Copy text'}</span>{/snippet}</CopyButton>
 <CopyButton copyValue={value} uniform variant="outline" aria-label="Kopiuj tekst"/>
</div>
<textarea aria-label="Sprawdź schowek — wklej tutaj" placeholder="Wklej tutaj, aby sprawdzić schowek" rows="2"></textarea>
<style>.row{display:flex;align-items:center;gap:12px;}textarea{display:block;width:100%;max-width:340px;margin-top:16px;padding:10px 12px;border:1px solid #8884;border-radius:12px;background:transparent;color:inherit;font:inherit;font-size:12px;resize:vertical;}</style>
