<script lang="ts">
import Button from './Button.svelte';
import { onMount } from 'svelte';
let open=$state(false);
const id=$props.id();
onMount(()=>{
 const close=(event:KeyboardEvent)=>{if(event.key==='Escape')open=false;};
 const outside=(event:PointerEvent)=>{if(!(event.target as Element).closest('.selected-demo'))open=false;};
 document.addEventListener('keydown',close);document.addEventListener('pointerdown',outside);
 return ()=>{document.removeEventListener('keydown',close);document.removeEventListener('pointerdown',outside);};
});
</script>
<div class="selected-demo">
 <Button variant="ghost" selected={open} aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => open = !open}>Click to open</Button>
 {#if open}<div class="panel" {id} role="dialog" aria-label="Selected button"><span>Button should look selected</span></div>{/if}
</div>
<style>
.selected-demo{position:relative;display:inline-block;}.panel{position:absolute;top:calc(100% + 5px);left:0;padding:16px;border:1px solid #8883;border-radius:12px;background:var(--demo-surface,#fff);box-shadow:0 6px 24px #0001;white-space:nowrap;z-index:5;font-size:13px;color:#888;}
</style>
