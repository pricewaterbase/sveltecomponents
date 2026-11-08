<script lang="ts">
import Button from './Button.svelte';
let count = $state(0);
</script>
<Button onClick={() => count++}>Submit</Button><span class="count" aria-live="polite">{count ? `Kliknięcia: ${count}` : ''}</span>
<style>
.count{font-size:12px;color:#888;margin-left:12px;}
</style>
