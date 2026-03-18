# Structure Visuelle - OCP Energy Dashboard

## Layout Global

```
┌─────────────────────────────────────────────────────────────┐
│                     Navigateur Web                           │
├──────────────┬──────────────────────────────────────────────┤
│              │                                               │
│   SIDEBAR    │              MAIN CONTENT                    │
│              │                                               │
│ [OCP Logo]   ├──────────────────────────────────────────────┤
│              │  [PAGE HEADER]                               │
│ HOME         │  Title & Breadcrumbs                         │
│              ├──────────────────────────────────────────────┤
│ ─────────    │                                              │
│ ANALYSE      │  [MAIN CONTENT]                             │
│              │  Cards, Tables, Tabs, etc.                  │
│ • PCMCI      │                                              │
│ • Anomalies  │                                              │
│ • RL         │                                              │
│ • Insights   │                                              │
│              │  [SCROLLABLE AREA]                          │
│ [Version]    │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

## States du Sidebar (Desktop)

### État Ouvert (Défaut)
```
┌──────────────┐
│ [OCP Logo]   │ (Nom + Sous-titre)
│ ═════════════│
│              │
│ 🏠 Dashboard │
│              │
│ ─────────────│ (Divider)
│ Analyse      │ (Section Header)
│              │
│ 🌐 PCMCI     │ (Active = blue)
│   Détection  │ (Description)
│              │
│ ⚠️  Anomalies│ 
│   Détection  │
│              │
│ ⚡ RL        │
│   Optim.     │
│              │
│ 💡 Insights  │
│   Reco.      │
│              │
│ ═════════════│
│ Version MVP  │
│ Système...   │
└──────────────┘
  w: 64px (compact) ou 256px (full)
```

### État Réduit (Compact)
```
┌────┐
│ OCP│
├────┤
│    │
│ 🏠 │
│    │
│ ─  │
│    │
│ 🌐 │ (Icon seulement, tooltip optionnel)
│    │
│ ⚠️ │
│    │
│ ⚡ │
│    │
│ 💡 │
│    │
│ ─  │
│ V  │ (Version info)
└────┘
  w: 80px
```

## States du Sidebar (Mobile)

### Fermé
```
┌─────────┐
│ ☰ | ... │ (Menu toggle + options)
└─────────┘
```

### Ouvert (Coulissant)
```
┌──────────────┐────────────────────┐
│ ☒ [OCP Logo] │ [OVERLAY SEMI-     │
│ ═════════════│  TRANSPARENT       │
│ 🏠 Dashboard │  Ferme le menu     │
│              │  au clic]          │
│ ─────────────│                    │
│ • PCMCI      │                    │
│ • Anomalies  │                    │
│ • RL         │                    │
│ • Insights   │                    │
│              │                    │
│ Version MVP  │                    │
└──────────────┴────────────────────┘
```

## Page Header avec Breadcrumbs

```
┌───────────────────────────────────────┐
│ 🏠 Accueil > Analyse PCMCI            │ (Breadcrumb navigation)
│                                       │
│ PCMCI Causal Analysis                 │ (Page Title)
│ Momentary Conditional Independence... │ (Description)
└───────────────────────────────────────┘
```

## Hiérarchie des Composants

```
RootLayout
├── Sidebar
│   ├── Header (Logo + Titre)
│   ├── Nav Items
│   │   ├── Dashboard Link
│   │   └── Analysis Group
│   │       ├── PCMCI Link
│   │       ├── Anomalies Link
│   │       ├── RL Link
│   │       └── Insights Link
│   └── Footer (Version)
│
└── Main Content
    ├── PageHeader
    │   ├── Breadcrumb
    │   │   ├── Home Link
    │   │   └── Segment Links
    │   └── Title + Description
    │
    └── Page-specific Content
        └── (Dashboard / PCMCI / Anomalies / RL / Insights)
```

## Navigation Flow

```
User Action          Component         State Change    Result
─────────────────────────────────────────────────────────────────
Click "PCMCI"   →    Sidebar Link  →   pathname="pcmci" → 
                     (href="/pcmci")

Router Update   →    Next.js Router →  Route change →
                                       Load /pcmci/page.tsx

Page Render     →    PageHeader    →   Breadcrumb  →
                                       Updates to:
                                       "Accueil > PCMCI"

Sidebar Update  →    Sidebar       →   pathname      →
                     (usePathname)      .startsWith   
                                        ("/pcmci")
                                        = true
                                        Highlight PCMCI

Data Load       →    API Call      →   fetch("/api/ →
                                        pcmci")
                                        setState()

Render          →    Page Content  →   Show PCMCI   →
                                        data + charts
```

## Couleurs et Styles

### Palette Couleurs
```
Primary (Active):      Blue (#3B82F6)  - Links actifs
Background:            Slate-900 (#0F172A)  - Main bg
Background Sidebar:    Slate-950 (#030712)  - Sidebar
Text Primary:          White (#FFFFFF)
Text Secondary:        Slate-400 (#78716C)
Borders:               Slate-800 (#1E293B)
Hover:                 Slate-800 (#1E293B)
```

### Exemple de Card
```
┌────────────────────────┐
│ Dataset (Header Blue)  │  bg-slate-700
│ ════════════════════   │  border-slate-600
│                        │
│ Total Records:         │  Hover: bg-slate-600
│ 8,760                  │
│                        │
│ Variables:             │
│ 14                     │
└────────────────────────┘
```

## Responsive Breakpoints

```
Mobile (<640px)
├── Sidebar: Hidden (Menu toggle visible)
├── Layout: Full width
└── Content: Max width 100%

Tablet (640px - 768px)  
├── Sidebar: Hidden (Menu toggle visible)
├── Layout: Full width
└── Content: Max width 100%

Desktop (768px+)
├── Sidebar: Visible (Collapsible)
├── Layout: Flexbox 2 columns
├── Sidebar width: 64px (compact) / 256px (full)
└── Content: flex-1

Large Desktop (1024px+)
├── All desktop features
└── Max content width: 80rem (7xl container)
```

## Icon System

```
Section Icons (20x20px)
─────────────────────────
🏠 Home           → Dashboard
🌐 Network        → PCMCI Analysis
⚠️  AlertTriangle → Anomalies
⚡ Zap            → Q-Learning
💡 Lightbulb      → Insights

UI Icons
─────────────────────────
☰  Menu            → Mobile sidebar toggle
☒  X               → Close mobile menu
▶  ChevronRight    → Breadcrumb separator
⏱  Home (icon)     → Breadcrumb home

Navigation Icons
─────────────────────────
◀  ChevronLeft     → Collapse sidebar
▶  ChevronRight    → Expand sidebar (rotated)
```

## Page States

### Loading State
```
┌─────────────────────────────────┐
│ [PAGE HEADER]                   │
├─────────────────────────────────┤
│                                 │
│                                 │
│         ⟳ Loading               │ (Spinner)
│                                 │
│      Loading dashboard data...  │
│                                 │
│                                 │
└─────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────┐
│ [PAGE HEADER]                   │
├─────────────────────────────────┤
│                                 │
│ ┌────────────────────────────┐  │
│ │ ❌ Error: Failed to...     │  │
│ │                            │  │
│ │ [Retry Button]             │  │
│ └────────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

### Success State (Data Loaded)
```
┌─────────────────────────────────┐
│ [PAGE HEADER]                   │
├─────────────────────────────────┤
│                                 │
│ ┌─────┬─────┬─────┬────────┐   │
│ │Card │Card │Card │Card    │   │ (Metric Cards)
│ └─────┴─────┴─────┴────────┘   │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Chart / Table / Tabs        │ │
│ │                             │ │
│ │ [Main Content Area]         │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

## Animations et Transitions

```
Sidebar Collapse
─────────────────────────────────
Width: 256px ──[300ms]──> 64px
Opacity: 100% ──[300ms]──> 100% (Persistent)
Text: visible ──[300ms]──> hidden

Mobile Menu Open
─────────────────────────────────
Sidebar: -100% ──[200ms]──> 0
Overlay: 0 ────────[200ms]──> 50%

Link Hover
─────────────────────────────────
Background: transparent ──[200ms]──> slate-800
Color: slate-300 ────────[200ms]──> white

Page Transition
─────────────────────────────────
Content: opacity 100% ──[instant]──> 0 (if needed)
         opacity 0 ────[instant]──> 100%
         (Next.js handles)
```

## Responsive Layout Example

### Mobile View (375px)
```
┌─────────────────┐
│ ☰  |            │ (Compact header)
├─────────────────┤
│                 │
│  [PAGE HEADER]  │
│                 │
│ ┌──────────────┐│
│ │   Card 1      ││ (Full width cards)
│ └──────────────┘│
│                 │
│ ┌──────────────┐│
│ │   Card 2      ││
│ └──────────────┘│
│                 │
│ ┌──────────────┐│ (Scrollable)
│ │   Card 3      ││
│ └──────────────┘│
│                 │
└─────────────────┘
```

### Tablet View (768px)
```
┌──────────────┬──────────────────────┐
│   SIDEBAR    │    PAGE HEADER       │
│   (64px)     ├──────────────────────┤
│              │                      │
│ 🏠 Dashboard │  ┌────────┬─────────┐│
│              │  │ Card 1 │ Card 2  ││
│ • PCMCI      │  ├────────┼─────────┤│
│ • Anomalies  │  │ Card 3 │ Card 4  ││
│ • RL         │  └────────┴─────────┘│
│ • Insights   │                      │
│              │  [Content Area]      │
│              │  (Scrollable)        │
│              │                      │
└──────────────┴──────────────────────┘
```

### Desktop View (1024px+)
```
┌───────────────┬──────────────────────────────────┐
│   SIDEBAR     │         MAIN CONTENT             │
│   (256px)     ├──────────────────────────────────┤
│               │                                  │
│ [OCP Logo]    │  PAGE HEADER + BREADCRUMBS      │
│               ├──────────────────────────────────┤
│ 🏠 Dashboard  │                                  │
│               │  ┌──────┬──────┬──────┬──────┐   │
│ ─────────     │  │Card 1│Card 2│Card 3│Card 4│   │
│ ANALYSE       │  └──────┴──────┴──────┴──────┘   │
│               │                                  │
│ 🌐 PCMCI      │  ┌────────────────────────────┐  │
│   Détection   │  │    Main Content Area       │  │
│               │  │                            │  │
│ ⚠️  Anomalies │  │  - Charts                  │  │
│   Détection   │  │  - Tables                  │  │
│               │  │  - Tabs                    │  │
│ ⚡ RL         │  │  - Forms                   │  │
│   Optim.      │  │  [Scrollable]              │  │
│               │  └────────────────────────────┘  │
│ 💡 Insights   │                                  │
│   Reco.       │                                  │
│               │                                  │
│ ─────────     │                                  │
│ Version MVP   │                                  │
└───────────────┴──────────────────────────────────┘
```

## Composant Tree avec Données

```
<RootLayout>
  <Sidebar>
    pathname: "/pcmci" ──> isActive checks
    isOpen: true
    isCollapsed: false
    └─ Rend les 5 items
       └─ Highlight "PCMCI" item
  
  <Main>
    <PCMCIPage>
      usePathname() ──> "/pcmci"
      
      <PageHeader title="..." description="...">
        <Breadcrumb pathname="/pcmci">
          ├─ Home link
          ├─ Separator
          └─ "Analyse PCMCI" text
      </PageHeader>
      
      <Content>
        useEffect(() => {
          fetch("/api/pcmci")
          ├─ loading: true ──> <Spinner/>
          ├─ data ──────────> <Dashboard/>
          └─ error ────────> <ErrorCard/>
        })
      </Content>
    </PCMCIPage>
  </Main>
</RootLayout>
```

## Performance Timeline

```
Page Load:
────────────────────────────────────────
1. Layout.tsx renders ...................... 50ms
2. Sidebar renders (no data fetch) ........ 20ms
3. Page renders (start) ................... 30ms
4. PageHeader renders ..................... 10ms
5. Breadcrumb generates ................... 5ms
6. Fetch /api/pcmci starts ................ async
7. Loading state renders .................. 15ms
8. API responds (backend dependent) ....... 500-2000ms
9. Data renders ........................... 30ms
10. Complete .......................... Total: 2000ms+

FCP (First Contentful Paint): ~70ms
LCP (Largest Contentful Paint): ~2000ms+
CLS (Cumulative Layout Shift): <0.1
TTI (Time to Interactive): ~2000ms+
```

---

Cette structure garantit une UX fluide, professionnelle et facilement maintenable!
