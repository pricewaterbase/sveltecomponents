---
name: supersvelte product direction
description: Brand name and the user's requirement for a structural redesign rather than cosmetic restyling.
---
The product is named **supersvelte** (lowercase). Use **current ChatGPT visual design**, but never simulate a chat. It remains an icon library with ordinary search above results. Light and dark modes are required.

**Why:** The user corrected the conversation-style implementation: “to niee ma udawac chatu tylko miec design jak chatgpt znajdz AKTUALNY design”. This supersedes the earlier approval of the proposed chat-screen layout. Message bubbles, echoed prompts and bottom message composers were not the intended requirement.

**How to apply:** Check the live reference rather than claiming a generic restyle is current. Transfer typography, navigation, surfaces and controls, not chat-specific interaction patterns. Preserve the icon library's real behavior.

Use only icons from this product's own library throughout the app. All application text uses Arial, including code-copy fields. Keep the supersvelte wordmark light rather than bold.

**Why:** The user explicitly required their own icons everywhere, Arial everywhere, and a thinner supersvelte name.

Use a reference screenshot already captured in the conversation before asking the user to supply the same view.

**Why:** The user pointed out that the requested reference had just been captured by the agent.

All copyable component examples must always contain SVGs inline; never add separate icon/chevron files or imports. Preserve the exact icons the user supplies, including replacements from newer ZIPs.

**Why:** The user reiterated: “ikony maja byc wklejone w kod komponentow zawsze i te co sie roznia zastap nowymi”. They also explicitly asked to keep the shared Menu.svelte and remove extra icon files.

**How to apply:** Keep shared component engines and examples portable without app-specific icon imports. This does not remove the application's own icon catalog.

The sidebar must always remain visible on desktop; mobile keeps the slide-out navigation.

**Why:** The user asked that the sidebar never hide and clarified “na desktoo”.

**How to apply:** Do not add desktop collapse controls or auto-hide behavior.

Put example-specific helper markup and logic directly in the matching demonstration; only reusable component engines belong in shared files.

**Why:** The user objected to separate helper files and asked why their code was not pasted into the matching demonstrations.

**How to apply:** Keep copied demo code self-contained apart from the actual shared components; do not create separate form, action-bar or content helpers for demonstrations.

All shared source files everywhere must start collapsed and use the user's supplied double-chevron SVG as the expansion control.

**Why:** The user explicitly replaced the earlier always-open requirement with “wszystkie wspolne pliki wszczedzie sa domyslnie zwiniete”.

**How to apply:** Apply this default to every existing and new component page. Keep copying available while collapsed and SVG inline.

The start page is a separate brand landing page and must not show components.

**Why:** The user explicitly corrected the catalog-style home: “zupelnie inne landing page nie ma pokazywac komponentow”.

**How to apply:** Do not put component demos, component cards, icon grids or catalog search on the landing page. Keep the library in its own sections.
