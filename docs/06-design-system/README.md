# Design System

## Filosofía

Software premium minimalista. Orden, rapidez, confiabilidad, profesionalismo.

## Tokens de color (Tailwind)

```css
--color-primary: theme('colors.blue.600');
--color-primary-dark: theme('colors.slate.900');
--color-success: theme('colors.emerald.500');
--color-warning: theme('colors.amber.500');
--color-danger: theme('colors.red.500');
--color-surface: theme('colors.white');
--color-background: theme('colors.gray.50');
--color-text: theme('colors.gray.900');
--color-text-muted: theme('colors.gray.500');
```

## Tipografía

- Font: Inter (Google Fonts)
- h1: text-2xl font-bold
- h2: text-xl font-semibold
- h3: text-lg font-medium
- body: text-sm
- caption: text-xs text-gray-500

## Espaciado

- Padding de cards: p-6
- Gap entre secciones: gap-6
- Gap entre elementos: gap-4
- Border radius: rounded-lg (8px)

## Componentes base

| Componente | Variantes | Uso |
|-----------|-----------|-----|
| Button | primary, secondary, danger, ghost | Acciones |
| Card | default, stat, interactive | Contenedores |
| Table | sortable, paginated, selectable | Listados |
| Input | text, number, date, select | Formularios |
| Badge | success, warning, danger, info | Estados |
| Modal | sm, md, lg | Diálogos |
| Alert | info, success, warning, danger | Mensajes |
| StatCard | con icono y trend | Dashboard KPIs |

## Iconos

Librería: Lucide React
Tamaño default: 20px (w-5 h-5)
Color: hereda del texto o primary

## Layout

```
┌─────────────────────────────────────┐
│ Topbar (logo, search, user menu)    │
├────────┬────────────────────────────┤
│        │                            │
│ Side   │  Content Area              │
│ bar    │  (pages)                   │
│        │                            │
│        │                            │
└────────┴────────────────────────────┘
```

Sidebar: 256px colapsable a 64px
Content: max-width responsive, padding p-6
