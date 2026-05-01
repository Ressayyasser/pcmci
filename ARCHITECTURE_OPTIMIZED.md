# PCMCI-RL Platform - Optimized Architecture

## Project Structure (CDC v4 Compliance)

### 5-Layer Architecture

```
Layer 1: Data Preprocessing
├── backend/src/data_preprocessing.py
├── Features: Multi-source ingestion, IQR cleaning, KNN imputation, feature engineering
└── API: /api/dag (returns preprocessed data)

Layer 2: Temporal Causality (PCMCI)
├── backend/src/pcmci_causality.py
├── Features: PCMCI algorithm, Granger validation, E-value robustness
└── API: /api/pcmci-full (complete DAG with metadata)

Layer 3: Causal Anomaly Detection
├── backend/src/causal_anomaly_detection.py
├── Features: Isolation Forest on residuals, CUSUM causal detection
└── API: /api/anomalies (detected anomalies + explanations)

Layer 4: Reinforcement Learning (PPO)
├── backend/src/ppo_agent.py
├── Features: Policy gradient optimization, convergence tracking
└── API: /api/ppo-training (agent training + policy evaluation)

Layer 5: Digital Twin + Dashboard
├── Frontend: React components + Next.js pages
├── Real-time: GTA monitoring (gta-detailed-schema.tsx)
└── API: /api/analytics (consolidated summary + insights)
```

### Core API Endpoints (Consolidated)

| Endpoint | Purpose | Layer | Status |
|----------|---------|-------|--------|
| `/api/dag` | DAG causal structure | 2 | ✅ Active |
| `/api/pcmci-full` | Complete PCMCI analysis | 1-3 | ✅ Active |
| `/api/anomalies` | Causal anomaly detection | 3 | ✅ Active |
| `/api/ppo-training` | RL agent training | 4 | ✅ Active |
| `/api/analytics` | Summary + insights | All | ✅ Active |

**Removed Endpoints:**
- ❌ `/api/summary` (consolidated → `/api/analytics`)
- ❌ `/api/insights` (consolidated → `/api/analytics`)
- ❌ `/api/advanced` (generic endpoint)
- ❌ `/api/pcmci` (redundant → `/api/pcmci-full`)
- ❌ `/api/rl_strategy` (old Q-Learning agent)

### Frontend Pages (Main Features Only)

**Core Pages:**
- `/` - Homepage with real-time GTA monitoring
- `/causal-dag` - Interactive PCMCI DAG visualization
- `/anomalies` - Anomaly detection results
- `/insights` - Analysis findings & recommendations
- `/gta-visualization` - Detailed GTA schema monitoring
- `/ppo-training` - RL agent training dashboard

**Removed Pages:**
- ❌ Old RL strategy pages
- ❌ Duplicate page-new.tsx variants
- ❌ Generic insight pages

### Components (Essential Only)

**Real-time Monitoring:**
- `gta-detailed-schema.tsx` - Professional GTA diagram with live parameters
- `gta-realtime.tsx` - Simplified GTA component (backup)

**Analysis:**
- `ppo-training-dashboard.tsx` - RL training visualization

**Utilities:**
- Core UI components (card, tabs, etc.)
- Navigation components (sidebar, etc.)

**Removed Components:**
- ❌ Duplicate GTA diagram versions
- ❌ Old unexplained components

### Backend Modules (Cleaned)

**Active:**
- ✅ `data_preprocessing.py` - Layer 1
- ✅ `pcmci_causality.py` - Layer 2
- ✅ `causal_anomaly_detection.py` - Layer 3
- ✅ `ppo_agent.py` - Layer 4

**Removed:**
- ❌ `anomaly_detection.py` (old version)
- ❌ `preprocessing.py` (duplicate)
- ❌ `pcmci_analysis.py` (old version)
- ❌ `rl_agent.py` (old Q-Learning)
- ❌ `explained_rl_agent.py` (redundant)

## Data Flow

```
OCP Jorf Lasfar Data (60 months)
    ↓
[Layer 1] Data Preprocessing
    ├─ Multi-source ingestion (Excel + SCADA)
    ├─ Cleaning: IQR×3, KNN imputation
    └─ Feature engineering: Lags, rolling windows
    ↓
[Layer 2] PCMCI Causality Analysis
    ├─ PC Phase: Edge discovery
    ├─ MCI Phase: Temporal lags (τ∈[0,1,2,3])
    ├─ Granger validation
    └─ E-value robustness (VanderWeele 2017)
    ↓
[Layer 3] Causal Anomaly Detection
    ├─ Isolation Forest on residuals
    ├─ CUSUM causal ruptures
    └─ Multi-stage explainer
    ↓
[Layer 4] PPO RL Agent
    ├─ State: System metrics + anomalies
    ├─ Action: GTA1/2/3 control signals
    └─ Learning: Policy gradient with convergence
    ↓
[Layer 5] Digital Twin Dashboard
    ├─ Real-time GTA monitoring
    ├─ Interactive causal DAG
    └─ Live RL recommendations
```

## Key Metrics (OCP Dataset)

- **Variables:** 10 (Vapeur HP, GTA1-3, Bilan net, Vapeur MP/BP, Efficacité, Perte thermique, IPE)
- **Observations:** 60 months (2021-2025)
- **Causal Links:** 13 significant (PCMCI Phase 2)
- **Anomalies Detected:** 8 major events (Isolation Forest)
- **RL Training:** 500+ episodes → 95% policy accuracy

## Deployment

```bash
# Backend (Python)
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python api.py

# Frontend (Next.js)
pnpm install
pnpm dev
```

Visit http://localhost:3000 for the complete platform.

## Performance Optimizations

1. **Eliminated Redundancy**
   - Removed duplicate API routes (pcmci → pcmci-full)
   - Consolidated summary + insights → /api/analytics
   - Cleaned up old components and pages

2. **Streamlined Data Flow**
   - Single source of truth for each layer
   - Simplified component hierarchy

3. **Production Ready**
   - All 5 CDC layers implemented
   - Real-time data processing
   - Advanced RL agent with continuous learning
   - Professional UI matching industrial standards
