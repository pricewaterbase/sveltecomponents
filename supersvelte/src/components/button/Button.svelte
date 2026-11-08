<script module lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';
  export type ControlSize = '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  export type ButtonProps = Omit<HTMLButtonAttributes, 'children' | 'onclick' | 'onpointerenter' | 'inert' | 'class'> & {
    children?: Snippet;
    variant?: 'solid' | 'soft' | 'outline' | 'ghost';
    size?: ControlSize;
    iconSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    gutterSize?: '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    disabledTone?: 'relaxed';
    block?: boolean;
    uniform?: boolean;
    selected?: boolean;
    loading?: boolean;
    inert?: boolean;
    opticallyAlign?: 'start' | 'end';
    className?: string;
    onClick?: (event: MouseEvent) => void;
    onPointerEnter?: (event: PointerEvent) => void;
    ref?: HTMLButtonElement | HTMLAnchorElement | HTMLSpanElement | null;
    /** Internal support for ButtonLink. Shape is always pill/circular. */
    as?: 'button' | 'a' | 'span';
    href?: string;
    target?: HTMLAnchorAttributes['target'];
    rel?: string;
    download?: HTMLAnchorAttributes['download'];
  };
</script>

<script lang="ts">
  import { fade } from 'svelte/transition';
  let {
    type = 'button', variant = 'solid', uniform = false, size = 'md', iconSize,
    gutterSize, loading = false, selected = false, block = false, opticallyAlign,
    children, className, onClick, onPointerEnter, disabled = false, disabledTone,
    inert = loading, ref = $bindable(null), as = 'button', href, target, rel, download,
    ...restProps
  }: ButtonProps = $props();
  const isInert = $derived(disabled || inert);
  function click(event: MouseEvent) {
    if (isInert) { event.preventDefault(); return; }
    onClick?.(event);
  }
  function pointerEnter(event: PointerEvent) {
    // The original hover helper was not supplied: reproduce its press-scale purpose.
    if (event.pointerType !== 'touch') {
      const node = event.currentTarget as HTMLElement;
      node.style.setProperty('--scale', String(Math.max(0.95, 1 - 4 / Math.max(node.clientWidth, 1))));
    }
    onPointerEnter?.(event);
  }
</script>

<svelte:element this={as} bind:this={ref}
  {...restProps}
  type={as === 'button' ? type : undefined}
  role={as === 'span' ? 'link' : restProps.role}
  class={['Button', className].filter(Boolean).join(' ')}
  data-color="primary" data-variant={variant} data-pill=""
  data-uniform={uniform ? '' : undefined} data-size={size}
  data-gutter-size={gutterSize} data-icon-size={iconSize}
  data-loading={loading ? '' : undefined} data-selected={selected ? '' : undefined}
  data-block={block ? '' : undefined} data-optically-align={opticallyAlign}
  disabled={as === 'button' ? isInert : undefined}
  aria-disabled={isInert} aria-busy={loading || undefined}
  tabindex={isInert ? -1 : restProps.tabindex}
  data-disabled={disabled ? '' : undefined} data-disabled-tone={disabled ? disabledTone : undefined}
  href={as === 'a' && !isInert ? href : undefined}
  target={as === 'a' ? target : undefined} rel={as === 'a' ? rel : undefined}
  download={as === 'a' ? download : undefined}
  onclick={click} onpointerenter={pointerEnter}>
  {#if as === 'button'}
    <div class="ButtonLoader">
      {#if loading}<span class="LoadingIndicator" role="status" aria-label="Loading" in:fade={{duration:250}} out:fade={{duration:150}}></span>{/if}
    </div>
  {/if}
  <span class="ButtonInner">{@render children?.()}</span>
</svelte:element>

<style>

/* Estimated missing tokens, scoped to the button itself so other components keep their own tokens. */
@layer button-defaults {
  :where(.Button) {
    --control-size-3xs:22px; --control-size-2xs:24px; --control-size-xs:26px;
    --control-size-sm:28px; --control-size-md:32px; --control-size-lg:36px;
    --control-size-xl:40px; --control-size-2xl:44px; --control-size-3xl:48px;
    --control-gutter-3xs:4px; --control-gutter-2xs:6px; --control-gutter-xs:8px;
    --control-gutter-sm:10px; --control-gutter-md:12px; --control-gutter-lg:14px; --control-gutter-xl:16px;
    --control-icon-size-xs:14px; --control-icon-size-sm:16px; --control-icon-size-md:18px;
    --control-icon-size-lg:20px; --control-icon-size-xl:22px; --control-icon-size-2xl:24px;
    --control-font-size-sm:12px; --control-font-size-md:14px; --control-font-size-lg:16px;
    --control-radius-sm:6px; --control-radius-md:8px; --control-radius-lg:10px; --control-radius-xl:12px;
    --button-gap-sm:4px; --button-gap-md:6px; --button-gap-lg:8px;
    --button-font-weight:500; --radius-full:9999px; --control-gutter-pill-scaling:1.25;
    --transition-duration-basic:150ms; --transition-ease-basic:ease; --scale:0.98; --color-ring:#4085ff;
    --color-background-primary-solid:#202123; --color-background-primary-solid-hover:#38393b; --color-background-primary-solid-active:#4a4b4d;
    --color-text-primary-solid:#fff; --color-ring-primary-solid:#4085ff;
    --color-background-primary-soft-alpha:rgb(0 0 0 / 6%); --color-background-primary-soft-alpha-hover:rgb(0 0 0 / 10%); --color-background-primary-soft-alpha-active:rgb(0 0 0 / 14%);
    --color-text-primary-soft:#202123; --color-ring-primary-soft:#4085ff;
    --color-background-primary-ghost-hover:rgb(0 0 0 / 6%); --color-background-primary-ghost-active:rgb(0 0 0 / 10%);
    --color-text-primary-ghost:#202123; --color-text-primary-ghost-hover:#202123; --color-ring-primary-ghost:#4085ff;
    --color-background-primary-outline-hover:rgb(0 0 0 / 4%); --color-background-primary-outline-active:rgb(0 0 0 / 8%);
    --color-border-primary-outline:#ccc; --color-border-primary-outline-hover:#aaa;
    --color-text-primary-outline:#202123; --color-text-primary-outline-hover:#202123; --color-ring-primary-outline:#4085ff;
    --color-background-disabled:#ececec; --color-border-disabled:#ddd; --color-text-disabled:#aaa;
  }
  :global([data-theme="dark"]) :where(.Button) {
    --color-background-primary-solid:#ececec; --color-background-primary-solid-hover:#d6d6d6; --color-background-primary-solid-active:#bfbfbf; --color-text-primary-solid:#171717;
    --color-background-primary-soft-alpha:rgb(255 255 255 / 10%); --color-background-primary-soft-alpha-hover:rgb(255 255 255 / 15%); --color-background-primary-soft-alpha-active:rgb(255 255 255 / 20%); --color-text-primary-soft:#ececec;
    --color-background-primary-ghost-hover:rgb(255 255 255 / 10%); --color-background-primary-ghost-active:rgb(255 255 255 / 15%); --color-text-primary-ghost:#ececec; --color-text-primary-ghost-hover:#fff;
    --color-background-primary-outline-hover:rgb(255 255 255 / 6%); --color-background-primary-outline-active:rgb(255 255 255 / 10%); --color-border-primary-outline:#555; --color-border-primary-outline-hover:#777; --color-text-primary-outline:#ececec; --color-text-primary-outline-hover:#fff;
    --color-background-disabled:#2c2c2c; --color-border-disabled:#3a3a3a; --color-text-disabled:#666;
  }
  .Button {border:0;background:transparent;font-family:inherit;text-decoration:none;box-sizing:border-box;vertical-align:middle;}
}
.LoadingIndicator {display:block;width:var(--indicator-size,16px);height:var(--indicator-size,16px);border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:button-spin .7s linear infinite;}
@keyframes button-spin {to{transform:rotate(360deg);}}
.Button {
  position: relative;
  display: inline-block;
  gap: var(--button-gap); /* Propagates down to .ButtonInner */
  flex-shrink: 0;
  height: var(--button-size);
  padding: 0 var(--button-gutter);
  border-radius: var(--button-radius);
  cursor: pointer;
  font-size: var(--button-font-size);
  font-weight: var(--button-font-weight);
  line-height: 1;
  transition-duration: var(--transition-duration-basic);
  transition-property: opacity, color;
  transition-timing-function: var(--transition-ease-basic);
  user-select: none;
  white-space: nowrap;

  /* Background / shape of the button */
  &::before {
    position: absolute;
    inset: 0;
    display: block;
    border-radius: inherit;
    content: "";
    transition-duration: var(--transition-duration-basic);
    transition-property: opacity, background-color, transform, box-shadow, border-color;
    transition-timing-function: var(--transition-ease-basic);
    /* Composite layer seems required in some cases to avoid visual artifacts. */
    will-change: transform;
  }

  /* Focus ring */
  &::after {
    position: absolute;
    inset: 0;
    display: block;
    border-radius: inherit;
    content: "";
    pointer-events: none;
    transition-duration: var(--transition-duration-basic);
    transition-property: transform;
    transition-timing-function: var(--transition-ease-basic);
    /* Composite layer seems required in some cases to avoid visual artifacts. */
    will-change: transform;
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    &::after {
      outline: 2px solid var(--button-ring-color, var(--color-ring));
      outline-offset: var(--button-ring-offset, 2px);
    }
  }

  :global(svg:where(:not([data-no-autosize]))) {
    width: var(--button-icon-size);
    height: var(--button-icon-size);

    &:global(:where(:first-child:not(:only-child))) {
      margin-left: var(--button-icon-offset, -1px);
    }

    &:global(:where(:last-child:not(:only-child))) {
      margin-right: var(--button-icon-offset, -1px);
    }
  }

  /* =============================================
    Optical alignment
  ============================================= */
  &:where([data-optically-align="start"]) {
    margin-inline-start: calc(var(--button-gutter) * -1);
  }

  &:where([data-optically-align="end"]) {
    margin-inline-end: calc(var(--button-gutter) * -1);
  }

  /* Uniform buttons zero-out button-gutter, requiring custom calcs */
  &:where([data-optically-align="start"][data-uniform]) {
    margin-inline-start: calc(((var(--button-size) - var(--button-icon-size)) / 2) * -1);
  }

  &:where([data-optically-align="end"][data-uniform]) {
    margin-inline-end: calc(((var(--button-size) - var(--button-icon-size)) / 2) * -1);
  }

  /* =============================================
    Sizes
  ============================================= */
  &:where([data-size="3xs"]) {
    --button-size: var(--control-size-3xs);
    --button-gutter: var(--control-gutter-2xs);
    --button-font-size: var(--control-font-size-sm);
    --button-icon-size: var(--control-icon-size-xs);
    --button-gap: var(--button-gap-sm);
    --button-radius: var(--control-radius-sm);
    --button-icon-offset: -1px;
    --indicator-size: 11px;
    --circular-progress-size: 11px;
  }

  &:where([data-size="2xs"]) {
    --button-size: var(--control-size-2xs);
    --button-gutter: var(--control-gutter-xs);
    --button-font-size: var(--control-font-size-sm);
    --button-icon-size: var(--control-icon-size-sm);
    --button-gap: var(--button-gap-md);
    --button-radius: var(--control-radius-sm);
    --button-icon-offset: -1px;
    --indicator-size: 12px;
    --circular-progress-size: 12px;
  }

  &:where([data-size="xs"]) {
    --button-size: var(--control-size-xs);
    --button-gutter: var(--control-gutter-xs);
    --button-font-size: var(--control-font-size-md);
    --button-icon-size: var(--control-icon-size-sm);
    --button-gap: var(--button-gap-md);
    --button-radius: var(--control-radius-sm);
    --button-icon-offset: -1px;
    --indicator-size: 13px;
    --circular-progress-size: 14px;
  }

  &:where([data-size="sm"]) {
    --button-size: var(--control-size-sm);
    --button-gutter: var(--control-gutter-sm);
    --button-font-size: var(--control-font-size-md);
    --button-icon-size: var(--control-icon-size-md);
    --button-gap: var(--button-gap-md);
    --button-radius: var(--control-radius-sm);
    --button-icon-offset: -1px;
    --indicator-size: 15px;
    --circular-progress-size: 15px;
  }

  &:where([data-size="md"]) {
    --button-size: var(--control-size-md);
    --button-gutter: var(--control-gutter-md);
    --button-font-size: var(--control-font-size-md);
    --button-icon-size: var(--control-icon-size-md);
    --button-gap: var(--button-gap-lg);
    --button-radius: var(--control-radius-md);
    --button-icon-offset: -1px;
    --indicator-size: 16px;
    --circular-progress-size: 16px;
  }

  &:where([data-size="lg"]) {
    --button-size: var(--control-size-lg);
    --button-gutter: var(--control-gutter-md);
    --button-font-size: var(--control-font-size-md);
    --button-icon-size: var(--control-icon-size-md);
    --button-gap: var(--button-gap-lg);
    --button-radius: var(--control-radius-md);
    --button-icon-offset: -1px;
    --indicator-size: 16px;
    --circular-progress-size: 16px;
  }

  &:where([data-size="xl"]) {
    --button-size: var(--control-size-xl);
    --button-gutter: var(--control-gutter-lg);
    --button-font-size: var(--control-font-size-md);
    --button-icon-size: var(--control-icon-size-md);
    --button-gap: var(--button-gap-lg);
    --button-radius: var(--control-radius-lg);
    --button-icon-offset: -1px;
    --indicator-size: 18px;
    --circular-progress-size: 18px;
  }

  &:where([data-size="2xl"]) {
    --button-size: var(--control-size-2xl);
    --button-gutter: var(--control-gutter-lg);
    --button-font-size: var(--control-font-size-lg);
    --button-icon-size: var(--control-icon-size-lg);
    --button-gap: var(--button-gap-lg);
    --button-radius: var(--control-radius-xl);
    --button-icon-offset: -2px;
    --indicator-size: 18px;
    --circular-progress-size: 18px;
  }

  &:where([data-size="3xl"]) {
    --button-size: var(--control-size-3xl);
    --button-gutter: var(--control-gutter-xl);
    --button-font-size: var(--control-font-size-lg);
    --button-icon-size: var(--control-icon-size-lg);
    --button-gap: var(--button-gap-lg);
    --button-radius: var(--control-radius-xl);
    --button-icon-offset: -2px;
    --indicator-size: 20px;
    --circular-progress-size: 20px;
  }

  /* =============================================
    Gutter sizes
  ============================================= */
  &:where([data-gutter-size="2xs"]) {
    --button-gutter: var(--control-gutter-2xs);
  }

  &:where([data-gutter-size="xs"]) {
    --button-gutter: var(--control-gutter-xs);
  }

  &:where([data-gutter-size="sm"]) {
    --button-gutter: var(--control-gutter-sm);
  }

  &:where([data-gutter-size="md"]) {
    --button-gutter: var(--control-gutter-md);
  }

  &:where([data-gutter-size="lg"]) {
    --button-gutter: var(--control-gutter-lg);
  }

  &:where([data-gutter-size="xl"]) {
    --button-gutter: var(--control-gutter-xl);
  }

  /* =============================================
    Icon sizes
  ============================================= */
  &:where([data-icon-size="sm"]) {
    --button-icon-size: var(--control-icon-size-sm);
  }

  &:where([data-icon-size="md"]) {
    --button-icon-size: var(--control-icon-size-md);
  }

  &:where([data-icon-size="lg"]) {
    --button-icon-size: var(--control-icon-size-lg);
  }

  &:where([data-icon-size="xl"]) {
    --button-icon-size: var(--control-icon-size-xl);
  }

  &:where([data-icon-size="2xl"]) {
    --button-icon-size: var(--control-icon-size-2xl);
  }

  /* =============================================
    Pill
  ============================================= */
  &:where([data-pill]) {
    --button-radius: var(--radius-full);

    padding: 0 calc(var(--button-gutter) * var(--control-gutter-pill-scaling));
  }

  /* =============================================
    Block
  ============================================= */
  &:where([data-block]) {
    width: 100%;
  }

  /* =============================================
    Uniform
  ============================================= */
  &[data-uniform] {
    --button-gutter: 0;

    width: var(--button-size);
  }

  /* =============================================
    Ghost variant
  ============================================= */
  &[data-variant="ghost"] {
    --button-ring-offset: -1px;

    color: var(--button-text-color);

    &::before {
      background-color: var(--button-background-color);
      opacity: 0;
      transform: scale(var(--scale));
    }

    &[aria-expanded="true"],
    &[data-state="open"] {
      color: var(--button-text-color-hover);

      &::before {
        /* Slightly deemphasize */
        opacity: 0.6;
        transform: scale(1);
      }
    }

    &[data-selected] {
      color: var(--button-text-color-hover);

      &::before {
        opacity: 1;
        transform: scale(1);
      }
    }

    &:where(:not([data-disabled])) {
      &:hover {
        color: var(--button-text-color-hover);

        &::before {
          opacity: 1;
          transform: scale(1);
        }
      }

      &:active {
        &::before {
          background-color: var(--button-background-color-active);
          opacity: 1;
          transform: scale(var(--scale));
        }

        &::after {
          transform: scale(var(--scale));
        }
      }
    }

    &:where([data-color="primary"]) {
      --button-background-color: var(--color-background-primary-ghost-hover);
      --button-background-color-active: var(--color-background-primary-ghost-active);
      --button-text-color: var(--color-text-primary-ghost);
      --button-text-color-hover: var(--color-text-primary-ghost-hover);
      --button-ring-color: var(--color-ring-primary-ghost);
    }














  }

  /* =============================================
    Solid variant
  ============================================= */
  &[data-variant="solid"] {
    color: var(--button-text-color);

    &::before {
      background-color: var(--button-background-color);
    }

    &[aria-expanded="true"],
    &[data-state="open"],
    &[data-selected] {
      &::before {
        background-color: var(--button-background-color-hover);
      }
    }

    &:where(:not([data-disabled])) {
      &:hover {
        &::before {
          background-color: var(--button-background-color-hover);
        }
      }

      &:active {
        &::before {
          background-color: var(--button-background-color-active);
        }

        &::before,
        &::after {
          transform: scale(var(--scale));
        }
      }
    }

    &:where([data-color="primary"]) {
      --button-background-color: var(--color-background-primary-solid);
      --button-background-color-hover: var(--color-background-primary-solid-hover);
      --button-background-color-active: var(--color-background-primary-solid-active);
      --button-text-color: var(--color-text-primary-solid);
      --button-ring-color: var(--color-ring-primary-solid);
    }














  }

  /* =============================================
    Soft variant
  ============================================= */
  &[data-variant="soft"] {
    color: var(--button-text-color);

    &::before {
      background-color: var(--button-background-color);
    }

    &[aria-expanded="true"],
    &[data-state="open"],
    &[data-selected] {
      &::before {
        background-color: var(--button-background-color-hover);
      }
    }

    &:where(:not([data-disabled])) {
      &:hover {
        &::before {
          background-color: var(--button-background-color-hover);
        }
      }

      &:active {
        &::before {
          background-color: var(--button-background-color-active);
        }

        &::before,
        &::after {
          transform: scale(var(--scale));
        }
      }
    }

    &:where([data-color="primary"]) {
      --button-background-color: var(--color-background-primary-soft-alpha);
      --button-background-color-hover: var(--color-background-primary-soft-alpha-hover);
      --button-background-color-active: var(--color-background-primary-soft-alpha-active);
      --button-text-color: var(--color-text-primary-soft);
      --button-ring-color: var(--color-ring-primary-soft);
    }














  }

  /* =============================================
    Outline variant
  ============================================= */
  &[data-variant="outline"] {
    --button-ring-offset: -1px;

    color: var(--button-text-color);

    &::before {
      background-color: transparent;
      box-shadow:
        0 0 0 1px var(--button-border-color) inset,
        var(--button-shadow-custom, 0 0 #00000000);
    }

    &[aria-expanded="true"],
    &[data-state="open"],
    &[data-selected] {
      color: var(--button-text-color-hover);

      &::before {
        background-color: var(--button-background-color-hover);
        box-shadow:
          0 0 0 1px var(--button-border-color-hover) inset,
          var(--button-shadow-custom, 0 0 #00000000);
      }
    }

    &:where(:not([data-disabled])) {
      &:hover {
        color: var(--button-text-color-hover);

        &::before {
          background-color: var(--button-background-color-hover);
          box-shadow:
            0 0 0 1px var(--button-border-color-hover) inset,
            var(--button-shadow-custom, 0 0 #00000000);
        }
      }

      &:active {
        &::before {
          background-color: var(--button-background-color-active);
          transform: scale(var(--scale));
        }

        &::after {
          transform: scale(var(--scale));
        }
      }
    }

    &:where([data-color="primary"]) {
      --button-background-color-hover: var(--color-background-primary-outline-hover);
      --button-background-color-active: var(--color-background-primary-outline-active);
      --button-border-color: var(--color-border-primary-outline);
      --button-border-color-hover: var(--color-border-primary-outline-hover);
      --button-text-color: var(--color-text-primary-outline);
      --button-text-color-hover: var(--color-text-primary-outline-hover);
      --button-ring-color: var(--color-ring-primary-outline);
    }














  }

  /* =============================================
    Disabled
  ============================================= */
  /* Non-visual disablement, akin to `inert` */
  &[disabled] {
    pointer-events: none;
  }

  /* Visual disablement */
  &[data-disabled][data-variant] {
    --button-background-color: var(--color-background-disabled);
    --button-border-color: var(--color-border-disabled);
    --button-text-color: var(--color-text-disabled);

    cursor: not-allowed;
    pointer-events: auto;

    /* Don't press while disabled */
    &:active::before {
      transform: scale(1);
    }

    /* Relaxed disabled tone: keep disabled visuals, soften cursor */
    &[data-disabled-tone="relaxed"] {
      cursor: default;
    }
  }
}

.ButtonInner {
  position: relative;
  display: flex;
  /* Allows overrides through className on .Button */
  flex-direction: inherit;
  align-items: center;
  justify-content: center;
  /* Allows overrides through className on .Button */
  gap: inherit;
  width: 100%;
  /* Prevent padding-bottom from creating excess height (flexbox) */
  height: 100%;
  transition: opacity 0.15s ease 0.1s;

  [data-loading] & {
    opacity: 0;
    transition: opacity 0.3s ease;
  }
}

.ButtonLoader {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  &[data-entering] {
    opacity: 0;
  }

  &[data-exiting] {
    opacity: 1;
  }

  &[data-entering-active],
  &[data-entering][data-interrupted] {
    opacity: 1;
    transition: opacity 0.15s ease 0.1s;
  }

  &[data-exiting-active],
  &[data-exiting][data-interrupted] {
    opacity: 0;
    transition: opacity 0.15s ease;
  }
}

/* .Kbd {
  display: none;

  @mixin breakpoint md {
    display: block;
    padding: 1px 3px;
    border: 1px solid var(--kbd-border-color, transparent);
    border-radius: 4px;
    margin: 0 -2px 0 4px;
    background: var(--kbd-bg, var(--alpha-10));
    color: var(--kbd-color, inherit);
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      "Open Sans",
      "Helvetica Neue",
      sans-serif;
    font-size: 13px;
    font-style: normal;
    font-weight: 600;
    letter-spacing: var(--tracking-wide);
    transition:
      border-color 0.15s ease,
      background-color 0.15s ease,
      color 0.15s ease;

    [data-size="2xs"] & {
      margin-right: 0;
      margin-left: 3px;
      font-size: 12px;
    }

    [data-size="xs"] & {
      font-size: 12px;
    }

    [data-size="sm"] & {
      margin-right: -1px;
    }

    [data-size="xl"] & {
      padding: 2px 3px;
      font-size: 14px;
    }

    [data-pill] & {
      border-radius: 8px;
      margin-right: -5px;
    }

    [data-size="2xs"][data-pill] & {
      margin-right: -4px;
    }
  }
} */
</style>
