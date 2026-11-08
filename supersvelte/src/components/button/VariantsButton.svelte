<script lang="ts">
import Button from './Button.svelte';

</script>
<div class="row">{#each (['solid','soft','outline','ghost'] as const) as variant}<Button {variant}>{variant}</Button>{/each}</div>
<style>
.row{display:flex;flex-wrap:wrap;gap:8px;}
</style>
