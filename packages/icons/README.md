# @pricewaterbase/icons

Katalog 755 ikon SVG z biblioteki supersvelte.

## Instalacja z GitHub Packages

Skonfiguruj rejestr dla organizacji:

```sh
npm config set @pricewaterbase:registry https://npm.pkg.github.com
npm install @pricewaterbase/icons
```

Prywatny dostęp wymaga tokena GitHub z uprawnieniem `read:packages`.

## Użycie

```ts
import { getIcon, icons, iconNames } from "@pricewaterbase/icons";

const searchIcon = getIcon("Search");
console.log(icons.length, iconNames.length, searchIcon?.svg);
```

Surowy katalog JSON jest dostępny przez `@pricewaterbase/icons/catalog.json`.
