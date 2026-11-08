<script module lang="ts">
 import {DateTime,Interval} from 'luxon';
 import type {ControlSize} from '../button/Button.svelte';
 export type DatePickerProps={
  id?:string;value:DateTime|null;onChange:(next:DateTime|null)=>void;
  min?:DateTime;max?:DateTime;side?:'top'|'bottom'|'left'|'right';sideOffset?:number;
  align?:'start'|'center'|'end';alignOffset?:number;disabled?:boolean;placeholder?:string;
  variant?:'solid'|'soft'|'outline'|'ghost';pill?:boolean;size?:ControlSize;dropdownIconType?:string;
  triggerClassName?:string;triggerShowIcon?:boolean;triggerDateFormat?:string;clearable?:boolean;block?:boolean;
 };
 type View={date:DateTime;step:number;key:string;exiting:boolean};
 const STEP_DISTANCE=242;
 const labels=['Su','Mo','Tu','We','Th','Fr','Sa'];
 function before(a:DateTime,b:DateTime){return a.toMillis()<b.toMillis();}
 function sameDay(a:DateTime,b:DateTime){return a.hasSame(b,'day');}
 function weeks(date:DateTime){
  const start=date.startOf('month');const cells:(DateTime|null)[]=Array(start.weekday%7).fill(null);
  for(let day=0;day<(start.daysInMonth??0);day++)cells.push(start.plus({days:day}));
  const result:(DateTime|null)[][]=[];for(let index=0;index<cells.length;index+=7)result.push(cells.slice(index,index+7));
  return result;
 }
</script>
<script lang="ts">
 import {tick,untrack,onDestroy} from 'svelte';
 import Popover from '../popover/Popover.svelte';import Button from '../button/Button.svelte';
 let {id,value,onChange,min,max,sideOffset=8,align='center',alignOffset,
  disabled=false,placeholder='Select date...',variant='outline',pill=true,size='md',dropdownIconType,
  triggerClassName,triggerShowIcon=true,triggerDateFormat='MM/dd/yy',clearable=false,block=false}:DatePickerProps=$props();
 let opened=$state(false),steps=$state(0),container=$state<HTMLDivElement>();
 let calendarDate=$state(untrack(()=>value??DateTime.now()));
 let views=$state<View[]>(untrack(()=>[{date:calendarDate,step:0,key:calendarDate.toFormat('yyyy-MM'),exiting:false}]));
 let timers:ReturnType<typeof setTimeout>[]=[];
 const canGoBack=$derived(!min||before(min,calendarDate.startOf('month')));
 const canGoForward=$derived(!max||before(calendarDate.endOf('month'),max));
 const sizePixels:Record<ControlSize,number>={'3xs':22,'2xs':24,xs:26,sm:28,md:32,lg:36,xl:40,'2xl':44,'3xl':48};
 function reset(date:DateTime){steps=0;calendarDate=date;views=[{date,step:0,key:date.toFormat('yyyy-MM'),exiting:false}];}
 function navigate(direction:number){
  if(direction<0&&!canGoBack||direction>0&&!canGoForward)return;
  steps+=direction;calendarDate=calendarDate.plus({months:direction});
  const key=calendarDate.toFormat('yyyy-MM');
  views=[...views.filter(view=>view.key!==key).map(view=>({...view,exiting:true})),{date:calendarDate,step:steps,key,exiting:false}];
  const activeKey=key;
  timers.push(setTimeout(()=>{views=views.filter(view=>!view.exiting||view.key===activeKey);},400));
 }
 function enabled(day:DateTime,date:DateTime){return Interval.fromDateTimes(min??date.startOf('month'),max??date.endOf('month')).contains(day);}
 function select(day:DateTime){onChange(day);opened=false;}
 function validateBounds(){if(min&&max&&!before(min,max))throw new Error('DatePicker error: `min` date must be before the `max` date');}
 validateBounds();
 $effect(validateBounds);
 $effect(()=>{if(opened)untrack(()=>reset(value??DateTime.now()));});
 $effect(()=>{const selected=value;if(!selected)return;untrack(()=>{if(!Interval.fromDateTimes(calendarDate.startOf('month'),calendarDate.endOf('month')).contains(selected))reset(selected);});});
 $effect(()=>{
  if(!opened)return;calendarDate;
  let frame=0,frame2=0,cancelled=false;
  void tick().then(()=>{if(cancelled)return;frame=requestAnimationFrame(()=>{
   if(!container)return;
   const calendars=Array.from(container.querySelectorAll<HTMLElement>('[data-calendar]')).filter(element=>!element.closest('[data-exiting]'));
   if(calendars.length)container.style.height=`${Math.max(...calendars.map(element=>element.clientHeight))}px`;
   if(!container.style.transition)frame2=requestAnimationFrame(()=>{if(container)container.style.transition='height 0.25s var(--cubic-move)';});
  });});
  return ()=>{cancelled=true;cancelAnimationFrame(frame);cancelAnimationFrame(frame2);};
 });
 onDestroy(()=>timers.forEach(clearTimeout));
</script>

{#snippet chevron(direction:'left'|'right'|'down')}
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={direction==='left'?'m15 5-7 7 7 7':direction==='right'?'m9 5 7 7-7 7':'m6 9 6 6 6-6'}/></svg>
{/snippet}
<Popover open={opened} onOpenChange={(next)=>{if(!disabled)opened=next;}}>
 <Popover part="Trigger">
  {#snippet children(props)}
   <span class="PickerTriggerContainer" data-block={block?'':undefined} style={`--picker-control-size:${sizePixels[size]}px`}>
    <Button {...props} bind:ref={props.ref} {disabled} {variant} {size} {block} selected={!!value}
     id={id??props.id} className={['DateTrigger',triggerClassName,clearable&&value?'HasClear':''].filter(Boolean).join(' ')}
     style={pill?undefined:'--button-radius:8px'}>
     {#if triggerShowIcon}<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" class="CalendarIcon" aria-hidden="true"><path d="M19 11H5v7l.005.102A1 1 0 0 0 6 19h12a1 1 0 0 0 1-1v-7Zm0-4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v2h14V7Zm2 11a3 3 0 0 1-3 3H6a3 3 0 0 1-2.996-2.846L3 18V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 2 0v1h6V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11Z"/></svg>{/if}
     <span class="TriggerText">{value?.toFormat(triggerDateFormat)??placeholder}</span>
     {#if dropdownIconType!=='none'}{@render chevron('down')}{/if}
    </Button>
    {#if clearable&&value}<button type="button" class="ClearDate" aria-label="Clear date" {disabled} onclick={(event)=>{event.stopPropagation();onChange(null);}}><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg></button>{/if}
   </span>
  {/snippet}
 </Popover>
 <Popover part="Content" minWidth={230} side="bottom" avoidCollisions={false} {sideOffset} {align} alignOffset={alignOffset??(align==='center'?0:-5)}>
  <div class="CalendarWrapper">
   <div class="CalendarContainer" bind:this={container}>
    <div class="Previous"><Button variant="ghost" size="sm" uniform iconSize="sm" disabled={!canGoBack} onClick={()=>navigate(-1)} aria-label="Previous month">{@render chevron('left')}</Button></div>
    <div class="Next"><Button variant="ghost" size="sm" uniform iconSize="sm" disabled={!canGoForward} onClick={()=>navigate(1)} aria-label="Next month">{@render chevron('right')}</Button></div>
    <div class="CalendarRange" style={`transform:translate(${steps*-STEP_DISTANCE}px,0)`}>
     {#each views as view(view.key)}
      <div data-exiting={view.exiting?'':undefined} inert={view.exiting} aria-hidden={view.exiting||undefined}>
       <div class="Calendar" style={`left:${view.step*STEP_DISTANCE}px`} data-calendar="">
        <p class="MonthLabel">{view.date.startOf('month').monthLong} {view.date.year}</p>
        <div class="Week">{#each labels as label}<div class="DayLabel">{label}</div>{/each}</div>
        {#each weeks(view.date) as week}
         <div class="Week">
          {#each week as day}
           {#if day}
            {@const isEnabled=enabled(day,view.date)}
            {@const selected=isEnabled&&value&&sameDay(day,value)}
            <div class="Day" data-is-selected={selected?'':undefined}>
             <button type="button" class="InteractiveDay" disabled={!isEnabled} aria-label={day.toISODate()??undefined} aria-pressed={!!selected} onclick={()=>select(day)}>{day.day}{#if sameDay(day,DateTime.now())}<span class="TodayDot"></span>{/if}</button>
            </div>
           {:else}<div class="Day"></div>{/if}
          {/each}
         </div>
        {/each}
       </div>
      </div>
     {/each}
    </div>
   </div>
  </div>
 </Popover>
</Popover>

<style>

 @layer date-picker-defaults {
 /* Tokens scoped to the picker trigger and calendar panel (no :root writes); colors follow the app theme. */
 :where(.PickerTriggerContainer,.CalendarWrapper){--color-text:var(--text,#202123);--color-text-secondary:var(--muted,#6b6b6b);--color-text-inverse:var(--bg,#fff);--gray-0:var(--bg,#fff);--color-surface-elevated:var(--surface,#fff);--font-text-sm-size:14px;--tracking-none:0;--font-weight-semibold:600;--radius-full:9999px;--cubic-enter:cubic-bezier(.16,1,.3,1);--cubic-move:cubic-bezier(.25,.1,.25,1);--alpha-06:rgb(0 0 0 / 6%);--alpha-08:rgb(0 0 0 / 8%);font-family:Arial,Helvetica,sans-serif;}
 :global([data-theme="dark"]) :where(.PickerTriggerContainer,.CalendarWrapper){--color-surface-elevated:var(--field,#2f2f2f);--alpha-06:rgb(255 255 255 / 6%);--alpha-08:rgb(255 255 255 / 8%);}
}
.CalendarIcon{width:18px;height:18px;flex:none;}
.PickerTriggerContainer{position:relative;display:inline-block;vertical-align:middle;}
.PickerTriggerContainer[data-block]{display:block;width:100%;}
.PickerTriggerContainer :global(.DateTrigger){text-align:left;}
.PickerTriggerContainer :global(.DateTrigger .ButtonInner){justify-content:space-between;}
.PickerTriggerContainer :global(.HasClear){padding-right:50px;}
.TriggerText{font-variant-numeric:tabular-nums;}
.ClearDate{position:absolute;right:28px;top:50%;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;width:18px;height:18px;padding:0;border:0;border-radius:9999px;background:transparent;color:inherit;cursor:pointer;}
.ClearDate:hover{background:var(--alpha-08);}.ClearDate:disabled{cursor:not-allowed;opacity:.5;}
.InteractiveDay{color:inherit;font-family:Arial,Helvetica,sans-serif;}
.CalendarContainer {
  position: relative;
  width: 210px;
  /*  Default size of the calendar is assumed to be 224px */
  /*  and then is dynamically set via JS measuring */
  height: 224px;
}

.Previous {
  position: absolute;
  top: 0;
  left: -2px;
  z-index: 2;
  background-color: var(--color-surface-elevated);

  /*  Prevent titles from bleeding beyond the button */
  &::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: -10px;
    display: block;
    width: 12px;
    background-color: var(--color-surface-elevated);
    content: "";
  }

  /*  Slide fade as titles collide with the button */
  &::after {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 100%;
    display: block;
    width: 14px;
    background-color: var(--color-surface-elevated);
    content: "";
    mask-image: linear-gradient(-90deg, rgb(0 0 0 / 0%), rgb(0 0 0 / 100%));
  }
}

.Next {
  position: absolute;
  top: 0;
  right: -2px;
  z-index: 2;
  background-color: var(--color-surface-elevated);

  /*  Prevent titles from bleeding beyond the button */
  &::before {
    position: absolute;
    top: 0;
    right: -10px;
    bottom: 0;
    display: block;
    width: 12px;
    background-color: var(--color-surface-elevated);
    content: "";
  }

  /*  Slide fade as titles collide with the button */
  &::after {
    position: absolute;
    top: 0;
    right: 100%;
    bottom: 0;
    display: block;
    width: 14px;
    background-color: var(--color-surface-elevated);
    content: "";
    mask-image: linear-gradient(90deg, rgb(0 0 0 / 0%), rgb(0 0 0 / 100%));
  }
}

/*  Lift the inner button above the pseudo elements to avoid clipping in the focus ring box shadow. */
.Next :global(button[type="button"]),
.Previous :global(button[type="button"]) {
  z-index: 2;
}

.CalendarWrapper {
  overflow: hidden;
  padding: 10px 12px 12px;
}

.CalendarRange {
  transition: transform 0.25s var(--cubic-move);
}

.Calendar {
  --cell-size: 30px;
  --cell-vertical-gutter: 2px;

  position: absolute;
  top: 0;
  width: 210px;
  font-size: 14px;
}

.Week {
  display: flex;
  margin-bottom: var(--cell-vertical-gutter);

  &:last-child {
    margin-bottom: 0;
  }
}

.DayLabel {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--cell-size);
  height: var(--cell-size);
  color: var(--color-text-secondary);
  font-size: 12px;
  letter-spacing: var(--tracking-none);
  text-align: center;
}

.MonthLabel {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0;
  margin: 0 0 6px;
  color: var(--color-text);
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
}

.Day {
  position: relative;
  width: var(--cell-size);
  height: var(--cell-size);
  text-align: center;
  transition: background-color 0.15s var(--cubic-enter);

  &[data-is-selected] {
    border-radius: var(--radius-full);
    background-color: light-dark(var(--alpha-06), var(--alpha-08));
  }
}

.InteractiveDay {
  position: relative;
  display: block;
  width: var(--cell-size);
  height: var(--cell-size);
  border: 0;
  border-radius: var(--radius-full);
  appearance: auto;
  background: none;
  cursor: pointer;
  font-size: var(--font-text-sm-size);

  &::before {
    position: absolute;
    inset: 0;
    display: block;
    border: 1px solid var(--color-text);
    border-radius: var(--radius-full);
    content: "";
    opacity: 0;
    transition:
      color,
      0.15s var(--cubic-enter),
      opacity 0.15s var(--cubic-enter);
  }

  &:hover {
    &::before {
      opacity: 1;
    }
  }

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.4;

    &::before {
      display: none;
    }
  }

  [data-is-selected] & {
    background: var(--color-text);
    color: var(--color-text-inverse);
  }
}

.TodayDot {
  position: absolute;
  bottom: 3px;
  left: 50%;
  width: 3px;
  height: 3px;
  border-radius: 100%;
  margin-left: -1px;
  background-color: var(--color-text);
  transition: background-color 0.15s var(--cubic-enter);

  [data-is-selected] & {
    background-color: var(--gray-0);
  }
}

</style>
