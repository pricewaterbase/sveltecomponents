<script lang="ts">
 import EmptyMessage from './EmptyMessage.svelte';
 // Learn more has no destination in the source: it toggles inline details, never navigates.
 let open = $state(false);
</script>
<EmptyMessage>
 <!-- Missing original Beta SVG: supplied typographic β preserved. -->
 <EmptyMessage part="Icon" color="warning"><span class="beta" aria-hidden="true">β</span></EmptyMessage>
 <EmptyMessage part="Title">o1-preview is in beta</EmptyMessage>
 <EmptyMessage part="Description">System instructions and model configuration are not available yet. Responses may take longer.</EmptyMessage>
 <EmptyMessage part="ActionRow" className="text-sm"><button class="TextLink" type="button" aria-expanded={open} onclick={() => (open = !open)}>Learn more <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path fill-rule="evenodd" d="M15 5a1 1 0 1 1 0-2h5a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0V6.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L17.586 5H15ZM4 7a3 3 0 0 1 3-3h3a1 1 0 1 1 0 2H7a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 1 1 2 0v3a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7Z" clip-rule="evenodd"/>
  </svg></button></EmptyMessage>
 {#if open}<EmptyMessage part="Description">Demo: brak adresu docelowego — Learn more nie przekierowuje.</EmptyMessage>{/if}
</EmptyMessage>
<style>
/* Approximation: TextLink and its CSS were not supplied. No navigation. */
.beta{font-size:24px;line-height:1;font-weight:600;}
.TextLink{display:inline-flex;align-items:center;gap:4px;border:0;padding:0;background:transparent;color:var(--color-text);font:inherit;font-size:14px;cursor:pointer;}
.TextLink:hover{text-decoration:underline;}
.TextLink:focus-visible{outline:2px solid var(--color-ring,#4085ff);outline-offset:3px;border-radius:4px;}
</style>
