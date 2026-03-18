# API Data Structure Fixes

## Problem
The frontend pages were crashing with errors like:
- `Cannot read properties of undefined (reading 'total_records')`
- `Cannot read properties of undefined (reading 'map')`

This occurred because the mock API responses didn't match the interface structures expected by the pages.

## Solution
Updated all 5 API routes to return data structures that match the TypeScript interfaces defined in each page component.

## Changes Made

### 1. `/api/summary` (app/api/summary/route.ts)
**Interface Expected (Summary):**
```typescript
{
  data: { total_records, num_variables, time_range, date_range }
  pcmci: { num_links, significant_links }
  anomalies: { total_detected, detection_rate }
  rl_agent: { final_reward, backtest_reward, training_episodes }
}
```

**Fixed:** Restructured mock data to match this exact structure with correct field names.

### 2. `/api/insights` (app/api/insights/route.ts)
**Interface Expected (Insight):**
```typescript
{
  key_findings: string[]
  recommendations: string[]
  next_steps: string[]
}
```

**Fixed:** Converted nested objects to flat string arrays for all three fields.

### 3. `/api/anomalies` (app/api/anomalies/route.ts)
**Interface Expected (AnomalyData):**
```typescript
{
  total_anomalies: number
  anomaly_rate: number
  anomaly_indices: number[]
  isolation_forest_count: number
  cusum_count: number
  detection_methods: string[]
  description: string
}
```

**Fixed:** 
- Renamed `methods` → `detection_methods`
- Added `anomaly_indices` array (31 indices)
- Removed unsupported nested objects

### 4. `/api/pcmci` (app/api/pcmci/route.ts)
**Status:** Already correct with CausalLink interface matching perfectly.

### 5. `/api/rl_strategy` (app/api/rl_strategy/route.ts)
**Interface Expected (RLData):**
```typescript
{
  strategy_name: string
  training_episodes: number
  final_reward: number
  backtest_reward: number
  backtest_samples: number
  state_space_size: number
  action_space_size: number
  learning_rate: number
  discount_factor: number
  description: string
  convergence: string
}
```

**Fixed:** Removed complex nested structures and kept only the flat fields required by the interface.

## Testing
All pages should now load without errors:
- `http://localhost:3000` - Dashboard
- `http://localhost:3000/pcmci` - PCMCI Analysis
- `http://localhost:3000/anomalies` - Anomaly Detection
- `http://localhost:3000/rl-strategy` - Q-Learning Strategy
- `http://localhost:3000/insights` - System Insights

## Key Takeaway
Mock data structures now exactly match the TypeScript interfaces, eliminating hydration mismatches and undefined property errors.
