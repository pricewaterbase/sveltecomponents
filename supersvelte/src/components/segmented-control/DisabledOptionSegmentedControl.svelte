<script lang="ts">
 import SegmentedControl from './SegmentedControl.svelte';
 let view = $state('all');
</script>

<SegmentedControl value={view} onChange={(next) => view = next} aria-label="Select view" >
  <SegmentedControl part="Option" value="all">All</SegmentedControl>
  <SegmentedControl part="Option" value="failed">Failed</SegmentedControl>
  <SegmentedControl part="Option" value="successful" disabled>Successful</SegmentedControl>
</SegmentedControl>

