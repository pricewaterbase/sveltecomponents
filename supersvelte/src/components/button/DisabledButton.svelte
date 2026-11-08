<script lang="ts">
import Button from './Button.svelte';

</script>
<Button disabled onClick={() => {throw new Error('Disabled button activated');}}>Submit</Button>
