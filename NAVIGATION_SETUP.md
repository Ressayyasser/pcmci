# Navigation Setup Guide

## Overview
This guide explains how to activate the new sidebar navigation system with proper page layouts throughout the application.

## What's New
- **Sidebar Component** (`components/sidebar.tsx`): Unified navigation with collapsible menu
- **Page Layout Wrapper** (`components/page-layout.tsx`): Consistent header and footer for all pages
- **New Page Files**: Updated pages with integrated sidebar and layout system

## Files Created
- `components/page-layout.tsx` - Universal page layout component
- `app/pcmci/page-new.tsx` - PCMCI page with sidebar
- `app/anomalies/page-new.tsx` - Anomalies page with sidebar
- `app/rl-strategy/page-new.tsx` - Q-Learning page with sidebar
- `app/insights/page-new.tsx` - Insights page with sidebar
- `app/app-wrapper.tsx` - App wrapper for layout integration
- `app/dashboard-home.tsx` - Dashboard component with sidebar

## Step 1: Replace Page Files

Replace the existing page files with the new ones:

```bash
# Backup originals
cp app/page.tsx app/page-backup.tsx
cp app/pcmci/page.tsx app/pcmci/page-backup.tsx
cp app/anomalies/page.tsx app/anomalies/page-backup.tsx
cp app/rl-strategy/page.tsx app/rl-strategy/page-backup.tsx
cp app/insights/page.tsx app/insights/page-backup.tsx

# Replace with new versions
mv app/page-new.tsx app/page.tsx  # From dashboard-home.tsx content
mv app/pcmci/page-new.tsx app/pcmci/page.tsx
mv app/anomalies/page-new.tsx app/anomalies/page.tsx
mv app/rl-strategy/page-new.tsx app/rl-strategy/page.tsx
mv app/insights/page-new.tsx app/insights/page.tsx
```

## Step 2: Update Layout File

The `app/layout.tsx` should include the sidebar wrapper. If it's still locked, use the AppWrapper component:

Option A (Recommended): Update layout.tsx directly
```typescript
import { Sidebar } from '@/components/sidebar'

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-slate-950">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
```

Option B: Use AppWrapper in each page
```typescript
// In each page.tsx:
import { AppWrapper } from '@/app/app-wrapper'

export default function Page() {
  return (
    <AppWrapper>
      {/* Your content */}
    </AppWrapper>
  )
}
```

## Step 3: Verify Navigation

After replacing files:
1. Start the dev server: `pnpm dev`
2. Navigate to http://localhost:3000
3. You should see:
   - Sidebar on the left with all navigation items
   - Collapsible menu on mobile (< 768px)
   - Each page has consistent header and footer
   - Links between pages work smoothly

## Navigation Structure

```
OCP Energy Dashboard
├── Dashboard (/)
│   ├── Overview Tab
│   ├── PCMCI Tab
│   ├── Anomalies Tab
│   └── Q-Learning Tab
├── PCMCI Analysis (/pcmci)
│   ├── Summary cards
│   ├── Causal links table
│   └── Navigation links
├── Anomaly Detection (/anomalies)
│   ├── Summary cards
│   ├── Anomaly list
│   └── Severity indicators
├── Q-Learning Strategy (/rl-strategy)
│   ├── Training metrics
│   ├── Learned policy table
│   └── Algorithm details
└── Insights (/insights)
    ├── Key findings
    ├── Recommendations
    ├── Next steps
    └── System overview
```

## Sidebar Features

### Desktop (≥ 768px)
- Fixed sidebar (64px collapsed or 256px expanded)
- Smooth collapse animation
- Always visible

### Mobile (< 768px)
- Hamburger menu toggle
- Overlay sidebar (off-canvas)
- Auto-closes when navigating
- Tap overlay to close

### Navigation Items
- **Home** (BarChart3 icon) - System overview
- **PCMCI Analysis** (Network icon) - Causal relationships
- **Anomaly Detection** (AlertTriangle icon) - Anomaly results
- **Q-Learning Strategy** (Zap icon) - RL optimization
- **Insights** (Lightbulb icon) - Key recommendations

## Customization

### Colors
Edit `components/sidebar.tsx` to change:
- `color` property on each nav item
- Background gradients
- Hover states

### Navigation Items
Add/remove items in `navigationItems` array:
```typescript
const navigationItems = [
  {
    label: 'Your Item',
    href: '/your-path',
    icon: <YourIcon className="w-5 h-5" />,
    description: 'Item description',
    color: 'text-blue-400',
  },
  // ...
]
```

### Page Layout
Edit `components/page-layout.tsx` to customize:
- Header styling
- Footer content
- Max-width constraints
- Spacing and padding

## Troubleshooting

### Sidebar not appearing
- Check if `Sidebar` component is imported in layout
- Verify `components/sidebar.tsx` exists
- Check browser console for errors

### Pages not loading
- Ensure all `page-new.tsx` files are renamed to `page.tsx`
- Check API endpoints in `/api/summary`, `/api/pcmci`, etc.
- Verify backend is running if needed

### Styling issues
- Clear `.next` build cache: `rm -rf .next`
- Rebuild: `pnpm build`
- Restart dev server: `pnpm dev`

### Mobile menu not working
- Check if touch events are enabled
- Verify Tailwind CSS responsive classes are applied
- Test in actual mobile device or use Chrome DevTools device emulation

## API Dependencies

Ensure your backend API provides these endpoints:
- `GET /api/summary` - Dashboard overview
- `GET /api/pcmci` - PCMCI causal analysis
- `GET /api/anomalies` - Anomaly detection results
- `GET /api/rl_strategy` - Q-Learning metrics
- `GET /api/insights` - Key insights

If backend is not available, pages will show loading state and error messages.

## Performance Notes

- Sidebar state is client-side only (no persistence)
- Each page loads data independently via API calls
- Consider adding caching with SWR for better performance
- Mobile sidebar closes automatically on navigation

## Future Enhancements

- Add breadcrumbs to show navigation path
- Implement search functionality in sidebar
- Add recent pages history
- Dark/light theme toggle
- User preferences for sidebar state persistence
- Analytics for page navigation
