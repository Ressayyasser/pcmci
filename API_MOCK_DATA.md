# API Mock Data & Integration Guide

## Problem Solved

Previously, the dashboard components were stuck on "Loading..." states because the API routes were attempting to fetch data from a backend server that wasn't running. This document explains the solution and how to integrate with real backend data when needed.

## Current Solution: Mock Data Fallback

All API routes (`/api/pcmci`, `/api/anomalies`, `/api/rl_strategy`, `/api/summary`, `/api/insights`) now include:

1. **Real Backend Integration** - First attempts to connect to a backend server
2. **Mock Data Fallback** - If backend unavailable, returns realistic mock data
3. **Graceful Error Handling** - Logs issues and serves mock data

### Implementation Pattern

```typescript
export async function GET(request: NextRequest) {
  try {
    // Try real backend first
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    try {
      const response = await fetch(`${backendUrl}/api/endpoint`, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (e) {
      console.log('[v0] Backend unavailable, using mock data')
    }

    // Return mock data as fallback
    return NextResponse.json(mockData)
  } catch (error) {
    console.error('[v0] API error:', error)
    return NextResponse.json(mockData)
  }
}
```

## API Routes & Mock Data

### 1. `/api/pcmci` - PCMCI Causal Analysis
**Mock Data Includes:**
- 55 total causal links identified
- 12 significant links (high strength > 0.7)
- Top 10 relationships with source, target, strength, and lag
- Method description and technical details

**Real Backend Endpoint:** `http://localhost:8000/api/pcmci`

### 2. `/api/anomalies` - Anomaly Detection Results
**Mock Data Includes:**
- 31 total anomalies (ensemble result)
- 176 from Isolation Forest, 465 from CUSUM
- Recent anomalies with timestamp, variable, severity
- Anomaly distribution by variable
- Top 5 most critical anomalies

**Real Backend Endpoint:** `http://localhost:8000/api/anomalies`

### 3. `/api/rl_strategy` - Q-Learning Optimization
**Mock Data Includes:**
- 50 episodes trained with convergence metrics
- Learning parameters (lr=0.1, discount=0.95)
- State/action space definitions
- Performance metrics (mean_reward: -1.34)
- Backtest results with cost savings and efficiency gains
- Training history across episodes

**Real Backend Endpoint:** `http://localhost:8000/api/rl_strategy`

### 4. `/api/summary` - System Overview
**Mock Data Includes:**
- System status and health indicators
- Data statistics (8760 records, 14 variables)
- Analysis summary (55 causal links, Q-Learning model)
- Key metrics (efficiency: 0.762, cost: 0.145)
- Health indicators for each subsystem
- Active alerts and warnings

**Real Backend Endpoint:** `http://localhost:8000/api/summary`

### 5. `/api/insights` - Recommendations & Insights
**Mock Data Includes:**
- Key findings (3 major discoveries)
- Actionable recommendations by category
- Predictive insights with confidence scores
- 30/90-day system health forecast
- Maintenance alerts

**Real Backend Endpoint:** `http://localhost:8000/api/insights`

## Integration with Real Backend

### Step 1: Start the FastAPI Backend

```bash
cd backend
python api.py
```

The API will start on `http://localhost:8000`

### Step 2: Set Environment Variable (Optional)

If your backend runs on a different URL, set:

```bash
export BACKEND_URL=http://your-backend-url:8000
```

Or in `.env.local`:

```
BACKEND_URL=http://your-backend-url:8000
```

### Step 3: Restart Next.js Dev Server

```bash
pnpm dev
```

The API routes will now attempt to connect to your backend first, falling back to mock data if unavailable.

## Testing the Integration

### Check Backend Availability

```bash
curl http://localhost:8000/api/pcmci
```

### Verify Mock Data Works

```bash
curl http://localhost:3000/api/pcmci
```

Should return mock PCMCI data if backend is down, or real data if backend is running.

## Data Consistency

- Mock data represents realistic energy system metrics
- Values are scientifically plausible for OCP (Cogeneration Systems)
- Relationships maintain logical consistency (e.g., higher load → higher efficiency potential)
- All mock data designed to showcase full dashboard functionality

## Production Deployment

### On Vercel (Frontend)

1. Build and deploy Next.js as usual
2. Mock data will serve as fallback
3. No additional configuration needed

### With Backend (FastAPI)

1. Deploy backend to your infrastructure (Railway, Render, AWS, etc.)
2. Set `BACKEND_URL` environment variable in Vercel
3. Routes will attempt real backend first, fallback to mock

## Switching Between Mock and Real Data

The system automatically detects availability:

- ✅ Backend running → Uses real data
- ❌ Backend down → Uses mock data automatically
- ❌ Network error → Logs warning, serves mock data

No code changes needed - the fallback happens seamlessly.

## Adding Real Data

To replace mock data with your own:

1. **Update the Python backend** (`backend/api.py`) to load your CSV data
2. **Run the backend** with real data
3. **Frontend automatically connects** without any changes

Example Python backend modification:

```python
import pandas as pd

# Load your OCP data
df = pd.read_csv('ocp_data.csv')

@app.get("/api/pcmci")
async def get_pcmci():
    # Run your analysis
    results = run_pcmci_analysis(df)
    return results.to_dict()
```

## Troubleshooting

### Dashboard still shows "Loading..."

1. Check browser console (F12) for errors
2. Verify `BACKEND_URL` is correctly set
3. Ensure mock data is properly formatted
4. Clear browser cache and reload

### Mock data looks incorrect

- All mock data is realistic but not from your system
- Use with real backend for actual analysis results
- Mock data designed for demo/testing purposes

### Backend returns error

Check backend logs:

```bash
# Terminal with FastAPI running
# Look for error messages and stack traces
```

## Summary

The dashboard now works in three modes:

1. **Demo Mode (Default)** - Mock data, no backend needed
2. **Development Mode** - Real backend on localhost:8000
3. **Production Mode** - Real backend on custom URL

Choose what works best for your use case!
