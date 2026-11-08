<script lang="ts">
import Menu from './Menu.svelte';
let grid = $state(true), labels = $state(false), shadows = $state(false);
</script>

<Menu><Menu part="Trigger">{#snippet children(props)}<button class="trigger" {...props}>Checkbox menu <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.293 8.293a1 1 0 0 1 1.414 0L12 14.586l6.293-6.293a1 1 0 1 1 1.414 1.414l-7 7a1 1 0 0 1-1.414 0l-7-7a1 1 0 0 1 0-1.414Z"/></svg></button>{/snippet}</Menu><Menu part="Content" minWidth={220}><Menu part="CheckboxItem" checked={grid} onCheckedChange={(v) => grid = v} onSelect={(e) => e.preventDefault()}>Show grid lines</Menu><Menu part="CheckboxItem" checked={labels} onCheckedChange={(v) => labels = v} onSelect={(e) => e.preventDefault()}>Display labels</Menu><Menu part="CheckboxItem" checked={shadows} onCheckedChange={(v) => shadows = v} onSelect={(e) => e.preventDefault()}>Enable shadows</Menu></Menu></Menu><p class="value">Grid: {grid ? 'on' : 'off'} · Labels: {labels ? 'on' : 'off'}</p>

<style>
.trigger{display:inline-flex;align-items:center;gap:16px;padding:10px 14px;border:0;border-radius:8px;background:transparent;color:inherit;font-size:15px;font-family:inherit;cursor:pointer;}.trigger:hover{background:#8881;}.trigger:focus-visible{outline:2px solid #777;outline-offset:3px;}
.value{font-size:12px;color:#888;margin:16px 0 0;}
</style>
