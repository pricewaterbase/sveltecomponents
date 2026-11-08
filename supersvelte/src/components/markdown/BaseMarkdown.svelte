<script lang="ts">
 import Markdown, { defaultUrlTransform } from './Markdown.svelte';
 import sample from './sampleMarkdown.md?raw';
</script>
<Markdown children={sample} urlTransform={(url,key)=>key==='href'?undefined:defaultUrlTransform(url)}/>
