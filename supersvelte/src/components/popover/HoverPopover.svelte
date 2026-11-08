<script lang="ts">import Popover from './Popover.svelte';import Button from '../button/Button.svelte';</script>
<div class="stack">
 <Popover showOnHover>
  <Popover part="Trigger">{#snippet children(props)}<Button {...props} bind:ref={props.ref}>Static content</Button>{/snippet}</Popover>
  <Popover part="Content" width={320} side="right"><div class="content"><h3>Popover Title</h3><p>This is an example of a hoverable popover containing presentational content.</p><footer>Last updated June 20, 2025</footer></div></Popover>
 </Popover>
 <Popover showOnHover>
  <Popover part="Trigger">{#snippet children(props)}<Button {...props} bind:ref={props.ref}>Interactive content</Button>{/snippet}</Popover>
  <Popover part="Content" minWidth={230} side="right">{#snippet children({close})}<div class="content interactive"><h3 class="ih">Popover with actions</h3><p>Try using tab to navigate</p><div class="actions"><Button variant="soft" onClick={close}>Cancel</Button><Button onClick={close}>Confirm</Button></div></div>{/snippet}</Popover>
 </Popover>
</div>
<style>.stack{display:flex;flex-direction:column;align-items:flex-start;gap:16px;}.content{padding:12px;}h3{margin:0 0 2px;font-size:16px;font-weight:600;}p{font-size:14px;color:var(--color-text-secondary);margin:0;}footer{margin-top:8px;font-size:12px;color:var(--color-text-tertiary);}.content.interactive{padding:24px;}h3.ih{margin:0 0 4px;}.actions{margin-top:16px;display:flex;gap:8px;}</style>
