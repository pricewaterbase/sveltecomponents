<script lang="ts">
import Menu from './Menu.svelte';
let { onAction }: { onAction?: (message: string) => void } = $props();
</script>

<Menu><Menu part="Trigger">{#snippet children(props)}<button class="trigger" {...props}>Options <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.293 8.293a1 1 0 0 1 1.414 0L12 14.586l6.293-6.293a1 1 0 1 1 1.414 1.414l-7 7a1 1 0 0 1-1.414 0l-7-7a1 1 0 0 1 0-1.414Z"/></svg></button>{/snippet}</Menu><Menu part="Content" minWidth={180}><Menu part="Item" onSelect={() => onAction?.('Wybrano: Edit')}>Edit</Menu><Menu part="Item" onSelect={() => onAction?.('Wybrano: Duplicate')}>Duplicate</Menu><Menu part="Separator"/><Menu part="Sub"><Menu part="SubTrigger">More</Menu><Menu part="SubContent"><Menu part="Item" onSelect={() => onAction?.('Wybrano: Move to project')}>Move to project…</Menu><Menu part="Item" onSelect={() => onAction?.('Wybrano: Move to folder')}>Move to folder…</Menu><Menu part="Separator"/><Menu part="Item" onSelect={() => onAction?.('Wybrano: Advanced options')}>Advanced options…</Menu></Menu></Menu><Menu part="Separator"/><Menu part="Item" onSelect={() => onAction?.('Wybrano: Share')}>Share</Menu><Menu part="Item" onSelect={() => onAction?.('Wybrano: Delete')}>Delete</Menu></Menu></Menu>

<style>
.trigger{display:inline-flex;align-items:center;gap:16px;padding:10px 14px;border:0;border-radius:8px;background:transparent;color:inherit;font-size:15px;font-family:inherit;cursor:pointer;}.trigger:hover{background:#8881;}.trigger:focus-visible{outline:2px solid #777;outline-offset:3px;}
</style>
