<script lang="ts">
import Button from './Button.svelte';

</script>
<Button inert onClick={() => {throw new Error('Inert button activated');}}>Submit</Button>
