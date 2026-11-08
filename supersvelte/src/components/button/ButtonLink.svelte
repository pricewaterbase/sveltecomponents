<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';
  import Button, { type ButtonProps } from './Button.svelte';
  type Props = Omit<ButtonProps, 'type' | 'as' | 'loading' | 'inert' | 'ref'> &
    Pick<HTMLAnchorAttributes, 'hreflang' | 'ping' | 'referrerpolicy'> & {
      href?: string;
      to?: string;
      external?: boolean;
      as?: 'a';
      children?: Snippet;
    };
  let { href, to, external, as = 'a', disabled = false, children, target, rel, ...rest }: Props = $props();
  const isExternal = $derived(external ?? /^https?:\/\//.test(href ?? to ?? ''));
</script>

<Button {...rest} as={disabled ? 'span' : (href || to) ? as : 'button'} {disabled} href={href ?? to}
  target={target ?? (isExternal ? '_blank' : undefined)}
  rel={rel ?? (isExternal ? 'noopener noreferrer' : undefined)}>
  {@render children?.()}
</Button>
