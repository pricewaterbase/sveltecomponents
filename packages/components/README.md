# @pricewaterbase/components

Komponenty Svelte 5 z biblioteki supersvelte.

## Instalacja z GitHub Packages

Skonfiguruj rejestr dla organizacji:

```sh
npm config set @pricewaterbase:registry https://npm.pkg.github.com
npm install @pricewaterbase/components
```

Prywatny dostęp wymaga tokena GitHub z uprawnieniem `read:packages`.

## Użycie

```svelte
<script>
  import { Button, DatePicker, Menu, Popover } from '@pricewaterbase/components';
</script>

<Button>Kontynuuj</Button>
```

Komponenty są publikowane jako pliki `.svelte`; projekt odbiorcy musi obsługiwać
kompilację komponentów Svelte 5. Komponenty Markdown korzystają dodatkowo z
`katex` i pluginów `remark`/`rehype`.
