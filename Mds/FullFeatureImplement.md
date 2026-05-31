Before implementing, do not jump directly into coding.

First, inspect the project structure and read all relevant files needed to understand the existing implementation, patterns, UI style, data flow, routing, forms, dialogs, server/client component boundaries, and naming conventions.

This is a Next.js 16 project using the App Router, with a strong focus on SSR and SSG where appropriate. The UI should primarily use shadcn/ui components, Tailwind CSS for styling, and lucide-react for icons.

Your goal is not to add a basic placeholder implementation. Your goal is to implement this as a realistic, production-quality feature that feels fully integrated into the existing app.

When adding or modifying any feature, screen, page, component, form, action, modal, dialog, table, card, empty state, filter, button, navigation item, or workflow:

1. Study the existing related screens, components, layouts, folders, and patterns before making changes.
2. Follow the existing file and folder structure. Do not invent a new structure unless clearly necessary.
3. Match the visual style, spacing, component composition, naming conventions, and interaction patterns already used in the app.
4. If similar actions elsewhere use dialogs, sheets, dropdowns, forms, confirmation modals, toast messages, loading states, empty states, or validation, use the same pattern here.
5. Do not create shallow UI. Implement the complete expected flow as much as possible.
6. Avoid placeholder-only buttons, fake interactions, or incomplete forms unless there is genuinely no existing backend/data pattern to follow.
7. If adding a create/edit flow, include realistic fields based on the domain and existing app patterns.
8. If adding a list/table/grid view, include useful columns, actions, filters/search/sorting where appropriate, empty states, and loading/error handling if the app already uses those patterns.
9. If adding detail views, include meaningful sections, metadata, related actions, and realistic layout based on nearby features.
10. If the app already has reusable components/hooks/actions/schemas/types, use or extend them instead of duplicating logic.
11. Respect server/client component boundaries. Use client components only where interactivity requires them.
12. Keep the implementation clean, consistent, and maintainable.
13. Do not leave comments in any file.
14. Do not leave TODOs, console logs, unused imports, dead code, or mock placeholders unless explicitly requested.
15. After implementation, review the changed files for consistency, TypeScript correctness, formatting, import paths, and whether the feature actually works end-to-end.

Before editing files, briefly explain:
- Which files/folders you inspected
- What existing patterns you found
- The implementation plan
- Any assumptions you are making

Then implement the feature according to that plan.

The final result should feel like it was built by the original developer of this app, not added as a generic isolated feature.