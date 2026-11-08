<script lang="ts">
import Menu from './Menu.svelte';
let period = $state('any');
</script>

<Menu><Menu part="Trigger">{#snippet children(props)}<button class="trigger" {...props}>Radio menu <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.293 8.293a1 1 0 0 1 1.414 0L12 14.586l6.293-6.293a1 1 0 1 1 1.414 1.414l-7 7a1 1 0 0 1-1.414 0l-7-7a1 1 0 0 1 0-1.414Z"/></svg></button>{/snippet}</Menu><Menu part="Content" align="start" minWidth={190}><Menu part="RadioGroup" value={period} onChange={(v) => period = v}><Menu part="RadioItem" value="any">Any time</Menu><Menu part="RadioItem" value="today" disabled>Today</Menu><Menu part="RadioItem" value="last7d">Last 7 days</Menu><Menu part="RadioItem" value="last30d">Last 30 days</Menu><Menu part="RadioItem" value="last3m">Last 3 months</Menu></Menu></Menu></Menu><p class="value">Wartość: {period}</p>

<style>
.trigger{display:inline-flex;align-items:center;gap:16px;padding:10px 14px;border:0;border-radius:8px;background:transparent;color:inherit;font-size:15px;font-family:inherit;cursor:pointer;}.trigger:hover{background:#8881;}.trigger:focus-visible{outline:2px solid #777;outline-offset:3px;}
.value{font-size:12px;color:#888;margin:16px 0 0;}
</style>
