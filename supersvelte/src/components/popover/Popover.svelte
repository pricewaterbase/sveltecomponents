<script module lang="ts">
  import {getContext, flushSync, type Snippet} from 'svelte';
  import {computePosition, autoUpdate, offset, flip, shift, size as floatingSize, hide, type Placement} from '@floating-ui/dom';
  export type PopoverProps={
    part?:'Root'|'Trigger'|'Content'; children?:Snippet<[any]>;
    open?:boolean; onOpenChange?:(open:boolean)=>void;
    showOnHover?:boolean; hoverOpenDelay?:number;
    onPointerDown?:(event:PointerEvent)=>void; onClick?:(event:MouseEvent)=>void;
    avoidCollisions?:boolean; width?:number|'auto'; minWidth?:number|'auto'; maxWidth?:number;
    side?:'top'|'bottom'|'left'|'right'; sideOffset?:number;
    align?:'start'|'center'|'end'; alignOffset?:number;
    translucent?:boolean; className?:string; autoFocus?:boolean;
  };
  export type PopoverContextValue={
    readonly open:boolean; setOpen:(next:boolean)=>void;
    readonly shake:boolean; setShake:(next:boolean)=>void;
    readonly showOnHover:boolean; readonly temporarilyPreventClickToClose:boolean;
    onTriggerEnter:()=>void; onTriggerLeave:()=>void;
    hoverOpenFocusedWithTab:{current:boolean}; isPointerInTransitRef:{current:boolean};
    triggerRef:{current:HTMLElement|null}; contentRef:{current:HTMLDivElement|null};
    skipRestore:boolean; readonly id:string;
  };
  const CONTEXT=Symbol('Popover');
  const closeStack:PopoverContextValue[]=[];
  export function usePopoverContext(){const context=getContext<PopoverContextValue>(CONTEXT);if(!context)throw new Error('Popover components must be wrapped in <Popover />');return context;}
  export function usePopoverClose(){const context=usePopoverContext();return ()=>context.setOpen(false);}
  export function usePopoverShake(){const context=usePopoverContext();return ()=>{flushSync(()=>context.setShake(false));requestAnimationFrame(()=>context.setShake(true));};}
  export function usePopoverController(){return {close:usePopoverClose(),shake:usePopoverShake()};}
  function focusableElements(root:HTMLElement){return Array.from(root.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input:not(:disabled):not([type="hidden"]),textarea:not(:disabled),select:not(:disabled),[tabindex]:not([tabindex="-1"]),[contenteditable="true"]')).filter(node=>node.getClientRects().length && !node.closest('[inert]') && node.getAttribute('aria-hidden')!=='true');}
// Based on https://github.com/radix-ui/primitives/blob/main/packages/react/tooltip/src/tooltip.tsx

export type Polygon = Point[]
type Point = { x: number; y: number }
type Side = "left" | "right" | "top" | "bottom"

export const createPointerIntentArea = (event: PointerEvent, hoverTarget: HTMLElement) => {
  const currentTarget = event.currentTarget as HTMLElement
  const exitPoint = { x: event.clientX, y: event.clientY }
  const exitSide = getExitSideFromRect(exitPoint, currentTarget.getBoundingClientRect())
  const paddedExitPoints = getPaddedExitPoints(exitPoint, exitSide)
  const hoverTargetPoints = getPointsFromRect(hoverTarget.getBoundingClientRect())
  const graceArea = getHull([...paddedExitPoints, ...hoverTargetPoints])
  return graceArea
}

function getExitSideFromRect(point: Point, rect: DOMRect): Side {
  const top = Math.abs(rect.top - point.y)
  const bottom = Math.abs(rect.bottom - point.y)
  const right = Math.abs(rect.right - point.x)
  const left = Math.abs(rect.left - point.x)

  switch (Math.min(top, bottom, right, left)) {
    case left:
      return "left"
    case right:
      return "right"
    case top:
      return "top"
    case bottom:
      return "bottom"
    default:
      throw new Error("unreachable")
  }
}

function getPaddedExitPoints(exitPoint: Point, exitSide: Side, padding = 5) {
  const paddedExitPoints: Point[] = []
  switch (exitSide) {
    case "top":
      paddedExitPoints.push(
        { x: exitPoint.x - padding, y: exitPoint.y + padding },
        { x: exitPoint.x + padding, y: exitPoint.y + padding },
      )
      break
    case "bottom":
      paddedExitPoints.push(
        { x: exitPoint.x - padding, y: exitPoint.y - padding },
        { x: exitPoint.x + padding, y: exitPoint.y - padding },
      )
      break
    case "left":
      paddedExitPoints.push(
        { x: exitPoint.x + padding, y: exitPoint.y - padding },
        { x: exitPoint.x + padding, y: exitPoint.y + padding },
      )
      break
    case "right":
      paddedExitPoints.push(
        { x: exitPoint.x - padding, y: exitPoint.y - padding },
        { x: exitPoint.x - padding, y: exitPoint.y + padding },
      )
      break
  }
  return paddedExitPoints
}

function getPointsFromRect(rect: DOMRect) {
  const { top, right, bottom, left } = rect
  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ]
}

// Determine if a point is inside of a polygon.
export function isPointInPolygon(point: Point, polygon: Polygon) {
  const { x, y } = point
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const ii = polygon[i]!
    const jj = polygon[j]!
    const xi = ii.x
    const yi = ii.y
    const xj = jj.x
    const yj = jj.y

    // prettier-ignore
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside
  }

  return inside
}

// Returns a new array of points representing the convex hull of the given set of points.
// https://www.nayuki.io/page/convex-hull-algorithm
function getHull<P extends Point>(points: Readonly<Array<P>>): Array<P> {
  const newPoints: Array<P> = points.slice()
  newPoints.sort((a: Point, b: Point) => {
    if (a.x < b.x) return -1
    else if (a.x > b.x) return +1
    else if (a.y < b.y) return -1
    else if (a.y > b.y) return +1
    else return 0
  })
  return getHullPresorted(newPoints)
}

// Returns the convex hull, assuming that each points[i] <= points[i + 1]. Runs in O(n) time.
function getHullPresorted<P extends Point>(points: Readonly<Array<P>>): Array<P> {
  if (points.length <= 1) return points.slice()

  const upperHull: Array<P> = []
  for (let i = 0; i < points.length; i++) {
    const p = points[i]!
    while (upperHull.length >= 2) {
      const q = upperHull[upperHull.length - 1]!
      const r = upperHull[upperHull.length - 2]!
      if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) upperHull.pop()
      else break
    }
    upperHull.push(p)
  }
  upperHull.pop()

  const lowerHull: Array<P> = []
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i]!
    while (lowerHull.length >= 2) {
      const q = lowerHull[lowerHull.length - 1]!
      const r = lowerHull[lowerHull.length - 2]!
      if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) lowerHull.pop()
      else break
    }
    lowerHull.push(p)
  }
  lowerHull.pop()

  if (
    upperHull.length === 1 &&
    lowerHull.length === 1 &&
    upperHull[0]!.x === lowerHull[0]!.x &&
    upperHull[0]!.y === lowerHull[0]!.y
  ) {
    return upperHull
  } else {
    return upperHull.concat(lowerHull)
  }
}

</script>

<script lang="ts">
  import {setContext, onDestroy, tick, untrack} from 'svelte';
  let {part='Root',children,open:controlledOpen,onOpenChange,showOnHover=false,hoverOpenDelay=150,
    onPointerDown,onClick,avoidCollisions=true,width,minWidth,maxWidth,side='bottom',sideOffset=8,
    align,alignOffset,translucent=false,className,autoFocus=true}:PopoverProps=$props();
  const role=(()=>part)();
  const id=$props.id();
  let internalOpen=$state(false),shaking=$state(false),preventClick=$state(false);
  let trigger=$state<HTMLElement|null>(null),content=$state<HTMLDivElement|null>(null);
  let positioner=$state<HTMLDivElement|null>(null);
  let hoverFocused=false,inTransit=false;
  let openTimer:ReturnType<typeof setTimeout>|undefined;
  let protectionTimer:ReturnType<typeof setTimeout>|undefined;
  let blurTimer:ReturnType<typeof setTimeout>|undefined;
  let moveOpened=false;
  const own:PopoverContextValue={
    get open(){return controlledOpen??internalOpen;},
    get shake(){return shaking;},setShake:(next)=>{shaking=next;},
    get showOnHover(){return showOnHover;},get temporarilyPreventClickToClose(){return preventClick;},
    triggerRef:{get current(){return trigger;},set current(node){trigger=node;}},
    contentRef:{get current(){return content;},set current(node){content=node;}},
    hoverOpenFocusedWithTab:{get current(){return hoverFocused;},set current(next){hoverFocused=next;}},
    isPointerInTransitRef:{get current(){return inTransit;},set current(next){inTransit=next;}},
    skipRestore:false,get id(){return id;},
    setOpen(next){
      clearTimeout(openTimer);
      if(own.open===next)return;
      if(!next){shaking=false;if(showOnHover && hoverFocused)trigger?.focus();hoverFocused=false;}
      onOpenChange?.(next);internalOpen=next;
      if(showOnHover){preventClick=next;clearTimeout(protectionTimer);if(next)protectionTimer=setTimeout(()=>preventClick=false,500);}
    },
    onTriggerEnter(){clearTimeout(openTimer);openTimer=setTimeout(()=>own.setOpen(true),hoverOpenDelay);},
    onTriggerLeave(){clearTimeout(openTimer);}
  };
  if(role==='Root')setContext(CONTEXT,own);
  const context=role==='Root'?own:usePopoverContext();
  function maybePrevent(event:MouseEvent|PointerEvent){if((event.currentTarget as HTMLElement).nodeName.toLowerCase()!=='a' && context.temporarilyPreventClickToClose){event.preventDefault();event.stopPropagation();}}
  const triggerProps={
    get ref(){return context.triggerRef.current;},set ref(node:HTMLElement|null){context.triggerRef.current=node;},
    get id(){return `${context.id}-trigger`;},'aria-haspopup':'dialog' as const,
    get 'aria-expanded'(){return context.open;},get 'aria-controls'(){return context.open?`${context.id}-content`:undefined;},
    get 'data-state'(){return context.open?'open':'closed';},
    onpointerdown:(event:PointerEvent)=>{context.triggerRef.current=event.currentTarget as HTMLElement;maybePrevent(event);onPointerDown?.(event);},
    onClick:(event:MouseEvent)=>{context.triggerRef.current=event.currentTarget as HTMLElement;maybePrevent(event);onClick?.(event);if(!event.defaultPrevented)context.setOpen(!context.open);},
    onpointermove:(event:PointerEvent)=>{context.triggerRef.current=event.currentTarget as HTMLElement;if(!context.showOnHover||event.pointerType==='touch')return;if(!moveOpened&&!context.isPointerInTransitRef.current){context.onTriggerEnter();moveOpened=true;}},
    onpointerleave:()=>{if(!context.showOnHover||!moveOpened)return;context.onTriggerLeave();moveOpened=false;},
    onfocus:(event:FocusEvent)=>{context.triggerRef.current=event.currentTarget as HTMLElement;if(context.showOnHover)context.setOpen(true);},
    onblur:()=>{if(context.showOnHover){clearTimeout(blurTimer);blurTimer=setTimeout(()=>{if(!context.contentRef.current?.contains(document.activeElement))context.setOpen(false);},50);}}
  };
  let mounted=$state(false),phase=$state(''),active=$state(false),interrupted=$state(false);
  let x=$state(0),y=$state(0),availableWidth=$state(0),availableHeight=$state(0),hidden=$state(false);
  let positioned=$state(false);
  let actualSide=$state('bottom'),origin=$state('center top');
  let grace=$state<Polygon|null>(null);
  function removeGrace(){grace=null;context.isPointerInTransitRef.current=false;}
  function makeGrace(event:PointerEvent,target:HTMLElement){if(event.pointerType==='touch')return;grace=createPointerIntentArea(event,target);context.isPointerInTransitRef.current=true;}
  function portal(node:HTMLElement){document.body.appendChild(node);return {destroy(){node.remove();}};}
  function attach(node:HTMLDivElement){context.contentRef.current=node;return {destroy(){if(context.contentRef.current===node)context.contentRef.current=null;}};}
  const cssSize=(v:number|string|undefined)=>typeof v==='number'?`${v}px`:v;
  const dimensions=$derived([
    width!==undefined?`--popover-width:${cssSize(width)}`:'',minWidth!==undefined?`--popover-min-width:${cssSize(minWidth)}`:'',maxWidth!==undefined?`--popover-max-width:${maxWidth}px`:'',
    `--radix-popover-content-available-width:${Math.max(0,availableWidth)}px`,
    `--radix-popover-content-available-height:${Math.max(0,availableHeight)}px`,
    `--radix-popover-content-transform-origin:${origin}`
  ].filter(Boolean).join(';'));
  $effect(()=>{
    if(role!=='Content')return;
    const opened=context.open;
    let timer:ReturnType<typeof setTimeout>|undefined,frame=0,frame2=0,cancelled=false;
    untrack(()=>{
      if(opened){
        interrupted=phase==='exiting';mounted=true;phase='entering';active=false;
        void tick().then(()=>{if(cancelled)return;frame=requestAnimationFrame(()=>{frame2=requestAnimationFrame(()=>{active=true;});});});
        timer=setTimeout(()=>{phase='';active=false;interrupted=false;},600);
      }else if(mounted){
        phase='exiting';active=false;
        frame=requestAnimationFrame(()=>{active=true;});
        timer=setTimeout(()=>{mounted=false;phase='';active=false;interrupted=false;},300);
      }
    });
    return ()=>{cancelled=true;clearTimeout(timer);cancelAnimationFrame(frame);cancelAnimationFrame(frame2);};
  });
  $effect(()=>{
    if(role!=='Content'||!mounted)return;
    positioned=false;
    const anchor=context.triggerRef.current,panel=positioner;
    if(!anchor||!panel)return;
    const placement=(side+(align&&align!=='center'?`-${align}`:'')) as Placement;
    let alive=true;
    const update=()=>{
      void computePosition(anchor,panel,{strategy:'fixed',placement,middleware:[
        offset({mainAxis:sideOffset,alignmentAxis:alignOffset??(align==='center'?0:-5)}),
        ...(avoidCollisions?[flip({padding:20}),shift({padding:20})]:[]),
        floatingSize({padding:20,apply({availableWidth:aw,availableHeight:ah}){if(alive){availableWidth=aw;availableHeight=ah;}}}),hide({padding:20})
      ]}).then(result=>{if(!alive)return;x=result.x;y=result.y;positioned=Number.isFinite(x)&&Number.isFinite(y);actualSide=result.placement.split('-')[0];hidden=!!result.middlewareData.hide?.referenceHidden;const edge=actualSide==='top'?'bottom':actualSide==='bottom'?'top':actualSide==='left'?'right':'left';const alignment=align==='start'?'left':align==='end'?'right':'center';origin=actualSide==='top'||actualSide==='bottom'?`${alignment} ${edge}`:`${edge} ${align==='start'?'top':align==='end'?'bottom':'center'}`;});
    };
    const cleanup=autoUpdate(anchor,panel,update);update();
    return ()=>{alive=false;positioned=false;cleanup();};
  });
  $effect(()=>{
    if(role!=='Content'||!context.open||!positioned||!context.contentRef.current)return;
    const panel=context.contentRef.current;
    if(autoFocus&&!context.showOnHover&&!panel.contains(document.activeElement))panel.focus({preventScroll:true});
  });
  $effect(()=>{
    if(role!=='Content'||!context.open)return;
    context.skipRestore=false;closeStack.push(context);
    const outside=(event:PointerEvent)=>{
      if(closeStack.at(-1)!==context)return;
      const path=event.composedPath();
      if(closeStack.some(item=>(item.triggerRef.current&&path.includes(item.triggerRef.current))||(item.contentRef.current&&path.includes(item.contentRef.current))))return;
      context.skipRestore=true;context.setOpen(false);
    };
    const focusOutside=(event:FocusEvent)=>{
      if(closeStack.at(-1)!==context)return;
      const target=event.target as globalThis.Node;
      if(context.triggerRef.current?.contains(target)||context.contentRef.current?.contains(target))return;
      context.skipRestore=true;context.setOpen(false);
    };
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!event.defaultPrevented&&closeStack.at(-1)===context){event.preventDefault();context.setOpen(false);}};
    document.addEventListener('pointerdown',outside,true);document.addEventListener('focusin',focusOutside);document.addEventListener('keydown',escape);
    return ()=>{
      const index=closeStack.lastIndexOf(context);if(index>=0)closeStack.splice(index,1);
      document.removeEventListener('pointerdown',outside,true);document.removeEventListener('focusin',focusOutside);document.removeEventListener('keydown',escape);
      if(!context.showOnHover&&!context.skipRestore)context.triggerRef.current?.focus({preventScroll:true});
    };
  });
  $effect(()=>{
    if(role!=='Content'||!context.open||!context.showOnHover)return;
    const anchor=context.triggerRef.current,panel=context.contentRef.current;
    if(!anchor||!panel)return;
    const leaveTrigger=(event:PointerEvent)=>makeGrace(event,panel);
    const leaveContent=(event:PointerEvent)=>makeGrace(event,anchor);
    anchor.addEventListener('pointerleave',leaveTrigger);panel.addEventListener('pointerleave',leaveContent);
    let movedIn=false;
    const tabInto=(event:KeyboardEvent)=>{if(movedIn||event.defaultPrevented)return;if(event.key==='Tab'&&!event.shiftKey){const first=focusableElements(panel)[0];if(first){event.preventDefault();first.focus();context.hoverOpenFocusedWithTab.current=true;movedIn=true;}}};
    document.addEventListener('keydown',tabInto);
    return ()=>{anchor.removeEventListener('pointerleave',leaveTrigger);panel.removeEventListener('pointerleave',leaveContent);document.removeEventListener('keydown',tabInto);removeGrace();};
  });
  $effect(()=>{
    if(role!=='Content'||!grace)return;
    const polygon=grace;
    const track=(event:PointerEvent)=>{
      const target=event.target as HTMLElement;
      if(context.triggerRef.current?.contains(target)||context.contentRef.current?.contains(target)){removeGrace();}
      else if(!isPointInPolygon({x:event.clientX,y:event.clientY},polygon)||target.hasAttribute('aria-haspopup')){removeGrace();context.setOpen(false);}
    };
    document.addEventListener('pointermove',track);
    return ()=>document.removeEventListener('pointermove',track);
  });
  const controller={close:()=>context.setOpen(false),shake:()=>{flushSync(()=>context.setShake(false));requestAnimationFrame(()=>context.setShake(true));}};
  function keydown(event:KeyboardEvent){
    const panel=context.contentRef.current;if(!panel||event.key!=='Tab')return;
    const items=focusableElements(panel),first=items[0],last=items.at(-1);
    if(event.target===panel&&event.shiftKey){event.preventDefault();event.stopPropagation();last?.focus();}
    else if(event.shiftKey&&event.target===first&&last){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&event.target===last&&first){event.preventDefault();first.focus();}
  }
  onDestroy(()=>{clearTimeout(openTimer);clearTimeout(protectionTimer);clearTimeout(blurTimer);});
</script>

{#if role==='Root'}
 {@render children?.(undefined)}
{:else if role==='Trigger'}
 {@render children?.(triggerProps)}
{:else if mounted}
 <div use:portal class="Transition" data-entering={phase==='entering'?'':undefined} data-entering-active={phase==='entering'&&active?'':undefined} data-exiting={phase==='exiting'?'':undefined} data-exiting-active={phase==='exiting'&&active?'':undefined} data-interrupted={interrupted?'':undefined}>
  <div bind:this={positioner} data-radix-popper-content-wrapper="" style={`position:fixed;width:max-content;left:${x}px;top:${y}px;z-index:50;visibility:${hidden||!positioned?'hidden':'visible'}`}>
   <div use:attach class={['Popover',className].filter(Boolean).join(' ')} id={`${context.id}-content`} role="dialog" aria-labelledby={context.triggerRef.current?.id||`${context.id}-trigger`} tabindex="-1" data-state={context.open?'open':'closed'} data-side={actualSide} data-align={align??'center'} data-animate={context.shake?'shake':undefined} data-translucent={translucent?'true':undefined} style={dimensions} onkeydown={keydown}>
    {@render children?.(controller)}
   </div>
  </div>
 </div>
{/if}

<style>

@layer popover-defaults {
 /* Tokens scoped to the portalled panel only (no :root writes); colors follow the app theme. */
 :where(.Popover){--popover-radius:12px;--color-surface-elevated:var(--surface,#fff);--shadow:0 8px 28px rgb(0 0 0 / 12%);--shadow-hairline:0 0 0 1px var(--border,rgb(0 0 0 / 8%));--cubic-enter:cubic-bezier(.16,1,.3,1);--cubic-exit:cubic-bezier(.4,0,1,1);--color-text:var(--text,#202123);--color-text-secondary:var(--muted,#6b6b6b);--color-text-tertiary:var(--faint,#888);}
 :global([data-theme="dark"]) :where(.Popover){--color-surface-elevated:var(--field,#2f2f2f);--shadow:0 12px 36px rgb(0 0 0 / 45%);}
}
.Popover{color:var(--color-text);font-family:Arial,Helvetica,sans-serif;}
.Transition[data-exiting]{pointer-events:none;}

.Popover {
  overflow: auto;
  width: var(--popover-width, auto);
  min-width: var(--popover-min-width, 300px);
  max-width: min(var(--popover-max-width, 700px), var(--radix-popover-content-available-width));
  max-height: var(--radix-popover-content-available-height);
  border-radius: var(--popover-radius);
  background: var(--color-surface-elevated);
  box-shadow: var(--shadow), var(--shadow-hairline);
  -webkit-overflow-scrolling: touch;
  transform-origin: var(--radix-popover-content-transform-origin);
  will-change: transform;

  &:focus {
    outline: none;
  }

  &[data-translucent] {
    backdrop-filter: blur(16px);
    background: linear-gradient(360deg, rgb(247 247 248 / 50%) 0%, rgb(247 247 248 / 100%) 100%);

    :global([data-theme="dark"]) & {
      background: linear-gradient(360deg, rgb(86 88 105 / 25%) 0%, rgb(86 88 105 / 49%) 100%);
    }
  }

  /* One-off animations */
  &[data-animate="shake"] {
    animation: shake 0.4s ease;
  }

  /* Visibility transitions */
  .Transition[data-entering] & {
    opacity: 0;
    transform: scale(0.95);
  }

  .Transition[data-entering-active] &,
  .Transition[data-entering][data-interrupted] & {
    opacity: 1;
    transform: scale(1);
    transition-duration: 0.35s;
    transition-property: opacity, transform;
    transition-timing-function: var(--cubic-enter);
  }

  .Transition[data-exiting] & {
    opacity: 1;
    transform: scale(1);
  }

  .Transition[data-exiting-active] &,
  .Transition[data-exiting][data-interrupted] & {
    opacity: 0;
    transform: scale(0.95);
    transition-duration: 0.2s;
    transition-property: opacity, transform;
    transition-timing-function: var(--cubic-exit);
  }
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }

  20%,
  60% {
    transform: translateX(-5px);
  }

  40%,
  80% {
    transform: translateX(5px);
  }

  100% {
    transform: translateX(0);
  }
}

</style>
