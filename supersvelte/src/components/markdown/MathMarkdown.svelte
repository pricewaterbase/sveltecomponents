<script lang="ts">
 import Markdown from './Markdown.svelte';
 import sample from './sampleLatex.md?raw';
 import 'katex/dist/katex.min.css';
</script>
<Markdown includeMath children={sample}/>
