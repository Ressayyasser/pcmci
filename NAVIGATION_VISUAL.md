# Visual Navigation Structure

## Desktop Layout (≥768px)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser Window                          │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                  │
│   SIDEBAR    │             MAIN CONTENT AREA                   │
│              │                                                  │
│ ┌──────────┐ │ ┌─────────────────────────────────────────────┐ │
│ │OCP Energy│ │ │  OCP Energy Dashboard                       │ │
│ │Anomaly   │ │ │  Advanced anomaly detection...              │ │
│ │Detection │ │ │                                             │ │
│ └──────────┘ │ │                                             │ │
│              │ │  [Overview] [PCMCI] [Anomalies] [Q-Learning]│ │
│ ┌──────────┐ │ │                                             │ │
│ │ Dashboard│ │ │  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐ │ │
│ │ PCMCI    │ │ │  │Dataset │ │Causal  │ │Anomaly │ │RL    │ │ │
│ │ Anomalies│ │ │  │        │ │Links   │ │        │ │Agent │ │ │
│ │ RL       │ │ │  │ 8,760  │ │  55    │ │ 31     │ │ -1.3 │ │ │
│ │ Insights │ │ │  │records │ │links   │ │detected│ │reward│ │ │
│ │          │ │ │  └────────┘ └────────┘ └────────┘ └──────┘ │ │
│ └──────────┘ │ │                                             │ │
│              │ │  [Data Summary Section]                     │ │
│ ┌──────────┐ │ │  [Additional Content...]                   │ │
│ │●Operational
│ │           │ │                                             │ │
│ └──────────┘ │ └─────────────────────────────────────────────┘ │
│              │                                                  │
│ 256px        │ ~1000px+                                         │
└──────────────┴──────────────────────────────────────────────────┘
```

## Mobile Layout (<768px)

### Default State (Sidebar Hidden)
```
┌──────────────────────────────┐
│  ☰  OCP Energy Dashboard      │ ← Header with menu toggle
├──────────────────────────────┤
│                              │
│      MAIN CONTENT            │
│                              │
│  ┌─────────────────────────┐ │
│  │                         │ │
│  │  Dashboard Content      │ │
│  │  ...                    │ │
│  │                         │ │
│  └─────────────────────────┘ │
│                              │
└──────────────────────────────┘
```

### Menu Open State
```
┌──────────────────────────────┐
│  ✕  OCP Energy Dashboard      │ ← Close button
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ Sidebar Overlay          │ │
│ │                          │ │
│ │ OCP Energy               │ │
│ │ Anomaly Detection        │ │
│ │                          │ │
│ │ ► Dashboard              │ │
│ │ ► PCMCI Analysis         │ │
│ │ ► Anomaly Detection      │ │
│ │ ► Q-Learning Strategy    │ │
│ │ ► Insights               │ │
│ │                          │ │
│ │ ●Operational             │ │
│ │                          │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ ░░░ Overlay (clickable) ░░░░ │ ← Click to close
└──────────────────────────────┘
```

## Page Hierarchy Diagram

```
┌────────────────────────────────────────────────────────┐
│                     ROOT LAYOUT                        │
│  (app/layout.tsx)                                      │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │  <Sidebar />  │  <main>{children}</main>      │   │
│  │               │                                │   │
│  │  [Fixed]      │  [Flexible]                   │   │
│  └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
                           ▲
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
   │  page.tsx   │   │  [route]    │   │  error.tsx  │
   │  (uses      │   │  /page.tsx  │   │             │
   │ PageLayout) │   │  (uses      │   │             │
   │             │   │ PageLayout) │   │             │
   └─────────────┘   └─────────────┘   └─────────────┘
        │                   │
        ▼                   ▼
   ┌─────────────┐   ┌─────────────┐
   │  PageLayout │   │  PageLayout │
   │  Component  │   │  Component  │
   │             │   │             │
   │ ┌─────────┐ │   │ ┌─────────┐ │
   │ │ Header  │ │   │ │ Header  │ │
   │ ├─────────┤ │   │ ├─────────┤ │
   │ │ Content │ │   │ │ Content │ │
   │ ├─────────┤ │   │ ├─────────┤ │
   │ │ Footer  │ │   │ │ Footer  │ │
   │ └─────────┘ │   │ └─────────┘ │
   └─────────────┘   └─────────────┘
```

## Navigation Item Hierarchy

```
SIDEBAR NAVIGATION
│
├─ MAIN
│  └─ Dashboard (/)
│
└─ ANALYSE & INSIGHTS
   ├─ PCMCI Analysis (/pcmci)
   │  └─ Causal Links Details
   │
   ├─ Anomaly Detection (/anomalies)
   │  └─ Severity Classification
   │
   ├─ Q-Learning Strategy (/rl-strategy)
   │  └─ Learned Policies
   │
   └─ Insights (/insights)
      └─ Recommendations & Next Steps
```

## Data Flow Diagram

```
┌─────────────────────┐
│   User Actions      │
│   (Navigation)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  Sidebar / PageLayout / Links           │
│  - Click navigation item                │
│  - Navigate to new page                 │
│  - Load page component                  │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  Page Component (e.g., /pcmci)          │
│  - useEffect fetches API data           │
│  - useState manages loading state       │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  Backend API Endpoints                  │
│  - /api/pcmci                           │
│  - /api/anomalies                       │
│  - /api/rl_strategy                     │
│  - etc.                                 │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  Python Backend Services                │
│  - PCMCI Analysis                       │
│  - Anomaly Detection                    │
│  - Q-Learning Optimization              │
└─────────────────────────────────────────┘
```

## Component Composition

```
PageLayout
│
├─ Sidebar
│  ├─ Header (Logo + Title)
│  ├─ Navigation Items
│  │  ├─ Link with icon
│  │  ├─ Link with icon
│  │  └─ ...
│  └─ Footer (Status)
│
├─ Main Content
│  ├─ Header Section
│  │  ├─ Title
│  │  ├─ Description
│  │  └─ Subtitle
│  │
│  ├─ Content Section
│  │  ├─ Tabs (optional)
│  │  ├─ Cards
│  │  ├─ Tables
│  │  └─ Charts
│  │
│  └─ Footer Section
│     └─ Attribution
│
└─ Breadcrumb Navigation (optional)
```

## Responsive Breakpoints

```
Mobile First (320px)
│
├─ Sidebar: Hidden (drawer)
├─ Layout: Full width
├─ Content: Single column
└─ Menu: Hamburger

Small (640px)
│
├─ Sidebar: Drawer (same as mobile)
├─ Layout: Full width
├─ Content: Single column
└─ Menu: Hamburger

Medium (768px+)
│
├─ Sidebar: Fixed (256px)
├─ Layout: Sidebar + Main
├─ Content: Multi-column grid
└─ Menu: Always visible

Large (1024px+)
│
├─ Sidebar: Fixed (256px or 64px collapsed)
├─ Layout: Sidebar + Main (comfortable spacing)
├─ Content: Multi-column grid
├─ Max-width: 7xl (80rem)
└─ Menu: Always visible with collapse button

XL (1280px+)
│
├─ Sidebar: Collapsible (64px/256px)
├─ Layout: Full responsive
├─ Content: 4+ column grids
├─ Max-width: 7xl maintained
└─ Desktop-optimized experience
```

## Page State Transitions

```
Page Mounted
│
├─ Loading: true
├─ Data: null
└─ Error: null
│
    ▼
│
Fetch API (/api/*)
│
├─ Success ──┐
│            │
└─ Error ──┐ │
           │ │
           ▼ ▼
       Data Received / Error
       │
       ├─ Loading: false
       ├─ Data: {...}
       └─ Error: null/message
           │
           ▼
       Render Page Content
       │
       ├─ Summary Cards
       ├─ Data Table
       ├─ Charts
       └─ Navigation Links
```

## Color Scheme Visualization

```
┌─────────────────────────────────┐
│  Header (slate-800/50)          │
├─────────────────────────────────┤
│                                 │
│  Content (slate-950 bg)         │
│                                 │
│  ┌──────────────────────────┐   │
│  │ Card (slate-700)         │   │
│  │ Title (blue-400)         │   │
│  │ Content (white)          │   │
│  │ Label (slate-400)        │   │
│  └──────────────────────────┘   │
│                                 │
│  ┌──────────────────────────┐   │
│  │ Card (slate-700)         │   │
│  │ Title (green-400)        │   │
│  │ Content (white)          │   │
│  └──────────────────────────┘   │
│                                 │
│  ┌──────────────────────────┐   │
│  │ Card (slate-700)         │   │
│  │ Title (orange-400)       │   │
│  │ Content (white)          │   │
│  └──────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│  Footer (slate-800/50)          │
└─────────────────────────────────┘

Color Legend:
  blue-400   = Links, navigation, PCMCI
  green-400  = Success, causal analysis
  orange-400 = Warnings, anomalies
  purple-400 = Advanced, RL/optimization
  pink-400   = Insights, recommendations
  slate-xxx  = Neutral backgrounds, text
```

## Navigation Flow Example: Dashboard → PCMCI → Anomalies

```
Step 1: User on Dashboard (/)
┌──────────────────────────────────┐
│ Sidebar         │ Dashboard      │
│ ► Dashboard     │ Overview       │
│   PCMCI         │ ┌───────────┐  │
│   Anomalies     │ │ PCMCI Tab │  │
│   RL Strategy   │ │ with link │  │
│   Insights      │ └───────────┘  │
└──────────────────────────────────┘
                   │
        Click "View PCMCI details" link
                   ▼
Step 2: Navigate to PCMCI (/pcmci)
┌──────────────────────────────────┐
│ Sidebar         │ PCMCI Analysis │
│   Dashboard     │ ┌────────────┐ │
│ ► PCMCI         │ │Total Links │ │
│   Anomalies     │ │55 detected │ │
│   RL Strategy   │ └────────────┘ │
│   Insights      │                │
│                 │ Back | Next ►  │
└──────────────────────────────────┘
                   │
        Click "Next: Anomalies" link
                   ▼
Step 3: Navigate to Anomalies (/anomalies)
┌──────────────────────────────────┐
│ Sidebar         │ Anomalies      │
│   Dashboard     │ ┌────────────┐ │
│   PCMCI         │ │Detected: 31│ │
│ ► Anomalies     │ │Rate: 0.35% │ │
│   RL Strategy   │ └────────────┘ │
│   Insights      │                │
│                 │ ◄ Back | Next ►│
└──────────────────────────────────┘
```

This visual structure shows how users navigate through the application with multiple entry points and clear visual hierarchy.
