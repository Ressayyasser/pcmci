# Architecture Guide - OCP Energy Anomaly Detection System

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                      │
├─────────────────────────────────────────────────────────────┤
│  Next.js 16 Frontend (React 19 + TypeScript + Tailwind)     │
│  - Home Dashboard                                             │
│  - PCMCI Analysis Page                                        │
│  - Anomaly Detection Page                                     │
│  - Q-Learning Strategy Page                                   │
│  - Insights & Recommendations Page                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/REST
                     │
┌────────────────────▼────────────────────────────────────────┐
│                     API LAYER                                │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │ API Proxy Routes (Next.js)                           │   │
│  │ - /api/summary                                        │   │
│  │ - /api/pcmci                                          │   │
│  │ - /api/anomalies                                      │   │
│  │ - /api/rl_strategy                                    │   │
│  │ - /api/insights                                       │   │
│  └───────────┬────────────────────────────────────────┘   │
│              │                                               │
│  ┌───────────▼────────────────────────────────────────┐   │
│  │ FastAPI Backend (Python)                           │   │
│  │ - Health checks                                      │   │
│  │ - Data retrieval endpoints                          │   │
│  │ - Analysis results formatting                       │   │
│  │ - CORS middleware                                    │   │
│  └───────────┬────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ File I/O
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  ML/ANALYSIS LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │ PCMCI Causal Analysis                               │   │
│  │ - Momentary Conditional Independence Test            │   │
│  │ - Output: Causal DAG with link strengths            │   │
│  │ - File: pcmci_analysis.py                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Anomaly Detection                                    │   │
│  │ - Isolation Forest (tree-based)                      │   │
│  │ - CUSUM Algorithm (time-series)                      │   │
│  │ - Ensemble voting                                    │   │
│  │ - File: anomaly_detection.py                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Q-Learning Reinforcement Learning                   │   │
│  │ - Tabular Q-Learning (off-policy)                    │   │
│  │ - State space discretization                         │   │
│  │ - Action space definition                            │   │
│  │ - Backtest validation                                │   │
│  │ - File: rl_agent.py                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Read/Write
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  DATA LAYER                                  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Data Storage (backend/data/)                         │   │
│  │ - ocp_synthetic_data.csv (8760 × 14)               │   │
│  │ - pcmci_results.json (55 causal links)             │   │
│  │ - anomaly_results.json (8760 anomalies)            │   │
│  │ - q_table.pkl (trained Q-Learning)                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Data Processing                                      │   │
│  │ - Preprocessing (normalization, scaling)            │   │
│  │ - Feature engineering                                │   │
│  │ - File: preprocessing.py                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Synthetic Data Generation                            │   │
│  │ - Time series synthesis                              │   │
│  │ - Anomaly injection                                  │   │
│  │ - File: data_generator.py                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Data Generation Pipeline

```
data_generator.py
       ↓
Generate synthetic time series (8760 hours)
       ↓
Create 14 energy variables
       ↓
Inject anomalies (2% of data)
       ↓
Output: ocp_synthetic_data.csv
```

**Key Parameters**:
- n_timesteps: 8760 (1 year hourly)
- n_generators: 5
- n_heaters: 2
- n_compressors: 2
- anomaly_frequency: 0.02

### 2. PCMCI Analysis Pipeline

```
ocp_synthetic_data.csv
       ↓
preprocessing.py (normalization)
       ↓
pcmci_analysis.py
       ├─ Stationarity test
       ├─ Lag selection (ACF/PACF)
       ├─ Conditional independence test
       └─ Significance thresholding
       ↓
Output: pcmci_results.json
```

**Output Structure**:
```json
{
  "links": [
    {
      "source": "var1",
      "target": "var2",
      "strength": 0.85,
      "lag": 1
    }
  ]
}
```

### 3. Anomaly Detection Pipeline

```
ocp_synthetic_data.csv
       ↓
preprocessing.py
       ├─ Isolation Forest (contamination=0.05)
       └─ CUSUM (threshold=3σ)
       ↓
Ensemble voting (union of methods)
       ↓
Output: anomaly_results.json
```

**Output Structure**:
```json
{
  "isolation_forest": [123, 456, ...],
  "cusum": [789, 1011, ...],
  "ensemble_anomalies": [123, 456, 789, ...]
}
```

### 4. Q-Learning Training Pipeline

```
ocp_synthetic_data.csv
       ↓
State space discretization (10 states)
       ├─ Based on load levels
       └─ Energy quantiles
       ↓
rl_agent.py (50 episodes)
       ├─ Action selection (5 actions)
       ├─ Reward calculation
       ├─ Q-table update
       └─ Convergence monitoring
       ↓
Backtest validation (1000 samples)
       ↓
Output: q_table.pkl, training metrics
```

**Q-Learning Update**:
```
Q(s,a) = Q(s,a) + α[r + γ·max(Q(s',a')) - Q(s,a)]
```

**Parameters**:
- Learning rate (α): 0.1
- Discount factor (γ): 0.99
- Epsilon (ε): 0.1 (exploration)

## Component Details

### Backend Components

#### 1. data_generator.py (135 lines)
**Purpose**: Generate synthetic OCP energy data

**Key Classes/Functions**:
- `generate_synthetic_data()` - Main generation function
- Time series construction with realistic patterns
- Anomaly injection with timestamps

**Dependencies**: numpy, pandas

#### 2. preprocessing.py (153 lines)
**Purpose**: Data preprocessing and feature engineering

**Key Functions**:
- `load_data()` - Load from CSV
- `normalize_data()` - Z-score normalization
- `scale_data()` - Min-max scaling
- `handle_missing_values()` - Interpolation

**Dependencies**: pandas, numpy, sklearn

#### 3. pcmci_analysis.py (269 lines)
**Purpose**: Causal relationship discovery

**Key Classes/Functions**:
- `PCMCIAnalyzer` class
- `run_pcmci_analysis()` - Main analysis
- `get_causal_links()` - Extract links
- `test_conditional_independence()` - Statistical testing

**Dependencies**: pandas, numpy, scipy

#### 4. anomaly_detection.py (308 lines)
**Purpose**: Multi-method anomaly detection

**Key Classes/Functions**:
- `IsolationForestDetector` class
- `CUSUMDetector` class
- `EnsembleAnomalyDetector` class
- `ensemble_voting()` - Combine results

**Dependencies**: pandas, numpy, sklearn

#### 5. rl_agent.py (304 lines)
**Purpose**: Q-Learning agent implementation

**Key Classes/Functions**:
- `QLearningAgent` class
- `train()` - Training loop
- `update_q_table()` - Q-value updates
- `backtest()` - Validation
- `select_action()` - Epsilon-greedy policy

**Dependencies**: numpy, pandas

#### 6. api.py (315 lines)
**Purpose**: FastAPI REST backend

**Key Endpoints**:
- `GET /health` - Health check
- `GET /api/summary` - All metrics
- `GET /api/pcmci` - Causal analysis
- `GET /api/anomalies` - Anomaly results
- `GET /api/rl_strategy` - Q-Learning metrics

**Dependencies**: fastapi, uvicorn, pydantic

### Frontend Components

#### 1. app/page.tsx (317 lines)
**Home Dashboard**
- 4 summary cards (Data, PCMCI, Anomalies, Q-Learning)
- Tab navigation
- Quick overview of system status

#### 2. app/pcmci/page.tsx (189 lines)
**PCMCI Analysis Page**
- Total and significant links count
- Top 10 strongest causal relationships
- Complete links table
- About PCMCI explanation

#### 3. app/anomalies/page.tsx (196 lines)
**Anomaly Detection Page**
- Total anomalies and detection rate
- Method comparison (Isolation Forest vs CUSUM)
- Ensemble results
- First 50 anomaly events
- Recommendations

#### 4. app/rl-strategy/page.tsx (258 lines)
**Q-Learning Strategy Page**
- Training episodes and rewards
- Hyperparameters display
- Training results metrics
- Q-Learning algorithm explanation
- Action space definition
- Expected impact analysis

#### 5. app/insights/page.tsx (170 lines)
**Insights & Recommendations Page**
- Key findings
- Actionable recommendations
- Next steps
- Implementation roadmap
- Related analysis links

### API Routes

All proxy routes follow same pattern:
```typescript
// /api/[endpoint]/route.ts
export async function GET(request: NextRequest) {
  const res = await fetch(`${BACKEND_URL}/api/[endpoint]`)
  const data = await res.json()
  return NextResponse.json(data)
}
```

## Execution Flow

### Complete Pipeline Execution

```
python scripts/complete_pipeline.py
       │
       ├─ PHASE 1: Data Generation
       │  └─ Generate 8760 × 14 synthetic data
       │
       ├─ PHASE 2: PCMCI Analysis
       │  └─ Discover 55+ causal relationships
       │
       ├─ PHASE 3: Anomaly Detection
       │  └─ Find 8760 anomalies (ensemble)
       │
       ├─ PHASE 4: Q-Learning Training
       │  └─ Train 50 episodes with convergence
       │
       ├─ PHASE 5: Backtesting
       │  └─ Validate on 1000 test samples
       │
       └─ Save Results
          ├─ ocp_synthetic_data.csv
          ├─ pcmci_results.json
          ├─ anomaly_results.json
          └─ q_table.pkl
```

### API Request Flow

```
Frontend (Next.js)
       │
       └─ Fetch /api/summary
              │
              └─ API Proxy Route
                     │
                     └─ FastAPI Backend (api.py)
                            │
                            └─ Load from disk
                                   │
                                   └─ Return JSON
```

## Performance Characteristics

### Time Complexity
- PCMCI: O(n² × p³) where n=samples, p=variables
- Isolation Forest: O(n × log n)
- CUSUM: O(n)
- Q-Learning: O(episodes × steps)

### Space Complexity
- Data storage: ~10 MB (8760 × 14)
- PCMCI results: ~500 KB (55 links)
- Anomaly results: ~2 MB (8760 flags)
- Q-table: ~50 KB (10×5)

### Wall Clock Time (Laptop)
- Data generation: ~5 seconds
- PCMCI analysis: ~30 seconds
- Anomaly detection: ~10 seconds
- Q-Learning (50 episodes): ~20 seconds
- Total pipeline: ~2 minutes

## Error Handling

### Frontend Error Handling
```typescript
try {
  const res = await fetch('/api/endpoint')
  if (!res.ok) throw new Error('API error')
  const data = await res.json()
  // Use data
} catch (err) {
  setError(err.message)
  // Display error UI
}
```

### Backend Error Handling
```python
@app.get("/api/endpoint")
async def endpoint():
    try:
        # Load data
        # Process
        return {"data": result}
    except FileNotFoundError:
        raise HTTPException(404, "Data not found")
    except Exception as e:
        raise HTTPException(500, "Internal error")
```

## Extension Points

### Adding New Analysis
1. Create module in `backend/src/new_analysis.py`
2. Implement analysis class
3. Save results to JSON in `backend/data/`
4. Add API endpoint in `backend/api.py`
5. Create frontend page in `app/new-analysis/page.tsx`

### Adding New Visualization
1. Create page in `app/new-page/page.tsx`
2. Add API proxy route in `app/api/new-data/route.ts`
3. Use Plotly/shadcn for UI
4. Add link from home page

### Deploying to Production
1. Build frontend: `pnpm build`
2. Deploy to Vercel
3. Deploy backend to Render/Railway/Docker
4. Set `BACKEND_URL` environment variable
5. Configure custom domain

## Monitoring & Debugging

### Check Data Pipeline
```bash
python -c "
import pandas as pd
df = pd.read_csv('backend/data/ocp_synthetic_data.csv')
print(f'Data shape: {df.shape}')
print(f'Columns: {df.columns.tolist()}')
"
```

### Check API Health
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy","data_loaded":true}
```

### Check Frontend Build
```bash
pnpm run build
# Check for errors in .next/
```

## Scaling Considerations

### Horizontal Scaling
- Frontend: Deploy to Vercel (auto-scaling)
- Backend: Use load balancer with multiple instances
- Data: Move to database (PostgreSQL)

### Vertical Scaling
- Increase server RAM for larger datasets
- Use GPU acceleration for ML (CUDA)
- Optimize pandas operations with Dask

### Caching Strategy
- Frontend: ISR (Incremental Static Regeneration)
- Backend: Redis cache for API responses
- Data: Database with efficient indexing

## Security Considerations

1. **Input Validation**: All API inputs validated
2. **CORS**: Properly configured for frontend domain
3. **Error Messages**: No sensitive data leaked
4. **Dependencies**: All pinned to specific versions
5. **Authentication**: Ready for OAuth2/JWT (P2 feature)

---

**Architecture Version**: 1.0
**Last Updated**: 2026-03-17
