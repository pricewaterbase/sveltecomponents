<script lang="ts">
 import SegmentedControl from './SegmentedControl.svelte';
 let value = $state('1');
</script>
<div class="scroll-demo"><div class="flex">
 <SegmentedControl {value} onChange={(next) => value = next} aria-label="Horrible control">
  <SegmentedControl part="Option" value="1">Weird</SegmentedControl>
  <SegmentedControl part="Option" value="2">use</SegmentedControl>
  <SegmentedControl part="Option" value="3">of this</SegmentedControl>
  <SegmentedControl part="Option" value="4">component</SegmentedControl>
  <SegmentedControl part="Option" value="5">but showing</SegmentedControl>
  <SegmentedControl part="Option" value="6">it can</SegmentedControl>
  <SegmentedControl part="Option" value="7">become</SegmentedControl>
  <SegmentedControl part="Option" value="8">scrollable</SegmentedControl>
 </SegmentedControl>
</div></div>
<style>
.scroll-demo {max-width:min(400px,100%);min-width:0;}
.flex {display:flex;min-width:0;max-width:100%;}
</style>
