<script lang="ts">
import Menu from './Menu.svelte';
let { onAction }: { onAction?: (message: string) => void } = $props();
</script>

<Menu><Menu part="Trigger">{#snippet children(props)}<button class="trigger" {...props}>Sample menu <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.293 8.293a1 1 0 0 1 1.414 0L12 14.586l6.293-6.293a1 1 0 1 1 1.414 1.414l-7 7a1 1 0 0 1-1.414 0l-7-7a1 1 0 0 1 0-1.414Z"/></svg></button>{/snippet}</Menu><Menu part="Content" width={210} minWidth={210}><Menu part="Item"><p class="name">Sam Smith</p><p class="secondary">sam.smith@gmail.com</p></Menu><Menu part="Separator"/><Menu part="Item" onSelect={() => onAction?.("Wybrano: Your profile")}>Your profile</Menu><Menu part="Item" onSelect={() => onAction?.("Wybrano: Terms & policies")}>Terms &amp; policies</Menu><Menu part="Item" disabled onSelect={() => {}}>Feature flags</Menu><Menu part="Separator"/><Menu part="Item" onSelect={() => onAction?.('Wybrano: Logout')}>Logout</Menu></Menu></Menu>

<style>
.trigger{display:inline-flex;align-items:center;gap:16px;padding:10px 14px;border:0;border-radius:8px;background:transparent;color:inherit;font-size:15px;font-family:inherit;cursor:pointer;}.trigger:hover{background:#8881;}.trigger:focus-visible{outline:2px solid #777;outline-offset:3px;}
.name{font-weight:400;margin:0;}.secondary{font-size:12px;color:var(--color-text);opacity:0.5;margin:0;}
</style>
