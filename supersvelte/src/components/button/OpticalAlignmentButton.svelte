<script lang="ts">
import Button from './Button.svelte';

</script>
<div class="stack"><div class="frame"><p>Default gutters</p><Button variant="ghost">Ghost button</Button></div><div class="frame"><p>opticallyAlign="start"</p><Button variant="ghost" opticallyAlign="start">Ghost button</Button></div></div>
<style>
.stack{display:flex;flex-direction:column;gap:12px;}.frame{border:1px dashed #8885;border-radius:8px;padding:16px 24px;}p{font-size:13px;color:#888;margin:0 0 8px;}
</style>
