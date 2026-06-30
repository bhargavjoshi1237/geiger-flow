# Geiger Studio — Design System Conventions

## Wrapping and setup

Most components render standalone. Two require context providers:

- **Tooltip**: wrap the usage site in `<TooltipProvider>` (exported as `GeigerFlow.TooltipProvider`). Without it, `Tooltip` throws a context error.
- **Sidebar**: wrap with `<SidebarProvider>` (`GeigerFlow.SidebarProvider`). The `useSidebar` hook is internal; don't import it.

`ThemeToggle` calls `useTheme()` from `next-themes` — it renders visually but the click handler will be a no-op unless `ThemeProvider` is in the tree. For static mocks, treat it as a display-only component.

No other global provider is needed for shadcn primitives (Button, Card, Dialog, Select, Tabs, etc.).

## Styling idiom — Tailwind utilities + Geiger semantic tokens

This is a **Tailwind utility-class** system. Style layout glue with Tailwind classes. Do **not** write arbitrary CSS or inline `style=` for anything covered below.

The design system adds these semantic token utilities on top of Tailwind defaults — **always prefer these over generic Tailwind colors**:

| Purpose | Class |
|---|---|
| Page background | `bg-background` |
| Panel / card surface | `bg-surface-subtle` |
| Card / inner surface | `bg-surface-card` |
| Hover surface | `bg-surface-hover` |
| Active / pressed | `bg-surface-active` |
| Strong surface | `bg-surface-strong` |
| Primary foreground | `text-foreground` |
| Secondary text | `text-muted-foreground` |
| Dimmer secondary | `text-text-secondary` |
| Tertiary / placeholder | `text-text-tertiary` |
| Default border | `border-border` |
| Strong border | `border-border-strong` |
| Brand primary | `bg-primary` + `text-primary-foreground` |
| Success / positive trend | `text-emerald-400` |
| Danger / negative trend | `text-red-400` |
| Destructive action text | `text-red-400 focus:bg-red-500/10` |

Status/severity badges use Tailwind color utilities at `/10` bg + `/20` border (e.g. `bg-blue-500/10 border-blue-500/20 text-blue-400`).

Radius: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl` map to the project's radius scale.

## Where truth lives

- **Component API**: each `components/<group>/<Name>/<Name>.d.ts` (the `<Name>Props` interface)
- **Component docs**: each `components/<group>/<Name>/<Name>.prompt.md`
- **All styles** (tokens + component CSS): `styles.css` and its `@import` chain — `_ds_bundle.css` contains the compiled component styles

Read `.prompt.md` before using any component — it lists all props and valid values.

## Idiomatic snippet

```jsx
// A typical Geiger card with a primary action — adapted from the app's patterns
<Card className="bg-surface-subtle border border-border rounded-xl">
  <CardHeader>
    <CardTitle className="text-foreground text-sm font-semibold">Title</CardTitle>
    <CardDescription className="text-muted-foreground text-xs">Supporting text</CardDescription>
  </CardHeader>
  <CardContent className="space-y-3">
    <Input placeholder="Enter value…" className="bg-surface-card" />
  </CardContent>
  <CardFooter className="flex justify-end gap-2">
    <Button variant="ghost">Cancel</Button>
    <Button variant="default">Confirm</Button>
  </CardFooter>
</Card>
```
