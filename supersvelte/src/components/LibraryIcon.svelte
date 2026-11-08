<script lang="ts">
  import { interfaceIcons } from '../lib/interface-icons';
  let { name, size = 18 }: { name: keyof typeof interfaceIcons; size?: number } = $props();
</script>

<span class="library-icon" style:width="{size}px" style:height="{size}px" aria-hidden="true">
  {@html interfaceIcons[name]}
</span>

<style>
  .library-icon { display: inline-flex; flex: none; align-items: center; justify-content: center; }
  .library-icon :global(svg) { width: 100%; height: 100%; }
</style>
