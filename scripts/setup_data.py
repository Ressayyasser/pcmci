#!/usr/bin/env python3
"""Standalone data generation for OCP Energy Analysis"""

import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime, timedelta

print("[v0] Starting data generation...")

# Create data directory
data_dir = Path("/vercel/share/v0-project/backend/data")
data_dir.mkdir(parents=True, exist_ok=True)

# Configuration
N_DAYS = 365
N_HOURS = N_DAYS * 24
ANOMALY_PROB = 0.02

print(f"[v0] Generating {N_HOURS} hours of data (anomaly probability: {ANOMALY_PROB})...")

# Initialize numpy random seed for reproducibility
np.random.seed(42)

# Create timestamp
start_date = datetime(2023, 1, 1)
timestamps = pd.date_range(start=start_date, periods=N_HOURS, freq='H')

# Create base data structure
data = {
    'timestamp': timestamps,
}

# ============ GENERATORS (5 units) ============
for i in range(1, 6):
    # Power output (MW): normal ~200 MW, std=30
    base_power = np.random.normal(200, 30, N_HOURS)
    base_power = np.clip(base_power, 100, 350)
    
    # Add anomalies
    anomalies = np.random.binomial(1, ANOMALY_PROB, N_HOURS)
    anomaly_mag = anomalies * np.random.normal(0, 100, N_HOURS)
    
    data[f'gen_{i}_power'] = base_power + anomaly_mag
    data[f'gen_{i}_temp'] = np.random.normal(450, 40, N_HOURS) + anomalies * np.random.normal(0, 80, N_HOURS)
    data[f'gen_{i}_fuel_rate'] = np.random.normal(150, 20, N_HOURS) + anomalies * np.random.normal(0, 40, N_HOURS)

# ============ HEATERS (2 units) ============
for i in range(1, 3):
    data[f'heater_{i}_power'] = np.random.normal(50, 15, N_HOURS) + anomalies * np.random.normal(0, 30, N_HOURS)
    data[f'heater_{i}_outlet_temp'] = np.random.normal(350, 30, N_HOURS) + anomalies * np.random.normal(0, 60, N_HOURS)

# ============ COMPRESSORS (2 units) ============
for i in range(1, 3):
    data[f'comp_{i}_power'] = np.random.normal(100, 20, N_HOURS) + anomalies * np.random.normal(0, 50, N_HOURS)
    data[f'comp_{i}_discharge_temp'] = np.random.normal(300, 25, N_HOURS) + anomalies * np.random.normal(0, 50, N_HOURS)

# ============ SYSTEM METRICS ============
data['total_power'] = data['gen_1_power'] + data['gen_2_power'] + data['gen_3_power'] + data['gen_4_power'] + data['gen_5_power']
data['steam_pressure'] = np.random.normal(180, 20, N_HOURS) + anomalies * np.random.normal(0, 40, N_HOURS)
data['efficiency'] = np.random.normal(0.45, 0.05, N_HOURS) + anomalies * np.random.normal(0, 0.1, N_HOURS)
data['anomaly_indicator'] = anomalies

# Create DataFrame
df = pd.DataFrame(data)

# Clip negative values for physical quantities
for col in df.columns:
    if col != 'timestamp' and col != 'anomaly_indicator':
        df[col] = df[col].clip(lower=0)

# Save to CSV
output_file = data_dir / "ocp_synthetic_data.csv"
df.to_csv(output_file, index=False)

print(f"[v0] ✓ Data generated: {len(df)} rows × {len(df.columns)} columns")
print(f"[v0] ✓ Saved to: {output_file}")
print(f"\n[v0] Data Summary:")
print(f"[v0] Time range: {df['timestamp'].min()} to {df['timestamp'].max()}")
print(f"[v0] Columns: {len(df.columns)}")
print(f"[v0] Anomalies: {df['anomaly_indicator'].sum()} ({100*df['anomaly_indicator'].mean():.1f}%)")
print(f"[v0] Total power range: {df['total_power'].min():.1f} - {df['total_power'].max():.1f} MW")
print(f"\n[v0] ✓ Backend initialization COMPLETE")
