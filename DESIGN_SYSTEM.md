# OCP Energy Dashboard - Design System

## Color Palette (Dark Mode)

### Primary Colors

- **Background**: `oklch(0.12 0 0)` - Deep black-blue (#0f0f1f)
  - Main page background
  - Provides maximum contrast

- **Foreground**: `oklch(0.95 0 0)` - Off-white (#f2f2f7)
  - Primary text color
  - High contrast with background

### Card & Component Colors

- **Card**: `oklch(0.16 0.02 245)` - Dark navy with blue tint (#1a1f3a)
  - Secondary surface color
  - Creates hierarchy above background
  - Used for data display cards

- **Card Foreground**: `oklch(0.92 0 0)` - Light text (#ebebf0)
  - Text inside cards
  - Slightly different from primary foreground

- **Popover**: `oklch(0.18 0.02 245)` - Slightly elevated (#1f2847)
  - Modals and dropdowns
  - Slightly lighter than card for depth

### Accent Colors

- **Primary Accent**: `oklch(0.7 0.2 200)` - Bright cyan (#00d9ff)
  - Interactive elements
  - Call-to-action buttons
  - Energy/tech aesthetic

- **Secondary Accent**: `oklch(0.6 0.25 190)` - Vibrant teal (#00e5cc)
  - Hover states
  - Highlights
  - Focus indicators

- **Tertiary Accent**: `oklch(0.55 0.18 250)` - Purple-blue (#7c5cff)
  - Secondary actions
  - Chart series
  - Alternate states

### Semantic Colors

- **Muted**: `oklch(0.28 0.05 245)` - Dark slate (#212738)
  - Disabled states
  - Secondary text

- **Muted Foreground**: `oklch(0.65 0 0)` - Gray text (#a6a6b0)
  - Placeholder text
  - Helper text
  - Low-priority information

- **Destructive**: `oklch(0.55 0.25 30)` - Warm red (#ff4444)
  - Errors
  - Warnings
  - Critical alerts

- **Border**: `oklch(0.25 0.03 245)` - Dark blue-gray (#252f45)
  - Subtle borders between elements
  - Creates structure without overwhelming

### Chart Colors

- **Chart 1 (Blue)**: `oklch(0.7 0.2 200)` - Cyan (#00d9ff)
- **Chart 2 (Teal)**: `oklch(0.6 0.25 190)` - Teal (#00e5cc)
- **Chart 3 (Purple)**: `oklch(0.55 0.18 250)` - Purple-blue (#7c5cff)
- **Chart 4 (Green)**: `oklch(0.65 0.2 160)` - Green (#20d995)
- **Chart 5 (Orange)**: `oklch(0.5 0.22 35)` - Orange (#ff9944)

Professional palette for energy monitoring visualizations with good contrast and distinction.

### Sidebar Colors

- **Sidebar Background**: `oklch(0.1 0 0)` - Darker than main (#0d0d1a)
  - Navigation container
  - Creates visual separation

- **Sidebar Foreground**: `oklch(0.95 0 0)` - Light text (#f2f2f7)
  - Navigation text
  - Menu labels

- **Sidebar Primary**: `oklch(0.7 0.2 200)` - Cyan (#00d9ff)
  - Active navigation item
  - Current page indicator

- **Sidebar Accent**: `oklch(0.35 0.08 245)` - Slate-blue (#2a3355)
  - Hover states on nav items
  - Secondary interactive state

- **Sidebar Border**: `oklch(0.2 0.02 245)` - Dark border (#16192e)
  - Dividers in sidebar
  - Subtle section separation

## Spacing System

- **Base Unit**: 0.25rem (4px)
- **Scale**: 0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8rem

### Component Spacing

- **Card Padding**: 1.5rem (24px)
- **Header Padding**: 2rem (32px) vertical, 1.5rem (24px) horizontal
- **Gap between items**: 1.5rem to 2rem
- **Element spacing**: 0.75rem to 1rem

## Typography

- **Font Family**: Geist (sans-serif)
- **Mono Font**: Geist Mono

### Font Sizes

- **H1**: 2.25rem (36px) - Page titles
- **H2**: 1.875rem (30px) - Section titles
- **H3**: 1.5rem (24px) - Subsection titles
- **Body**: 1rem (16px) - Primary text
- **Small**: 0.875rem (14px) - Secondary text
- **Extra Small**: 0.75rem (12px) - Captions, labels

## Border Radius

- **Small**: 0.375rem (6px)
- **Medium**: 0.625rem (10px)
- **Large**: 0.875rem (14px)
- **Extra Large**: 1.25rem (20px)

## Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## Transitions

- **Duration**: 200ms - 300ms
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Property**: Use `transition-colors`, `transition-all` sparingly

## Accessibility

- **Contrast Ratio**: All text meets WCAG AA standards
- **Focus States**: Use cyan accent (`--ring`) for visible focus
- **Color Usage**: Never rely on color alone - use icons, labels, and patterns
- **Motion**: Reduced motion respected with `@media (prefers-reduced-motion)`

## Files Modified

- `app/globals.css` - Color variables and theme definition
- `app/layout.tsx` - Root layout styling
- `app/page.tsx` - Homepage cards and component colors
- `components/sidebar.tsx` - Navigation styling
- `components/page-header.tsx` - Header styling
- `components/layout-wrapper.tsx` - Main layout colors
