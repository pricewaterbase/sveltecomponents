<script module lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes, HTMLAnchorAttributes } from 'svelte/elements';
  export type MenuPart = 'Root' | 'Trigger' | 'Content' | 'Item' | 'ItemActions' | 'ItemAction' | 'Link' | 'Separator' | 'Sub' | 'SubTrigger' | 'SubContent' | 'RadioGroup' | 'RadioItem' | 'CheckboxItem';
  export type MenuProps = {
    part?: MenuPart;
    children?: Snippet<[any]>;
    forceOpen?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    modal?: boolean;
    className?: string;
    disabled?: boolean;
    onSelect?: (event: Event) => void;
    onClick?: (event: MouseEvent) => void;
    href?: string;
    to?: string;
    as?: import('svelte').Component<any>;
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
    align?: 'start' | 'center' | 'end';
    alignOffset?: number;
    width?: number | 'auto';
    minWidth?: number | 'auto';
    maxHeight?: number;
    value?: string;
    onChange?: (value: string) => void;
    checked?: boolean | 'indeterminate';
    onCheckedChange?: (value: boolean) => void;
    indicatorPosition?: 'start' | 'end';
    indicatorVariant?: 'solid' | 'ghost';
  } & Omit<HTMLAttributes<HTMLElement>, 'children' | 'onchange'> & Pick<HTMLAnchorAttributes, 'target' | 'rel' | 'download'>;
  type Store = {
    readonly open: boolean;
    readonly modal: boolean;
    readonly id: string;
    trigger: HTMLElement | undefined;
    content: HTMLElement | undefined;
    setOpen: (next: boolean, focus?: 'first' | 'last' | 'trigger') => void;
  };
  const ROOT = Symbol('Menu.Root');
  const SCOPE = Symbol('Menu.Scope');
  const RADIO = Symbol('Menu.Radio');
  const stack: Store[] = [];
</script>

<script lang="ts">
  import { getContext, setContext, tick } from 'svelte';
  let {
    part = 'Root', children, forceOpen, onOpen, onClose, modal = false, className,
    disabled = false, onSelect, onClick, href, to, as: LinkComponent,
    side = 'bottom', sideOffset, align = 'center', alignOffset,
    width, minWidth, maxHeight, value, onChange, checked = false, onCheckedChange,
    indicatorPosition = 'end', indicatorVariant = 'solid', ...rest
  }: MenuProps = $props();
  const uid = $props.id();
  let internalOpen = $state(false);
  let mounted = $state(false);
  let entering = $state(false);
  let exiting = $state(false);
  let trigger = $state<HTMLElement>();
  let content = $state<HTMLElement>();
  let x = $state(0);
  let y = $state(0);
  let availableWidth = $state(0);
  let availableHeight = $state(0);
  let actualSide = $state<MenuProps['side']>('bottom');
  const parentRoot = getContext<Store | undefined>(ROOT);
  const parentScope = getContext<Store | undefined>(SCOPE);
  const radio = getContext<{ readonly value: string | undefined; change: (v: string) => void } | undefined>(RADIO);
  const own: Store = {
    get open() { return forceOpen ?? internalOpen; },
    get modal() { return modal; },
    get id() { return uid; },
    get trigger() { return trigger; }, set trigger(v) { trigger = v; },
    get content() { return content; }, set content(v) { content = v; },
    setOpen(next, focus) {
      internalOpen = next;
      if (next) onOpen?.(); else onClose?.();
      if (focus) void tick().then(() => {
        if (focus === 'trigger') own.trigger?.focus();
        else {
          const items = getItems(own.content);
          (focus === 'last' ? items.at(-1) : items[0])?.focus();
        }
      });
    }
  };
  const role = (() => part)();
  if (role === 'Root') { setContext(ROOT, own); setContext(SCOPE, own); }
  if (role === 'Sub') setContext(SCOPE, own);
  if (role === 'RadioGroup') setContext(RADIO, { get value() { return value; }, change: (v: string) => onChange?.(v) });
  const root = role === 'Root' ? own : parentRoot;
  const scope = role === 'Root' || role === 'Sub' ? own : parentScope;
  if (role !== 'Root' && !root) throw new Error('Menu components must be wrapped in <Menu />');
  if ((role === 'SubContent' || role === 'SubTrigger') && scope === root) throw new Error('Submenu components must be wrapped in <Menu part="Sub" />');
  const isContent = $derived(part === 'Content' || part === 'SubContent');
  const selected = $derived(part === 'RadioItem' ? radio?.value === value : checked === true);
  const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ');
  const cssSize = (v: number | string | undefined) => typeof v === 'number' ? `${v}px` : v;
  const dimensions = $derived([
    width !== undefined || part === 'SubContent' ? `--menu-width:${cssSize(width ?? 'auto')}` : '',
    minWidth !== undefined || part === 'SubContent' ? `--menu-min-width:${cssSize(minWidth ?? 'auto')}` : '',
    maxHeight !== undefined ? `--menu-max-height:${maxHeight}px` : '',
    `--radix-dropdown-menu-content-available-width:${availableWidth}px`,
    `--radix-dropdown-menu-content-available-height:${availableHeight}px`,
    `--radix-dropdown-menu-content-transform-origin:${actualSide === 'top' ? 'bottom' : actualSide === 'left' ? 'right' : actualSide === 'right' ? 'left' : 'top'} ${align}`
  ].filter(Boolean).join(';'));
  function getItems(node?: HTMLElement) {
    return node ? Array.from(node.querySelectorAll<HTMLElement>('[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]')).filter(n => !n.hasAttribute('data-disabled') && n.closest('[role="menu"]') === node) : [];
  }
  function refTrigger(node: HTMLElement) { if (scope) scope.trigger = node; return { destroy() { if (scope?.trigger === node) scope.trigger = undefined; } }; }
  // Trigger uses a snippet receiving native attributes, avoiding an extra DOM wrapper.
  const triggerProps = $derived({
    id: `${scope?.id}-trigger`, 'aria-haspopup': 'menu' as const,
    'aria-expanded': scope?.open ?? false, 'aria-controls': scope?.open ? `${scope.id}-content` : undefined,
    'data-state': scope?.open ? 'open' : 'closed', 'data-disabled': disabled ? '' : undefined,
    disabled, onclick: (event: MouseEvent) => {
      if (disabled) return;
      if (scope) scope.trigger = event.currentTarget as HTMLElement;
      scope?.setOpen(!scope.open, 'first');
    }, onkeydown: (event: KeyboardEvent) => {
      if (disabled) return;
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        if (scope) scope.trigger = event.currentTarget as HTMLElement;
        scope?.setOpen(true, event.key === 'ArrowUp' ? 'last' : 'first');
      }
    }
  });
  let typeahead = '';
  let typeaheadAt = 0;
  function keyboard(event: KeyboardEvent) {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); scope?.setOpen(false, 'trigger'); return; }
    if (event.key === 'Tab') { event.preventDefault(); root?.setOpen(false, 'trigger'); return; }
    if (part === 'SubContent' && event.key === 'ArrowLeft') { event.preventDefault(); scope?.setOpen(false, 'trigger'); return; }
    const items = getItems(scope?.content);
    const index = items.indexOf(document.activeElement as HTMLElement);
    let next: number | undefined;
    if (event.key === 'ArrowDown') next = (index + 1) % items.length;
    if (event.key === 'ArrowUp') next = (index - 1 + items.length) % items.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = items.length - 1;
    if (next !== undefined) { event.preventDefault(); items[next]?.focus(); return; }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && event.key !== ' ') {
      typeahead = Date.now() - typeaheadAt > 700 ? event.key.toLowerCase() : typeahead + event.key.toLowerCase();
      typeaheadAt = Date.now();
      const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)];
      ordered.find(n => n.textContent?.trim().toLowerCase().startsWith(typeahead))?.focus();
    }
  }
  function select(event: MouseEvent) {
    if (disabled) { event.preventDefault(); return; }
    onClick?.(event);
    if (event.defaultPrevented) return;
    const selection = new CustomEvent('menu.itemSelect', { bubbles: false, cancelable: true });
    onSelect?.(selection);
    if (part === 'CheckboxItem') onCheckedChange?.(checked !== true);
    if (part === 'RadioItem' && value !== undefined) radio?.change(value);
    if (!selection.defaultPrevented) root?.setOpen(false, 'trigger');
  }
  function itemKey(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); (event.currentTarget as HTMLElement).click(); }
  }
  function pointer(event: PointerEvent) {
    if (!root?.open) { event.preventDefault(); return; }
    if (event.pointerType !== 'touch' && !disabled) {
      const node = event.currentTarget as HTMLElement;
      const scopeIndex = scope ? stack.indexOf(scope) : -1;
      if (scopeIndex >= 0) for (const child of [...stack.slice(scopeIndex + 1)].reverse()) {
        if (child.trigger !== node) child.setOpen(false);
      }
      node.focus();
    }
  }
  function highlight(node: HTMLElement) {
    const focus = () => node.setAttribute('data-highlighted', '');
    const blur = () => node.removeAttribute('data-highlighted');
    node.addEventListener('focus', focus); node.addEventListener('blur', blur);
    return { destroy() { node.removeEventListener('focus', focus); node.removeEventListener('blur', blur); } };
  }
  function portal(node: HTMLElement) { document.body.appendChild(node); return { destroy() { node.remove(); } }; }
  function position() {
    if (!scope?.trigger || !scope.content) return;
    const anchor = scope.trigger.getBoundingClientRect();
    const box = scope.content.getBoundingClientRect();
    const offset = sideOffset ?? (part === 'SubContent' ? 4 : 5);
    let edge = part === 'SubContent' ? 'right' : side;
    const vw = document.documentElement.clientWidth, vh = window.innerHeight;
    if (edge === 'bottom' && anchor.bottom + offset + box.height > vh - 30 && anchor.top > vh - anchor.bottom) edge = 'top';
    else if (edge === 'top' && anchor.top - offset - box.height < 30 && vh - anchor.bottom > anchor.top) edge = 'bottom';
    else if (edge === 'right' && anchor.right + offset + box.width > vw - 12) edge = 'left';
    else if (edge === 'left' && anchor.left - offset - box.width < 12) edge = 'right';
    actualSide = edge as typeof side;
    const alignment = part === 'SubContent' ? 'start' : align;
    const shift = alignOffset ?? (part === 'SubContent' ? -6 : align === 'center' ? 0 : -5);
    if (edge === 'top' || edge === 'bottom') {
      x = (alignment === 'start' ? anchor.left : alignment === 'end' ? anchor.right - box.width : anchor.left + (anchor.width - box.width) / 2) + shift;
      y = edge === 'bottom' ? anchor.bottom + offset : anchor.top - offset - box.height;
    } else {
      x = edge === 'right' ? anchor.right + offset : anchor.left - offset - box.width;
      y = (alignment === 'start' ? anchor.top : alignment === 'end' ? anchor.bottom - box.height : anchor.top + (anchor.height - box.height) / 2) + shift;
    }
    x = Math.max(12, Math.min(x, vw - box.width - 12));
    y = Math.max(30, Math.min(y, vh - box.height - 30));
    availableWidth = vw - 24;
    availableHeight = edge === 'bottom' ? vh - anchor.bottom - offset - 30 : edge === 'top' ? anchor.top - offset - 30 : vh - 60;
  }
  function contentRef(node: HTMLElement) {
    if (scope) scope.content = node;
    position();
    const observer = new ResizeObserver(position); observer.observe(node);
    window.addEventListener('resize', position); window.addEventListener('scroll', position, true);
    return { destroy() { observer.disconnect(); window.removeEventListener('resize', position); window.removeEventListener('scroll', position, true); if (scope?.content === node) scope.content = undefined; } };
  }
  $effect(() => {
    if (part !== 'Root' && part !== 'Sub') return;
    if (!own.open) return;
    stack.push(own);
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && stack.at(-1) === own && !event.defaultPrevented) { event.preventDefault(); own.setOpen(false, 'trigger'); }
    };
    const outside = (event: PointerEvent) => {
      const path = event.composedPath();
      if (stack.some(s => (s.content && path.includes(s.content)) || (s.trigger && path.includes(s.trigger)))) return;
      own.setOpen(false);
      if (own.modal) { event.preventDefault(); event.stopPropagation(); }
    };
    const focusOutside = (event: FocusEvent) => {
      if (stack.at(-1) !== own) return;
      const path = event.composedPath();
      if (stack.some(s => (s.content && path.includes(s.content)) || (s.trigger && path.includes(s.trigger)))) return;
      if (own.modal) (getItems(own.content)[0] ?? own.content)?.focus();
      else own.setOpen(false);
    };
    document.addEventListener('keydown', escape); document.addEventListener('pointerdown', outside, true); document.addEventListener('focusin', focusOutside);
    return () => { const i = stack.indexOf(own); if (i !== -1) stack.splice(i, 1); document.removeEventListener('keydown', escape); document.removeEventListener('pointerdown', outside, true); document.removeEventListener('focusin', focusOutside); };
  });
  $effect(() => {
    if (!isContent) return;
    const open = scope?.open && root?.open;
    let timer: ReturnType<typeof setTimeout>;
    let frame = 0;
    if (open) {
      mounted = true; exiting = false; entering = true;
      void tick().then(() => { position(); frame = requestAnimationFrame(() => { entering = false; }); });
      timer = setTimeout(() => { entering = false; }, 350);
    } else if (mounted) { exiting = true; timer = setTimeout(() => { mounted = false; exiting = false; }, 200); }
    return () => { clearTimeout(timer); cancelAnimationFrame(frame); };
  });
  // Modal approximation: temporarily hide/inert background body children and lock scrolling.
  $effect(() => {
    if (part !== 'Content' || !scope?.open || !root?.modal || !scope.content) return;
    const panel = scope.content.closest('.Menu');
    const previous = Array.from(document.body.children).filter(n => n instanceof HTMLElement && n !== panel && !n.contains(panel) && !n.classList.contains('Menu')).map(n => ({ node: n as HTMLElement, inert: (n as HTMLElement).inert, aria: n.getAttribute('aria-hidden') }));
    const overflow = document.body.style.overflow;
    for (const { node } of previous) { node.inert = true; node.setAttribute('aria-hidden', 'true'); }
    document.body.style.overflow = 'hidden';
    return () => { for (const { node, inert, aria } of previous) { node.inert = inert; if (aria === null) node.removeAttribute('aria-hidden'); else node.setAttribute('aria-hidden', aria); } document.body.style.overflow = overflow; };
  });
</script>

{#snippet checkIcon()}
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M18.063 5.674a1 1 0 0 1 .263 1.39l-7.5 11a1 1 0 0 1-1.533.143l-4.5-4.5a1 1 0 1 1 1.414-1.414l3.647 3.647 6.82-10.003a1 1 0 0 1 1.39-.263Z" clip-rule="evenodd"/></svg>
{/snippet}

{#if part === 'Root' || part === 'Sub'}
  {@render children?.(undefined)}
{:else if part === 'Trigger'}
  {@render children?.(triggerProps)}
{:else if isContent}
  {#if mounted}
    <div use:portal class="Menu" data-entering={entering ? '' : undefined} data-entering-active={!entering && !exiting ? '' : undefined} data-exiting-active={exiting ? '' : undefined} data-exiting={exiting ? '' : undefined}>
      <div use:contentRef class="MenuList" id={`${scope?.id}-content`} role="menu" tabindex="-1" aria-labelledby={`${scope?.id}-trigger`} aria-orientation="vertical" data-state={scope?.open ? 'open' : 'closed'} data-side={actualSide} data-align={align} style={`${dimensions};position:fixed;left:${x}px;top:${y}px;z-index:50`} onkeydown={keyboard}>
        {@render children?.(undefined)}
      </div>
    </div>
  {/if}
{:else if part === 'ItemActions'}
  <div class={cx('ItemActions', className)}>{@render children?.(undefined)}</div>
{:else if part === 'ItemAction'}
  <!-- Approximation of the unavailable Button: secondary, xs, uniform, ghost. -->
  <button type="button" class="rounded-sm ItemActionFallback" onclick={(event) => { event.stopPropagation(); root?.setOpen(false, 'trigger'); onClick?.(event); }}>{@render children?.(undefined)}</button>
{:else if part === 'Separator'}
  <div class={cx('Separator', className)} role="separator"></div>
{:else if part === 'RadioGroup'}
  <div role="group" data-indicator-position={indicatorPosition} {...rest}>{@render children?.(undefined)}</div>
{:else if part === 'SubTrigger'}
  <div use:refTrigger use:highlight class={cx('MenuItem', 'SubMenuItem', className)} role="menuitem" tabindex="-1" id={`${scope?.id}-trigger`} aria-haspopup="menu" aria-expanded={scope?.open} aria-controls={scope?.open ? `${scope.id}-content` : undefined} aria-disabled={disabled || undefined} data-disabled={disabled ? '' : undefined} data-state={scope?.open ? 'open' : 'closed'} onpointermove={(event) => { pointer(event); if (!disabled && root?.open) scope?.setOpen(true); }} onkeydown={(event) => { if (!disabled && ['ArrowRight', 'Enter', ' '].includes(event.key)) { event.preventDefault(); scope?.setOpen(true, 'first'); } }} onclick={() => { if (!disabled) scope?.setOpen(true, 'first'); }}>
    <div class="PressableInner">{@render children?.(undefined)}<svg class="SubTriggerIcon" style="transform: rotate(-90deg)" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.293 8.293a1 1 0 0 1 1.414 0L12 14.586l6.293-6.293a1 1 0 1 1 1.414 1.414l-7 7a1 1 0 0 1-1.414 0l-7-7a1 1 0 0 1 0-1.414Z"/></svg></div>
  </div>
{:else if part === 'Link'}
  {@const external = (href || to) ? /^https?:\/\//.test((href || to)!) : true}
  {#if LinkComponent}
    <LinkComponent {...rest} href={external ? href ?? to : href} to={external ? undefined : to} target={external ? '_blank' : rest.target} rel={external ? 'noopener noreferrer' : rest.rel} className={cx('MenuItem', className)} role="menuitem" tabindex="-1" aria-disabled={disabled || undefined} data-disabled={disabled ? '' : undefined} onclick={select} onkeydown={itemKey} onpointermove={pointer}>
      <span class="PressableInner">{@render children?.(undefined)}</span>
    </LinkComponent>
  {:else}
    <a {...rest} use:highlight href={disabled ? undefined : href ?? to} class={cx('MenuItem', className)} role="menuitem" tabindex="-1" target={external ? '_blank' : rest.target} rel={external ? 'noopener noreferrer' : rest.rel} aria-disabled={disabled || undefined} data-disabled={disabled ? '' : undefined} onclick={select} onpointermove={pointer} onkeydown={itemKey}><span class="PressableInner">{@render children?.(undefined)}</span></a>
  {/if}
{:else if part === 'Item' && !onSelect}
  <div class={cx('MenuItemContent', className)}>{@render children?.(undefined)}</div>
{:else}
  <div use:highlight class={cx('MenuItem', part === 'RadioItem' && 'RadioItem', part === 'CheckboxItem' && 'CheckboxItem', className)} role={part === 'RadioItem' ? 'menuitemradio' : part === 'CheckboxItem' ? 'menuitemcheckbox' : 'menuitem'} tabindex="-1" aria-checked={part === 'CheckboxItem' ? checked === 'indeterminate' ? 'mixed' : checked : part === 'RadioItem' ? selected : undefined} aria-disabled={disabled || undefined} data-disabled={disabled ? '' : undefined} data-state={part === 'CheckboxItem' ? checked === 'indeterminate' ? 'indeterminate' : selected ? 'checked' : 'unchecked' : part === 'RadioItem' ? selected ? 'checked' : 'unchecked' : undefined} data-indicator-position={part === 'CheckboxItem' ? indicatorPosition : undefined} data-indicator-variant={part === 'CheckboxItem' ? indicatorVariant : undefined} onclick={select} onkeydown={itemKey} onpointermove={pointer} onpointerleave={(event) => { if (!root?.open) event.preventDefault(); else scope?.content?.focus(); }}>
    <div class="PressableInner">
      {#if part === 'RadioItem'}<div class="RadioIndicator">{#if selected}<span class="RadioIndicatorActive"></span>{/if}</div>{/if}
      {#if part === 'CheckboxItem'}<div class="CheckboxIndicator">{#if selected || checked === 'indeterminate'}<span>{#if indicatorVariant === 'ghost'}{@render checkIcon()}{:else}<div class="CheckboxCircle">{@render checkIcon()}</div>{/if}</span>{/if}</div>{/if}
      {@render children?.(undefined)}
    </div>
  </div>
{/if}

<style>
/* Estimated fallback tokens; project tokens can override this low-priority layer. */
@layer menu-defaults {
  :global(:root) {
    --color-text: #202123;
    --color-text-secondary: #666;
    --color-text-tertiary: #888;
    --color-surface-elevated: #fff;
    --tracking-normal: normal;
    --font-weight-semibold: 600;
    --scrollbar-color: #c4c4c4;
    --menu-width: auto;
    --menu-min-width: 300px;
    --menu-gutter: 6px;
    --menu-radius: 1.5rem;
    --menu-font-size: 14px;
    --menu-line-height: 20px;
    --menu-item-padding: 8px 10px;
    --menu-item-gap: 8px;
    --menu-item-background-color: rgb(0 0 0 / 6%);
    --menu-separator-gutter: 6px 4px;
    --menu-separator-background-color: rgb(0 0 0 / 10%);
    --menu-radio-indicator-size: 16px;
    --menu-radio-indicator-hole-size: 6px;
    --menu-checkbox-indicator-size: 18px;
    --radius-full: 9999px;
    --radio-group-indicator-background-color: #202123;
    --radio-group-indicator-hole-background-color: #fff;
    --radio-group-indicator-border-color: #aaa;
    --radio-group-indicator-border-color-hover: #666;
    --transition-duration-basic: 150ms;
    --transition-ease-basic: ease;
    --cubic-enter: cubic-bezier(0.16, 1, 0.3, 1);
    --cubic-exit: cubic-bezier(0.4, 0, 1, 1);
    --shadow: 0 8px 24px rgb(0 0 0 / 12%);
    --shadow-hairline: 0 0 0 1px rgb(0 0 0 / 8%);
  }
  :global([data-theme="dark"]) {
    --color-text: #ececec;
    --color-text-secondary: #aaa;
    --color-text-tertiary: #888;
    --color-surface-elevated: #2f2f2f;
    --menu-item-background-color: rgb(255 255 255 / 8%);
    --menu-separator-background-color: rgb(255 255 255 / 12%);
    --radio-group-indicator-background-color: #ececec;
    --radio-group-indicator-hole-background-color: #2f2f2f;
  }
}

/* Base globals trimmed to avoid restyling the host app. */
:global([data-exiting]) { pointer-events: none; }
/* Missing Button source: explicit approximation. */
.ItemActionFallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 4px;
  border: 0;
  border-radius: var(--radius-sm, 4px);
  color: var(--color-text-secondary, inherit);
  background: transparent;
  cursor: pointer;
}
.ItemActionFallback:hover { background: var(--menu-item-background-color); }
/* Snippet/custom-component children require global descendant selectors. */

:global {
.Menu {
  /* Top-level selector needs to exist */
}

.MenuList {
  overflow: auto;
  width: var(--menu-width, auto);
  min-width: var(--menu-min-width, 300px);
  max-width: var(--radix-dropdown-menu-content-available-width);
  max-height: min(
    var(--radix-dropdown-menu-content-available-height),
    var(--menu-max-height, 1200px)
  );
  padding: var(--menu-gutter);
  border-radius: var(--menu-radius);
  background: var(--color-surface-elevated);
  box-shadow: var(--shadow), var(--shadow-hairline);
  color: var(--color-text);
  font-size: var(--menu-font-size);
  line-height: var(--menu-line-height);
  -webkit-overflow-scrolling: touch;
  pointer-events: auto;
  /* The transform-origin computed from the content and arrow positions/offsets */
  transform-origin: var(--radix-dropdown-menu-content-transform-origin);
  will-change: transform;

  /* Animation states applied to a wrapping parent */
  .Menu[data-entering] & {
    opacity: 0;
    transform: scale(0.95);
  }

  .Menu[data-entering-active] &,
  .Menu[data-entering][data-interrupted] & {
    opacity: 1;
    transform: scale(1);
    transition-duration: 0.35s;
    transition-property: opacity, transform;
    transition-timing-function: var(--cubic-enter);
  }

  .Menu[data-exiting] & {
    opacity: 1;
    transform: scale(1);
  }

  .Menu[data-exiting-active] &,
  .Menu[data-exiting][data-interrupted] & {
    opacity: 0;
    transform: scale(0.95);
    transition-duration: 0.2s;
    transition-property: opacity, transform;
    transition-timing-function: var(--cubic-exit);
  }
}

.MenuItemContent {
  padding: var(--menu-item-padding);
}

.MenuItem {
  position: relative;
  display: block;
  /* Defaults to inherit from pressable wrapper, this container is not flex */
  align-items: center;
  gap: var(--menu-item-gap);
  padding: var(--menu-item-padding);
  color: var(--color-text);
  cursor: pointer;
  user-select: none;

  &:focus {
    outline: none;
  }

  &:hover {
    /* Prevent links from changing colors */
    color: var(--color-text);
  }

  &::before {
    position: absolute;
    inset: 0;
    display: block;
    border-radius: var(--menu-radius);
    background: var(--menu-item-background-color);
    content: "";
    opacity: 0;
    transform: scale(var(--scale, 0.98));
    transition-duration: var(--transition-duration-basic);
    transition-property: opacity, background-color, transform;
    transition-timing-function: var(--cubic-enter);
    will-change: opacity, transform;
  }

  &[data-state="open"],
  &[data-highlighted] {
    &::before {
      opacity: 1;
      transform: scale(1);
    }

    &:has(.ItemActions:hover)::before {
      opacity: 0.4;
    }

    &:not(:has(.ItemActions:hover)):active::before {
      transform: scale(var(--scale, 0.98));
    }

    .ItemActions {
      opacity: 1;
    }
  }

  &[data-disabled] {
    cursor: not-allowed;
    opacity: 0.5;

    &::before {
      display: none;
    }
  }
}

.PressableInner {
  position: relative;
  display: flex;
  /* Allow flex settings to be applied to the container, for className ergonomics */
  align-items: inherit;
  justify-content: inherit;
  gap: inherit;
}

.ItemActions {
  /* Prevent adding height to the MenuItem, and horizontally center */
  display: flex;
  align-items: center;
  height: 0;
  /* Magic number that pulls back the icon an equal gutter from the top/bottom */
  margin-right: -5px;
  opacity: 0;
  transition-duration: var(--transition-duration-basic);
  transition-property: opacity;
  transition-timing-function: var(--cubic-enter);
}

.Separator {
  height: 1px;
  margin: var(--menu-separator-gutter);
  background: var(--menu-separator-background-color);
}

.SubMenuItem {
  justify-content: space-between;
}

.SubTriggerIcon {
  /* slight visual offset of svg canvas */
  margin-right: -2px;
  opacity: 0.75;
  transition: opacity var(--transition-duration-basic) var(--transition-ease-basic);

  .SubMenuItem[data-state="open"] &,
  .SubMenuItem[data-highlighted] & {
    opacity: 1;
  }
}

.RadioItem {
  gap: 0.5rem;

  :where([data-indicator-position="end"]) & {
    justify-content: space-between;
    gap: 0.75rem;
  }
}

.RadioIndicatorActive {
  position: relative;
  display: inline-grid;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  &::before,
  &::after {
    display: block;
    content: "";
    grid-column-start: 1;
    grid-row-start: 1;
    place-self: center center;
    will-change: transform;
  }

  /* Filled circle */
  &::before {
    width: var(--menu-radio-indicator-size);
    height: var(--menu-radio-indicator-size);
    border-radius: var(--radius-full);
    animation: fade-in 0.4s var(--cubic-enter);
    background-color: var(--radio-group-indicator-background-color);
  }

  /*  Empty middle circle */
  &::after {
    width: var(--menu-radio-indicator-hole-size);
    height: var(--menu-radio-indicator-hole-size);
    border-radius: var(--radius-full);
    animation: scale-in 0.4s var(--cubic-enter);
    background-color: var(--radio-group-indicator-hole-background-color);
  }

  /* Don't play the animation when entering */
  [data-entering] &::before,
  [data-entering] &::after {
    animation-duration: 0s;
  }
}

.RadioIndicator {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--menu-radio-indicator-size);
  height: var(--menu-radio-indicator-size);
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  background-color: transparent;
  box-shadow: 0 0 0 1px var(--radio-group-indicator-border-color) inset;
  cursor: pointer;
  transition-duration: var(--transition-duration-basic);
  transition-property: box-shadow;
  transition-timing-function: var(--transition-ease-basic);

  [data-indicator-position="end"] & {
    order: 1;
  }

  [data-highlighted] & {
    box-shadow: 0 0 0 1px var(--radio-group-indicator-border-color-hover) inset;
  }

  [data-disabled] & {
    cursor: not-allowed;
  }

  /* Can't be focused here anyway */
  &:focus {
    outline: none;
  }
}

@keyframes scale-in {
  0% {
    transform: scale(0);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.CheckboxItem {
  gap: 0.5rem;

  &:where([data-indicator-position="end"]) {
    justify-content: space-between;
    gap: 0.75rem;
  }
}

.CheckboxIndicator {
  flex-shrink: 0;
  width: var(--menu-checkbox-indicator-size);
  height: var(--menu-checkbox-indicator-size);

  [data-indicator-position="end"] & {
    order: 1;
  }

  [data-indicator-variant="solid"] & {
    border-radius: var(--radius-full);
    box-shadow: 0 0 0 1px var(--radio-group-indicator-border-color) inset;
  }
}

.CheckboxCircle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--menu-checkbox-indicator-size);
  height: var(--menu-checkbox-indicator-size);
  border-radius: var(--radius-full);
  animation: fade-in 0.5s var(--cubic-enter);
  background-color: var(--radio-group-indicator-background-color);
  color: var(--radio-group-indicator-hole-background-color);

  /* Don't play the animation when entering */
  [data-entering] &::before,
  [data-entering] &::after {
    animation-duration: 0s;
  }
}

}
</style>

<!--
# Menu — Svelte 5

Samodzielna konwersja `Menu.tsx` i `Menu.module.css`. Wymaga Svelte 5; nie wymaga Radix, React ani biblioteki UI.

## Użycie

```svelte
<script lang="ts">
  import Menu from './Menu.svelte';
  let showGrid = $state(true);
</script>

<Menu>
  <Menu part="Trigger">
    {#snippet children(props)}
      <button type="button" {...props}>Options</button>
    {/snippet}
  </Menu>
  <Menu part="Content" minWidth={210}>
    <Menu part="Item">Sam Smith</Menu>
    <Menu part="Separator" />
    <Menu part="Link" href="/settings">Your profile</Menu>
    <Menu part="CheckboxItem" checked={showGrid}
      onCheckedChange={(next) => showGrid = next}
      onSelect={(event) => event.preventDefault()}>
      Show grid lines
    </Menu>
    <Menu part="Sub">
      <Menu part="SubTrigger">More</Menu>
      <Menu part="SubContent">
        <Menu part="Item" onSelect={() => console.log('Move')}>Move to folder…</Menu>
      </Menu>
    </Menu>
    <Menu part="Item" onSelect={() => console.log('Logout')}>Logout</Menu>
  </Menu>
</Menu>
```

`Menu` bez `part` jest korzeniem. Zamiast Reactowego `Menu.Content` używaj `Menu part="Content"`; analogicznie dla Item, ItemActions, ItemAction, Link, Separator, Trigger, Sub, SubTrigger, SubContent, CheckboxItem, RadioGroup i RadioItem. `children` jest snippetem Svelte. Trigger przekazuje atrybuty i handlery do umieszczenia na własnym przycisku: `{...props}` jest wymagane. Przycisk i ikony przykładów Storybook nie są częścią API Menu.

Zachowane nazwy propsów: forceOpen, onOpen, onClose, modal; onSelect/onClick/disabled; side, sideOffset, align, alignOffset, width, minWidth, maxHeight; value/onChange; checked/onCheckedChange; indicatorPosition/indicatorVariant; className. Atrybuty HTML linku przekazuje się bezpośrednio. `as` przyjmuje komponent Svelte (powinien przekazać do elementu linku otrzymane atrybuty/handlery i renderować snippet children). Domyślny link wewnętrzny jest zwykłym `<a>`.

## Jawne przybliżenia

- Radix UI zastąpiono natywną obsługą portalu, focusu, klawiatury, typu wyszukiwania, Escape, kliknięcia poza menu i kolizji z krawędziami. Nie jest to identyczny algorytm Radix: brak jego pełnej obsługi RTL, pointer grace area podmenu i wszystkich przypadków focus management.
- TransitionGroup zastąpiono lokalnymi stanami wejścia/wyjścia 350/200 ms. Nie odtworzono jego nieznanej obsługi przerwań.
- Brakujące Check, ChevronRight i Button zastąpiono prostymi SVG oraz przyciskiem. Ich wygląd jest orientacyjny.
- `spacing(2)` i `spacing(3)` przyjęto jako 0.5rem i 0.75rem; nieznany mixin hover jako `:hover`.
- Domyślne tokeny w warstwie `menu-defaults` są oszacowane. Podmień je na rzeczywiste tokeny projektu, aby dopasować wygląd. Przekazany globalny CSS zachowano w warstwie base.
- Reguły źródłowego CSS są globalne, aby obejmowały treści snippetów i niestandardowe linki; nazwy klas mogą kolidować z innymi stylami `.MenuItem`, `.Separator` itd.
- Części menu współdzielą jeden plik przez `part`. API składania komponentów Reacta nie może zostać zachowane dosłownie.
- To konwersja z uzgodnionym odtworzeniem braków, a nie zweryfikowany wizualnie klon 1:1. Przykłady Storybook nie zostały przekonwertowane na plik stories Svelte.

Validation: Svelte compiler (client + server), svelte-check: 0 errors / 0 warnings.
No browser interaction tests or visual comparison against React were run.
The part prop establishes context at construction and must not change on an existing instance.
-->
