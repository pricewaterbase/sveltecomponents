<script module lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  export type SizeVariant = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  export type ControlSize = '3xs' | SizeVariant | '2xl' | '3xl';
  export type SegmentedControlProps<T extends string = string> = {
    part?: 'Root' | 'Option';
    value: T;
    onChange?: (nextValue: T) => void;
    onClick?: () => void;
    'aria-label'?: string;
    size?: ControlSize;
    gutterSize?: SizeVariant;
    disabled?: boolean;
    block?: boolean;
    pill?: boolean;
    className?: string;
    children?: Snippet;
  } & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onclick' | 'onchange'>;
  type GroupContext = {
    readonly value: string;
    readonly disabled: boolean;
    readonly focusValue: string | undefined;
    root: HTMLDivElement | undefined;
    change: (value: string) => void;
    focus: (value: string) => void;
  };
  const KEY = Symbol('SegmentedControl');
</script>

<script lang="ts" generics="T extends string">
  import { getContext, setContext, onMount, tick } from 'svelte';
  let {
    part = 'Root', value, onChange, onClick, children,
    block = false, pill = true, size = 'md', gutterSize,
    className, disabled = false, 'aria-label': ariaLabel, ...restProps
  }: SegmentedControlProps<T> = $props();
  const role = (() => part)();
  const parent = getContext<GroupContext | undefined>(KEY);
  let rootRef = $state<HTMLDivElement>();
  let thumbRef = $state<HTMLDivElement>();
  let focused = $state<string>();
  const context: GroupContext = {
    get value() { return value; },
    get disabled() { return disabled; },
    get focusValue() { return focused; },
    get root() { return rootRef; },
    set root(node) { rootRef = node; },
    change(next) { if (next && next !== value) onChange?.(next as T); },
    focus(next) { focused = next; }
  };
  if (role === 'Root') setContext(KEY, context);
  if (role === 'Option' && !parent) throw new Error('SegmentedControl.Option must be wrapped in SegmentedControl');
  const optionDisabled = $derived(disabled || (parent?.disabled ?? false));
  const active = $derived(parent?.value === value);
  let tabIndex = $state(-1);

  function options() {
    return rootRef ? Array.from(rootRef.querySelectorAll<HTMLButtonElement>('.SegmentedControlOption:not(:disabled)')).filter(node => node.closest('.SegmentedControl') === rootRef) : [];
  }
  function applyThumbSizing(attemptScroll: boolean) {
    const root = rootRef, thumb = thumbRef;
    if (!root || !thumb) return;
    const activeNode = root.querySelector<HTMLButtonElement>('[data-state="on"]');
    if (!activeNode) return;
    const rootWidth = root.clientWidth;
    let targetWidth = Math.floor(activeNode.clientWidth);
    const targetOffset = activeNode.offsetLeft;
    if (rootWidth - (targetWidth + targetOffset) < 2) targetWidth = targetWidth - 1;
    thumb.style.width = `${Math.floor(targetWidth)}px`;
    thumb.style.transform = `translateX(${targetOffset}px)`;
    if (root.scrollWidth > rootWidth) {
      const buffer = rootWidth * 0.15;
      const scrollLeft = root.scrollLeft;
      const left = activeNode.offsetLeft;
      const right = left + targetWidth;
      if ((left < scrollLeft + buffer || right > scrollLeft + rootWidth - buffer) && attemptScroll) {
        activeNode.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      }
    }
  }
  function keydown(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const items = options();
    const index = items.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    const rtl = rootRef && getComputedStyle(rootRef).direction === 'rtl';
    let next: number | undefined;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = items.length - 1;
    if (event.key === 'ArrowRight') next = index + (rtl ? -1 : 1);
    if (event.key === 'ArrowLeft') next = index + (rtl ? 1 : -1);
    if (event.key === 'ArrowDown') next = index + 1;
    if (event.key === 'ArrowUp') next = index - 1;
    if (next === undefined) return;
    event.preventDefault();
    items[next]?.focus(); // loop=false: stop at the first/last enabled option.
  }
  function pointerEnter(event: PointerEvent) {
    // Approximation of the unavailable handlePressableMouseEnter helper.
    if (event.pointerType === 'touch') return;
    const node = event.currentTarget as HTMLButtonElement;
    node.style.setProperty('--scale', String(Math.max(0.95, 1 - 4 / Math.max(node.clientWidth, 1))));
  }
  $effect(() => {
    if (role !== 'Option' || !parent?.root) return;
    const currentValue = parent.value;
    const focusValue = parent.focusValue;
    const isDisabled = optionDisabled;
    void tick().then(() => {
      if (!parent?.root || isDisabled) { tabIndex = -1; return; }
      const nodes = Array.from(parent.root.querySelectorAll<HTMLButtonElement>('.SegmentedControlOption:not(:disabled)'));
      const focusedNode = nodes.find(node => node.value === focusValue);
      const selectedNode = nodes.find(node => node.value === currentValue);
      const target = focusedNode ?? selectedNode ?? nodes[0];
      tabIndex = target?.value === value ? 0 : -1;
    });
  });
  $effect(() => {
    if (role !== 'Root') return;
    // Explicit dependencies match the original layout effect.
    value; size; gutterSize; pill;
    let frame = 0, cancelled = false;
    void tick().then(() => {
      if (cancelled || !thumbRef) return;
      applyThumbSizing(!!thumbRef.style.transition);
      if (!thumbRef.style.transition) frame = requestAnimationFrame(() => {
        if (thumbRef) thumbRef.style.transition = 'width 300ms var(--cubic-enter), transform 300ms var(--cubic-enter)';
      });
    });
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  });
  onMount(() => {
    if (role !== 'Root' || !rootRef) return;
    const observer = new ResizeObserver(() => {
      if (!thumbRef) return;
      const currentTransition = thumbRef.style.transition;
      thumbRef.style.transition = '';
      applyThumbSizing(false);
      thumbRef.style.transition = currentTransition;
    });
    observer.observe(rootRef);
    return () => observer.disconnect();
  });
</script>

{#if role === 'Root'}
  <div bind:this={rootRef} class={['SegmentedControl', className].filter(Boolean).join(' ')} role="group" dir={restProps.dir} aria-label={ariaLabel} data-block={block ? '' : undefined} data-pill={pill ? '' : undefined} data-size={size} data-gutter-size={gutterSize} data-disabled={disabled ? '' : undefined} {...restProps} onclick={() => onClick?.()} onkeydown={keydown}>
    <div class="SegmentedControlThumb" bind:this={thumbRef}></div>
    {@render children?.()}
  </div>
{:else}
  <button type="button" class="SegmentedControlOption" {value} aria-label={ariaLabel} aria-pressed={active} disabled={optionDisabled} data-state={active ? 'on' : 'off'} data-disabled={optionDisabled ? '' : undefined} tabindex={tabIndex} onfocus={() => parent?.focus(value)} onclick={() => { if (!optionDisabled) parent?.change(value); }} onpointerenter={pointerEnter}>
    <span class="relative">{@render children?.()}</span>
  </button>
{/if}

<style>
/* Default tokens scoped to the control (not :root), so they never restyle the host app. */
@layer segmented-defaults {
  .SegmentedControl {
    --control-size-3xs:22px; --control-size-2xs:24px; --control-size-xs:26px;
    --control-size-sm:28px; --control-size-md:32px; --control-size-lg:36px;
    --control-size-xl:40px; --control-size-2xl:44px; --control-size-3xl:48px;
    --control-font-size-sm:12px; --control-font-size-md:14px; --control-font-size-lg:16px;
    --control-radius-sm:6px; --control-radius-md:8px; --control-radius-lg:10px; --control-radius-xl:12px;
    --control-gutter-2xs:6px; --control-gutter-xs:8px; --control-gutter-sm:10px;
    --control-gutter-md:12px; --control-gutter-lg:14px; --control-gutter-xl:16px;
    --control-gutter-pill-scaling:1.25; --radius-full:9999px;
    --segmented-control-gutter:3px; --segmented-control-gap:0px;
    --segmented-control-font-weight:500;
    --segmented-control-background:#f0f0f0;
    --segmented-control-thumb-background:#fff;
    --segmented-control-thumb-shadow:0 1px 3px rgb(0 0 0 / 12%);
    --segmented-control-option-highlight-gutter:0px;
    --segmented-control-option-highlight-background-color:rgb(0 0 0 / 8%);
    --color-text:#202123; --color-text-secondary:#6b6b6b; --color-ring:#4085ff;
    --transition-duration-basic:150ms; --transition-ease-basic:ease;
    --cubic-enter:cubic-bezier(0.16,1,0.3,1);
  }
  :global([data-theme="dark"]) .SegmentedControl {
    --segmented-control-background:#292929;
    --segmented-control-thumb-background:#494949;
    --segmented-control-thumb-shadow:0 1px 3px rgb(0 0 0 / 25%);
    --segmented-control-option-highlight-background-color:rgb(255 255 255 / 12%);
    --color-text:#ececec; --color-text-secondary:#aaa;
  }
  .SegmentedControlOption { border:0; background:transparent; font:inherit; flex-shrink:0; }
  .SegmentedControl, .SegmentedControlOption { box-sizing:border-box; }
}
.relative { position:relative; }
.SegmentedControl {
  --segmented-control-option-radius: calc(
    var(--segmented-control-radius) - var(--segmented-control-gutter)
  );

  position: relative;
  overflow: auto;
  display: inline-flex;
  flex-wrap: nowrap;
  gap: var(--segmented-control-gap);
  height: var(--segmented-control-size);
  padding: var(--segmented-control-gutter);
  border-radius: var(--segmented-control-radius);
  background: var(--segmented-control-background);
  font-size: var(--segmented-control-font-size);
  font-weight: var(--segmented-control-font-weight);
  -ms-overflow-style: none;
  scrollbar-width: none;
  /* Remove inline-flex baseline gap */
  vertical-align: middle;
  white-space: nowrap;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  &::-webkit-scrollbar-track,
  &::-webkit-scrollbar-thumb {
    background: transparent;
  }

  &:where([data-block]) {
    overflow: hidden;
    display: flex;
    width: 100%;
    white-space: wrap;
  }

  /* =============================================
    Sizes
  ============================================= */
  &:where([data-size="3xs"]) {
    --segmented-control-size: var(--control-size-3xs);
    --segmented-control-font-size: var(--control-font-size-sm);
    --segmented-control-radius: var(--control-radius-sm);
    --segmented-control-option-gutter: var(--control-gutter-xs);
  }

  &:where([data-size="2xs"]) {
    --segmented-control-size: var(--control-size-2xs);
    --segmented-control-font-size: var(--control-font-size-sm);
    --segmented-control-radius: var(--control-radius-sm);
    --segmented-control-option-gutter: var(--control-gutter-xs);
  }

  &:where([data-size="xs"]) {
    --segmented-control-size: var(--control-size-xs);
    --segmented-control-font-size: var(--control-font-size-md);
    --segmented-control-radius: var(--control-radius-sm);
    --segmented-control-option-gutter: var(--control-gutter-xs);
  }

  &:where([data-size="sm"]) {
    --segmented-control-size: var(--control-size-sm);
    --segmented-control-font-size: var(--control-font-size-md);
    --segmented-control-radius: var(--control-radius-md);
    --segmented-control-option-gutter: var(--control-gutter-sm);
  }

  &:where([data-size="md"]) {
    --segmented-control-size: var(--control-size-md);
    --segmented-control-font-size: var(--control-font-size-md);
    --segmented-control-radius: var(--control-radius-md);
    --segmented-control-option-gutter: var(--control-gutter-md);
  }

  &:where([data-size="lg"]) {
    --segmented-control-size: var(--control-size-lg);
    --segmented-control-font-size: var(--control-font-size-md);
    --segmented-control-radius: var(--control-radius-md);
    --segmented-control-option-gutter: var(--control-gutter-md);
  }

  &:where([data-size="xl"]) {
    --segmented-control-size: var(--control-size-xl);
    --segmented-control-font-size: var(--control-font-size-md);
    --segmented-control-radius: var(--control-radius-lg);
    --segmented-control-option-gutter: var(--control-gutter-lg);
  }

  &:where([data-size="2xl"]) {
    --segmented-control-size: var(--control-size-2xl);
    --segmented-control-font-size: var(--control-font-size-lg);
    --segmented-control-radius: var(--control-radius-xl);
    --segmented-control-option-gutter: var(--control-gutter-xl);
  }

  &:where([data-size="3xl"]) {
    --segmented-control-size: var(--control-size-3xl);
    --segmented-control-font-size: var(--control-font-size-lg);
    --segmented-control-radius: var(--control-radius-xl);
    --segmented-control-option-gutter: var(--control-gutter-xl);
  }

  /* =============================================
    Gutter sizes
  ============================================= */
  &:where([data-gutter-size="2xs"]) {
    --segmented-control-option-gutter: var(--control-gutter-2xs);
  }

  &:where([data-gutter-size="xs"]) {
    --segmented-control-option-gutter: var(--control-gutter-xs);
  }

  &:where([data-gutter-size="sm"]) {
    --segmented-control-option-gutter: var(--control-gutter-sm);
  }

  &:where([data-gutter-size="md"]) {
    --segmented-control-option-gutter: var(--control-gutter-md);
  }

  &:where([data-gutter-size="lg"]) {
    --segmented-control-option-gutter: var(--control-gutter-lg);
  }

  &:where([data-gutter-size="xl"]) {
    --segmented-control-option-gutter: var(--control-gutter-xl);
  }

  /* =============================================
    Pill
  ============================================= */
  &:where([data-pill]) {
    --segmented-control-radius: var(--radius-full);
    --segmented-control-option-radius: var(--radius-full);
  }
}

.SegmentedControlOption {
  position: relative;
  padding: 0 var(--segmented-control-option-gutter);
  border-radius: var(--segmented-control-option-radius);
  color: var(--color-text-secondary);
  cursor: pointer;
  line-height: 1;
  transition-duration: var(--transition-duration-basic);
  transition-property: opacity, background-color, color;
  transition-timing-function: var(--transition-ease-basic);

  &:focus {
    outline: 0;
  }

  :global(:where(.SegmentedControl[data-block])) & {
    flex: 1;
  }

  :global(:where(.SegmentedControl[data-pill])) & {
    padding: 0 calc(var(--segmented-control-option-gutter) * var(--control-gutter-pill-scaling));
  }

  &[data-state="on"]:focus-visible {
    outline: 2px solid var(--color-ring);
  }

  &::before {
    position: absolute;
    inset: var(--segmented-control-option-highlight-gutter);
    border-radius: var(--segmented-control-option-radius);
    background: var(--segmented-control-option-highlight-background-color);
    content: "";
    opacity: 0;
    pointer-events: none;
    transform: scale(1);
    transition-duration: var(--transition-duration-basic);
    transition-property: opacity, transform;
    transition-timing-function: var(--transition-ease-basic);
    will-change: transform;
  }

  &:active::before {
    transform: scale(var(--scale), 0.97);
  }

  :global(svg) {
    display: block;
  }

  &[data-state="off"]:where(:not([disabled])) {
    &:hover {
      color: var(--color-text);

      &::before {
        opacity: 0.5;
      }
    }

    &:focus-visible {
      color: var(--color-text);
      outline: 2px solid var(--color-ring);
    }

    &:active::before {
      opacity: 0.75;
    }
  }

  &[data-state="on"] {
    color: var(--color-text);
  }

  &[data-disabled] {
    cursor: not-allowed;
    opacity: 0.5;

    &::before {
      opacity: 0 !important;
    }
  }
}

.SegmentedControlThumb {
  position: absolute;
  top: var(--segmented-control-gutter);
  bottom: var(--segmented-control-gutter);
  left: 0;
  border-radius: var(--segmented-control-option-radius);
  background: var(--segmented-control-thumb-background);
  box-shadow: var(--segmented-control-thumb-shadow);
  pointer-events: none;
  will-change: transform;
}

</style>
