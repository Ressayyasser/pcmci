# GTA Realtime Interactive Visualization System

## Overview

The new GTA Realtime Component (`gta-realtime.tsx`) provides a fully interactive, animated visualization of the three Turbo-Generator Units (GTAs 1, 2, 3) with real-time synthetic data simulation.

## Features

### 1. Multi-GTA Selection
- Toggle between GTA 1, 2, and 3 via interactive buttons
- Individual real-time data streams for each unit
- Persistent parameter tracking across units

### 2. Interactive Schematic Diagram
The SVG schematic includes clickable components:
- **SOURCE HP** (Orange) - High-pressure steam inlet with flow rate visualization
- **TURBINE À VAPEUR** (Blue) - Three-stage turbine with power/speed indicators
- **ALTERNATEUR** (Green) - Power generator with voltage display
- **CONDENSEUR** (Cyan) - Condenser with temperature and flow data
- **RÉSEAU NT** (Teal) - Network connection with tension, current, frequency

### 3. Real-Time Data Simulation
Each parameter updates every 1.5 seconds with:
- **Random variance** - Simulates sensor noise (±0.5-2% typical)
- **Smooth trending** - Uses sine wave to create realistic oscillations
- **Physical constraints** - Values stay within operational limits
- **Synchronized timing** - All GTAs update simultaneously

### 4. Parameter Monitoring
**Key Metrics Displayed:**
- Turbine Power: 142-147 MW
- Alternator Output: 163-167 MW
- Efficiency: 86-88%
- Vibration Levels: 2.0-2.5 mm/s
- Steam Flow: 58-60 t/h
- Condenser Temperature: 40-44°C
- Network Frequency: 49.98-50.02 Hz

### 5. Interactive Parameter Boxes
Each parameter has:
- Current value display
- Unit label
- Trend indicator (up/down arrows)
- Progress bar showing position in normal range
- Color coding:
  - **Green** = Normal range
  - **Cyan/Blue** = Below midpoint
  - **Yellow** = Above midpoint
  - **Red** = Warning/Critical

### 6. Status Indicators
- **Live Status Badge** - Shows "En ligne" with animated pulse
- **Last Update Timer** - Displays seconds since last data refresh
- **Component Selection** - Click to highlight and inspect components

## Technical Implementation

### Data Generation
```typescript
generateRealtimeValue(base: number, variance: number, trend: number) {
  const randomChange = (Math.random() - 0.5) * variance
  const trendChange = Math.sin(Date.now() / 5000) * trend
  return Math.max(0, base + randomChange + trendChange)
}
```

### State Management
- `selectedGTA` - Currently selected unit (1, 2, or 3)
- `gtaDataList` - Array of all three GTA data streams
- `selectedComponent` - Currently highlighted schematic element

### Update Interval
- Data updates every 1.5 seconds via `setInterval`
- Non-blocking updates using functional setState
- Cleanup with `return () => clearInterval(interval)`

## Visual Design

### Color Scheme
- **Orange (#fb923c)** - HP steam source
- **Blue (#3b82f6)** - Turbine machinery
- **Green (#10b981)** - Alternator/Generator
- **Cyan (#06b6d4)** - Condensing equipment
- **Teal (#14b8a6)** - Network/Grid
- **Slate (#334155)** - Background and lines

### Typography
- Headers: 16-20px, bold, 1.0 letter-spacing
- Parameters: 10-12px, regular weight
- Values: 12-14px, bold, colored by status

### Layout
- **SVG Canvas** - 1200×400px viewBox with responsive scaling
- **Grid Layout** - 2-4 columns for parameter display
- **Responsive** - Adapts to mobile/tablet/desktop via grid-cols

## Usage

### On Dashboard Homepage
The component appears with live data streaming to all three GTAs:
```tsx
<GTARealtimeComponent />
```

### On Dedicated Page
Full-screen visualization with deeper inspection capabilities:
```tsx
<GTARealtimeComponent />
```

### Customization
To modify baseline values, edit the initial data in `initializeData()`:
```typescript
sourceHP_debit: 58.5,  // Change baseline flow rate
turbine_power: 142.5,  // Change baseline power
alternator_output: 163.2,  // Change baseline output
```

To adjust update frequency, modify interval:
```typescript
const interval = setInterval(() => {
  // Updates every 1500ms (1.5 seconds)
}, 1500)
```

## Performance Considerations

### Optimization
- Single `setInterval` for all GTAs (not one per unit)
- Functional updates to avoid state mutation
- SVG rendered directly (no external chart libraries)
- No re-renders of unselected GTAs

### Memory
- Data stored in flat array (minimal overhead)
- History not persisted (real-time only)
- Cleanup on unmount via interval clearance

## Future Enhancements

1. **Historical Charts** - Store last 24 hours of data with trending
2. **Alert Rules** - Trigger notifications on threshold violations
3. **Fault Injection** - Simulate failure scenarios for testing RL agent
4. **Data Export** - Download real-time logs as CSV/JSON
5. **Predictive Display** - Show forecasted values from RL agent

## File Structure

```
components/
├── gta-realtime.tsx          # Main interactive component
app/
├── gta-visualization/
│   └── page.tsx              # Dedicated visualization page
└── page.tsx                  # Homepage with embedded component
```

## Integration with Other Systems

The GTARealtimeComponent works seamlessly with:
- **RL Agent** - Receives current state for decision-making
- **Anomaly Detector** - Monitors parameters for deviations
- **PCMCI Causal Analysis** - Links GTA states to system effects
- **Dashboard** - Shows real-time operational status
