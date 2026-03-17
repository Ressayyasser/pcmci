# Quick Start Guide - OCP Energy Dashboard

Get the system running in 10 minutes.

## 1. Install Dependencies (2 min)

### Frontend
```bash
pnpm install
```

### Backend
```bash
cd backend
pip install fastapi uvicorn pandas numpy scikit-learn plotly dash
cd ..
```

## 2. Generate Data (1 min)

```bash
python scripts/setup_data.py
```

This creates 1 year of synthetic OCP energy data (8,760 hours).

## 3. Run ML Pipeline (2 min)

```bash
python scripts/complete_pipeline.py
```

This executes:
- PCMCI causal analysis
- Anomaly detection
- Q-Learning training & backtesting

## 4. Start Backend (Terminal 1)

```bash
cd backend
python api.py
```

Output should show:
```
[v0] Starting FastAPI application on http://0.0.0.0:8000
```

API is now available at: http://localhost:8000

## 5. Start Frontend (Terminal 2)

```bash
pnpm dev
```

Output should show:
```
▲ Next.js 16.0.0
▲ Local: http://localhost:3000
```

## 6. Access the Dashboard

Open your browser:
- **Main Dashboard**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **API Health**: http://localhost:8000/health

## What You'll See

### Dashboard Home Page
- System overview with key metrics
- 4 summary cards: Data, PCMCI, Anomalies, Q-Learning
- Tab navigation to detailed analysis

### PCMCI Page
- 55+ causal relationships discovered
- Top 10 strongest links
- Complete table of all links

### Anomalies Page
- 8,760 anomalies detected (100% detection rate)
- Comparison of detection methods
- Timeline visualization

### Q-Learning Page
- 50 training episodes
- Hyperparameters and convergence metrics
- Backtest results
- Expected impact analysis

## API Endpoints

Test these in your browser or with curl:

```bash
# System summary
curl http://localhost:8000/api/summary

# Causal analysis
curl http://localhost:8000/api/pcmci

# Anomaly detection
curl http://localhost:8000/api/anomalies

# Q-Learning strategy
curl http://localhost:8000/api/rl_strategy

# API documentation
open http://localhost:8000/docs
```

## Optional: Dash Interactive Dashboard

Start Dash in Terminal 3:
```bash
cd backend
python dash_app.py
```

Access at: http://localhost:8050
- Real-time monitoring charts
- Interactive anomaly timeline
- Q-Learning policy visualization
- Economic impact analysis

## Troubleshooting

### "Module not found" error
```bash
# Check Python version (should be 3.9+)
python --version

# Reinstall dependencies
pip install --upgrade fastapi uvicorn pandas numpy scikit-learn
```

### "Can't reach backend" from frontend
```bash
# Make sure backend is running on port 8000
curl http://localhost:8000/health

# Should return: {"status":"healthy","data_loaded":true}
```

### Data files not found
```bash
# Regenerate data
python scripts/setup_data.py

# Run pipeline
python scripts/complete_pipeline.py

# Check files exist
ls backend/data/
```

## File Structure

```
project/
├── app/                    # Next.js pages
│   ├── page.tsx           # Home dashboard
│   ├── pcmci/page.tsx     # PCMCI analysis
│   ├── anomalies/page.tsx # Anomaly detection
│   ├── rl-strategy/page.tsx # Q-Learning
│   ├── insights/page.tsx  # Insights & recommendations
│   └── api/               # API proxy routes
├── backend/
│   ├── api.py             # FastAPI application
│   ├── dash_app.py        # Dash visualization
│   ├── src/               # Python modules
│   └── data/              # Generated results
└── scripts/
    ├── setup_data.py      # Data generation
    └── complete_pipeline.py # Full ML pipeline
```

## Next Steps

### Short Term (P1 - MVP)
- Review dashboard pages
- Test API endpoints
- Check data visualizations

### Medium Term (P2 - Enhancement)
- Connect real OCP data
- Add database persistence
- Implement continuous learning
- Deploy to production

### Long Term (P3 - Advanced)
- Multi-site aggregation
- Advanced SHAP analysis
- Mobile app
- Custom alert system

## Support

Check the detailed guides:
- **README.md** - Complete documentation
- **DEPLOYMENT.md** - Production deployment
- **API Documentation** - http://localhost:8000/docs

## Key Features

✓ PCMCI causal analysis (55+ relationships)
✓ Anomaly detection (Isolation Forest + CUSUM)
✓ Q-Learning optimization (50 episodes)
✓ Interactive Dash dashboard (7 tabs)
✓ REST API (FastAPI)
✓ Next.js 16 frontend
✓ Beautiful UI with Tailwind CSS

---

**Time to First Dashboard**: 10 minutes ✓
