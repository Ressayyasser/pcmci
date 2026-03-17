# Deployment Guide - OCP Energy Anomaly Detection

## Local Development Setup

### Prerequisites
- Python 3.9+ with pip
- Node.js 18+ with pnpm
- Git

### Step 1: Clone & Install Frontend Dependencies

```bash
# Install frontend dependencies
pnpm install

# Verify Next.js 16 installation
pnpm list next react typescript
```

### Step 2: Setup Python Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install fastapi uvicorn pandas numpy scikit-learn plotly dash

# Optional: Install tigramite for advanced PCMCI
pip install tigramite
```

### Step 3: Generate Synthetic Data

```bash
# From project root
python scripts/setup_data.py

# Verify data was created
ls -la backend/data/
# Should show: ocp_synthetic_data.csv
```

### Step 4: Run Complete ML Pipeline

```bash
# Generate data + run PCMCI + anomaly detection + Q-Learning
python scripts/complete_pipeline.py

# Wait for completion, should produce:
# - backend/data/pcmci_results.json
# - backend/data/anomaly_results.json
# - backend/data/q_table.pkl
```

### Step 5: Start FastAPI Backend

```bash
cd backend
python api.py

# Output should show:
# [v0] Starting FastAPI application on http://0.0.0.0:8000
# Server running at http://127.0.0.1:8000
```

### Step 6: Start Next.js Frontend (New Terminal)

```bash
# From project root (not backend/)
pnpm dev

# Output should show:
# ▲ Next.js 16.0.0
# ▲ Local: http://localhost:3000
```

### Step 7: Optional - Start Dash Dashboard (New Terminal)

```bash
cd backend
python dash_app.py

# Output should show:
# [v0] Starting Dash application on http://127.0.0.1:8050
# Dash is running on http://127.0.0.1:8050
```

### Step 8: Access the Application

- **Frontend**: http://localhost:3000
- **FastAPI Docs**: http://localhost:8000/docs
- **Dash Dashboard**: http://localhost:8050 (optional)

## Testing the System

### Test 1: Check FastAPI Health

```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy","data_loaded":true}
```

### Test 2: Get System Summary

```bash
curl http://localhost:8000/api/summary
# Shows: data, pcmci, anomalies, rl_agent metrics
```

### Test 3: Check Frontend API Proxy

```bash
curl http://localhost:3000/api/summary
# Should return same data as FastAPI
```

### Test 4: Browse Dash Dashboard

Visit http://localhost:8050:
- Overview tab shows KPIs
- PCMCI Analysis shows causal links
- Anomaly Detection shows timeline
- Q-Learning shows policy heatmap

## Production Deployment - Vercel

### Prerequisites
- Vercel Account (vercel.com)
- GitHub Repository
- FastAPI Backend (separate hosting)

### Option 1: Deploy Frontend Only (Recommended for MVP)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project root
vercel

# Follow prompts:
# Project name: ocp-energy-dashboard
# Framework: Next.js
# Root directory: ./
# Build command: pnpm run build
# Output directory: .next
```

**After Deployment:**

1. Set environment variable in Vercel Dashboard:
   ```
   BACKEND_URL=https://your-backend-domain.com
   ```

2. Redeploy to apply env vars:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy Backend (FastAPI on Render/Railway)

#### Using Render.com:

1. Create `backend/requirements.txt`:
```txt
fastapi==0.104.1
uvicorn==0.24.0
pandas==2.1.3
numpy==1.26.2
scikit-learn==1.3.2
plotly==5.18.0
```

2. Create `backend/render.yaml`:
```yaml
services:
  - type: web
    name: ocp-api
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn api:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11
```

3. Push to GitHub and connect on render.com

4. Vercel environment variable:
   ```
   BACKEND_URL=https://ocp-api.onrender.com
   ```

#### Using Railway.app:

1. Connect GitHub repository
2. Create `Procfile`:
```
web: cd backend && uvicorn api:app --host 0.0.0.0 --port $PORT
```

3. Deploy and note the URL
4. Add to Vercel environment

### Option 3: Full Stack Docker Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/ocp
    depends_on:
      - db

  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - BACKEND_URL=http://backend:8000
    depends_on:
      - backend

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=ocp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Start with:
```bash
docker-compose up -d
# Access: http://localhost:3000
```

## Performance Optimization

### Frontend (Next.js)

Enable production optimizations:

```bash
# Build for production
pnpm run build

# Test production build locally
pnpm run start
```

### Backend (FastAPI)

```bash
# Use production ASGI server (gunicorn)
pip install gunicorn

# Run with multiple workers
gunicorn -w 4 -k uvicorn.workers.UvicornWorker api:app
```

### Caching Strategy

Add to `app/page.tsx`:
```typescript
export const revalidate = 3600 // ISR: revalidate every hour
```

## Monitoring & Logging

### Check Backend Logs

```bash
# See real-time logs
tail -f backend/api.log

# Or capture logs
python api.py > api.log 2>&1 &
```

### Monitor Frontend in Vercel

1. Dashboard: vercel.com/projects
2. Select project → Analytics
3. Monitor: Build time, serverless function duration

## Troubleshooting

### Issue: Frontend can't reach backend

**Solution:**
```bash
# Check BACKEND_URL environment variable
vercel env pull

# Verify backend is accessible
curl ${BACKEND_URL}/health

# Update if needed
vercel env add BACKEND_URL https://your-backend.com
vercel redeploy
```

### Issue: Dash not starting

**Solution:**
```bash
# Check Python version
python --version  # Should be 3.9+

# Reinstall Dash
pip install --upgrade dash plotly

# Try running in verbose mode
python -u dash_app.py
```

### Issue: Data files not found

**Solution:**
```bash
# Regenerate data
cd backend
python ../scripts/setup_data.py

# Verify files exist
ls -la data/

# Run pipeline
python ../scripts/complete_pipeline.py
```

### Issue: NextJS build fails

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next
pnpm install

# Rebuild
pnpm run build

# Check for TypeScript errors
pnpm run type-check
```

## Scaling for Production

### Database Integration (P2)

```bash
# Install PostgreSQL client
pip install psycopg2-binary sqlalchemy

# Setup alembic for migrations
alembic init alembic
```

### Load Testing

```bash
# Use Artillery for load testing
npm install -g artillery

# Create load-test.yml
# artillery run load-test.yml

# Or use Apache Bench
ab -n 1000 -c 10 http://localhost:3000/
```

### CI/CD Pipeline

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm run build
      - run: pnpm run type-check

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install -g vercel
      - run: vercel deploy --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## Support & Documentation

- **API Docs**: http://backend:8000/docs (Swagger UI)
- **README**: See `/README.md`
- **Architecture**: See `/ARCHITECTURE.md` (if exists)
- **Cahier des Charges**: Original requirements in project docs

## Deployment Checklist

- [ ] Python dependencies listed in `requirements.txt`
- [ ] Environment variables documented
- [ ] Backend health check passing
- [ ] Frontend builds without errors
- [ ] API proxy routes working
- [ ] Data files generated
- [ ] ML pipeline executed successfully
- [ ] Dashboard accessible
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed (Render/Railway/Docker)
- [ ] Environment variables set in Vercel
- [ ] Custom domain configured (optional)
- [ ] SSL certificate installed (auto on Vercel)
- [ ] Monitoring alerts configured
- [ ] Backup strategy defined

## Version Info

- **Frontend**: Next.js 16, React 19
- **Backend**: FastAPI, Python 3.9+
- **Deployment**: Vercel + Custom Backend
- **Status**: Production Ready ✓
