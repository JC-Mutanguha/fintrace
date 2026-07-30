# FinTrace UI rules (runtime)

**Single source of truth for the live app:** `src/app/globals.css` + `src/components/ui/`.

`design/stitch/html/` is reference-only — never copy classes from those files into `src/`.

## Do

- Use components from `@/components/ui` for buttons, modals, text, cards, errors, lists
- Use semantic tokens: `text-title`, `text-body`, `p-md`, `gap-lg`, `rounded-card`, `max-w-dialog`
- Use `MobileHeader` + `PageMain` on every authenticated page
- Add new colors/radius/type sizes to `globals.css` `@theme` first

## Do not

- **`max-w-md`, `max-w-sm`, `max-w-lg`** — they resolve to spacing px (16px, 12px, 24px) because of custom `--spacing-*` tokens
- Raw `#hex` in TSX — add a `--color-*` token instead
- One-off modal scrims — use `<Modal>`
- One-off primary buttons — use `<Button variant="primary">`
- Copy Tailwind from Stitch HTML (different Tailwind version and colors)

## Width tokens

| Need | Class |
|------|-------|
| Page content | `max-w-content` (42rem) |
| Dialog | `max-w-dialog` (28rem) |
| Small sheet | `max-w-sheet` (24rem) |
| Narrow input | `max-w-narrow` (20rem) |

## Typography

| Use | Class |
|-----|-------|
| Page title (desktop) | `Text variant="title"` |
| Section heading | `Text variant="heading"` |
| Body | `Text variant="body"` or `text-body` |
| Caption | `Text variant="caption"` |

## Adding new UI

1. Check if a `ui/` component exists
2. If not, add the primitive to `src/components/ui/` using tokens
3. Compose in the page — do not paste 20 lines of Tailwind for a button
