<script module lang="ts">
  import type { Snippet } from 'svelte';
  export type EmptyMessageProps = {
    children?: Snippet;
    className?: string;
    fill?: 'static' | 'absolute' | 'none';
    part?: 'Root' | 'Icon' | 'Title' | 'Description' | 'ActionRow';
    size?: 'sm' | 'md';
    color?: 'secondary' | 'danger' | 'warning';
  };
</script>
<script lang="ts">
  let { children, className, fill = 'static', part = 'Root', size = 'md', color = 'secondary' }: EmptyMessageProps = $props();
  const classes = {Root:'EmptyMessage', Icon:'IconBadge', Title:'Title', Description:'Description', ActionRow:'ActionRow'};
</script>

<div class={[classes[part], className].filter(Boolean).join(' ')}
  data-fill={part === 'Root' ? fill : undefined}
  data-size={part === 'Icon' ? size : undefined}
  data-color={part === 'Icon' || part === 'Title' ? color : undefined}>
  {@render children?.()}
</div>

<style>
/* Fallbacks for missing project tokens, scoped to EmptyMessage so they never leak globally. Dark mode follows [data-theme="dark"]. */
@layer empty-message-defaults {
  :where(.EmptyMessage) {
    --radius-md:8px;
    --font-weight-semibold:600;
    --color-text:#202123;
    --color-text-secondary:#6b6b6b;
    --color-background-secondary-soft:#f0f0f0;
    --color-text-secondary-soft:#666;
    --color-background-danger-soft:#fce8e8;
    --color-text-danger-soft:#c32b2b;
    --color-text-danger:#c32b2b;
    --color-background-warning-soft:#fff2d6;
    --color-text-warning-soft:#a66a0a;
    --color-text-warning:#a66a0a;
  }
  :global([data-theme="dark"]) :where(.EmptyMessage) {
    --color-text:#ececec;
    --color-text-secondary:#aaa;
    --color-background-secondary-soft:#292929;
    --color-text-secondary-soft:#aaa;
    --color-background-danger-soft:#421f23;
    --color-text-danger-soft:#ff8b8b;
    --color-text-danger:#ff8b8b;
    --color-background-warning-soft:#3d301a;
    --color-text-warning-soft:#e7ba6b;
    --color-text-warning:#e7ba6b;
  }
}
.EmptyMessage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &[data-fill="static"] {
    width: 100%;
    height: 100%;
  }

  &[data-fill="absolute"] {
    position: absolute;
    inset: 0;
  }
}

.IconBadge {
  --badge-size: 40px;
  --icon-size: 24px;

  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--badge-size);
  height: var(--badge-size);
  border-radius: var(--radius-md);
  margin: 0 0 12px;
  background: var(--badge-background-color);
  color: var(--badge-text-color);

  :global(svg) {
    width: var(--icon-size);
    height: var(--icon-size);
  }

  &[data-size="sm"] {
    --badge-size: 32px;
    --icon-size: 20px;
  }

  &[data-color="secondary"] {
    --badge-background-color: var(--color-background-secondary-soft);
    --badge-text-color: var(--color-text-secondary-soft);
  }

  &[data-color="warning"] {
    --badge-background-color: var(--color-background-warning-soft);
    --badge-text-color: var(--color-text-warning-soft);
  }

  &[data-color="danger"] {
    --badge-background-color: var(--color-background-danger-soft);
    --badge-text-color: var(--color-text-danger-soft);
  }
}

.Title {
  max-width: 90%;
  color: var(--color-text);
  font-size: 16px;
  font-weight: var(--font-weight-semibold);
  text-align: center;
  text-wrap: balance;

  &:where([data-color="danger"]) {
    color: var(--color-text-danger);
  }

  &:where([data-color="warning"]) {
    color: var(--color-text-warning);
  }
}

.Description {
  max-width: 90%;
  margin: 6px 0 0;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.45;
  text-align: center;
  text-wrap: balance;
}

.ActionRow {
  margin-top: 1rem;
}

</style>
