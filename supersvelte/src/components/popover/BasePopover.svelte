<script lang="ts">
 import Popover from './Popover.svelte';import Button from '../button/Button.svelte';
</script>
<Popover>
 <Popover part="Trigger">{#snippet children(props)}<Button {...props} bind:ref={props.ref}>Generate</Button>{/snippet}</Popover>
 <Popover part="Content" side="right"><textarea placeholder="Describe what you're using the model for, and we'll generate system instructions." style="width:100%;height:80px;background:none;padding:8px 12px 12px;border:0;font-size:14px;line-height:20px;resize:none;outline:0;color:inherit;font-family:inherit;"></textarea><div class="bar"><div class="beta"><span aria-hidden="true">β</span>Free beta</div><Button size="xs" loading={false} type="submit">Create</Button></div></Popover>
</Popover>
<style>.bar{display:flex;align-items:center;justify-content:space-between;padding:0 8px 8px;}.beta{display:flex;align-items:center;gap:4px;font-weight:400;font-size:14px;color:var(--color-text-tertiary);}.beta span{width:16px;height:16px;line-height:16px;text-align:center;}</style>
