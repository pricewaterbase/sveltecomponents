<script lang="ts">
 import SegmentedControl from './SegmentedControl.svelte';
 let view = $state('all');
</script>

<div class="block-demo">
<SegmentedControl value={view} onChange={(next) => view = next} aria-label="Select view" block>
  <SegmentedControl part="Option" value="all">All</SegmentedControl>
  <SegmentedControl part="Option" value="failed">Failed</SegmentedControl>
  <SegmentedControl part="Option" value="successful">Successful</SegmentedControl>
</SegmentedControl>
</div>

<style>
.block-demo {width:420px;max-width:100%;text-align:center;padding:8px;border:1px dashed #8885;border-radius:8px;}
</style>
