# Interactive GTA Diagram Documentation

## Overview

The GTA (Groupe Turbo-Alternateur) interactive visualization system provides real-time monitoring and interactive schematic diagrams of the three turbine-generator sets at the OCP Jorf Lasfar thermal power plant.

## Components

### 1. **GTA Diagram Component** (`/components/gta-diagram.tsx`)

A reusable React component that displays an interactive SVG diagram of a single GTA with:

- **Main Turbine Display**: Central ellipse showing turbine state with temperature and pressure readings
- **HP Steam Inlet**: Colored circle showing high-pressure steam inlet temperature
- **Condenser**: Bottom section displaying main condenser parameters and temperature
- **Alternator Box**: Right-side container showing the alternator (generator) with excitation system
- **Steam Flow Arrow**: Curved path showing steam flow from inlet through turbine to exhaust
- **Vibration Indicator**: Real-time vibration monitoring display

### 2. **GTA Visualization Page** (`/app/gta-visualization/page.tsx`)

Full-featured page with:
- Tabbed interface for switching between GTA1, GTA2, and GTA3
- Interactive SVG diagrams with click-to-select components
- Real-time metrics grid for each GTA
- System overview showing combined performance of all three GTAs
- Component details panel with status indicators

## Visual Design

### Color Coding

- **Cyan (#00d9ff)**: Normal operating conditions (within safe limits)
- **Yellow (#ffaa00)**: Warning state (approaching limits)
- **Red (#ff4444)**: Critical state (exceeded safe limits)
- **Purple (#7c5cff)**: Out-of-range values (above or below acceptable parameters)

### Interactive Features

1. **Click on Components**: Tap any colored circle or component to view detailed information
2. **Status Indicators**: Real-time color feedback based on parameter values
3. **Hover Effects**: Component highlighting when mouse hovers
4. **Tabbed Navigation**: Switch between GTAs instantly

## Data Structure

```typescript
interface GTAState {
  turbineTemp: number           // Turbine inlet temperature (°C)
  turbinePressure: number       // Turbine pressure (bar)
  steamFlow: number             // Vapor flow rate (t/h)
  condenserTemp: number         // Condenser temperature (°C)
  excitationVoltage: number     // Excitation system voltage (MW)
  reactiveVoltage: number       // Reactive voltage (Mvar)
  cosinusValue: number          // Power factor (cos φ)
  alternatorPower: number       // Alternator output (MW)
  vibrationType3: number        // Mechanical vibration (μm)
  usureB3: number              // Bearing wear indicator (-)
}
```

## Normal Operating Ranges

| Parameter | Min | Max | Unit | Component |
|-----------|-----|-----|------|-----------|
| Turbine Temp | 50 | 60 | °C | 20TE171C |
| Steam Flow | 15 | 17 | t/h | 20FT402C |
| Turbine Pressure | 50 | 60 | bar | 20PS107C |
| Condenser Temp | 15 | 25 | °C | Condenseur |
| Alternator Power | 0.08 | 0.12 | MW | Alternateur3 |
| Vibration | 0.2 | 0.5 | μm | VIB1-TV3 |

## Integration Points

### API Endpoints

- **`GET /api/pcmci-full`**: Fetches real-time GTA state data
- **`GET /api/dag`**: Causal relationships for GTA parameters
- **`GET /api/anomalies`**: Real-time anomaly detection on GTA signals

### Pages Integration

1. **Homepage Dashboard** (`/app/page.tsx`):
   - GTA3 diagram widget embedded in overview tab
   - Links to full visualization page

2. **GTA Visualization Page** (`/app/gta-visualization/page.tsx`):
   - Full-screen interactive diagrams
   - All three GTAs with tabbed navigation
   - System-level performance metrics

3. **Realtime Control** (`/app/realtime-control/page.tsx`):
   - GTA parameters as controllable sliders
   - Real-time response visualization

## Performance Optimization

- **SVG Rendering**: Pure SVG with CSS transitions for smooth animations
- **Component Memoization**: React memoization prevents unnecessary re-renders
- **Lazy Loading**: GTA data fetched on demand
- **Color Calculation**: Efficient status calculation using range comparisons

## Accessibility

- **Semantic Labels**: All components have descriptive labels
- **Color Independence**: Status information also conveyed via numeric values
- **Interactive Feedback**: Visual and textual feedback on user actions
- **Responsive Design**: Mobile-friendly with adaptive layouts

## Extension Points

### Adding New Parameters

1. Add parameter to `GTAState` interface
2. Add component circle/element in SVG
3. Add status calculation in `getStatusColor()`
4. Add to `ComponentData` array

### Customizing Ranges

Edit the `ComponentData` array in `gta-diagram.tsx`:

```typescript
{
  id: 'COMPONENT_ID',
  label: 'Display Label',
  value: currentState.parameter,
  unit: 'Unit',
  normal: [min, max],
  warning: [min, max],
  critical: [min, max],
  type: 'temp' | 'pressure' | 'flow' | 'voltage' | 'power',
}
```

## Known Limitations

1. SVG layout is fixed (not force-directed)
2. One parameter per visual element (no compound indicators)
3. Color states are discrete (no gradual transitions)

## Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] Historical trend graphs per component
- [ ] Predictive warnings based on RL agent
- [ ] Multi-parameter compound indicators
- [ ] AR visualization for maintenance teams
- [ ] Export schematic with current state as PDF

## Testing

```bash
# Navigate to pages
http://localhost:3000/gta-visualization

# Test interactive features
- Click on different GTA tabs
- Click on component circles
- Verify color changes on parameter updates
- Check responsive behavior on mobile
```

## Related Documentation

- [CDC v4 Implementation](./CDC_V4_IMPROVEMENTS.md)
- [Signal Controller](./BACKEND_MODULES.md#signal-controller)
- [Real-time Control Dashboard](./QUICK_START.md#real-time-control)
