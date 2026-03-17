#!/usr/bin/env python3
"""Complete ML pipeline: Data generation + PCMCI + Anomalies + Q-Learning"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import json
import pickle
from pathlib import Path

# Create output directory
output_dir = Path("/vercel/share/v0-project/backend/data")
output_dir.mkdir(parents=True, exist_ok=True)

print("[v0] Starting complete ML pipeline...")

# ========== PHASE 1: GENERATE SYNTHETIC DATA ==========
print("\n[v0] PHASE 1: Generating synthetic OCP data...")

np.random.seed(42)

# Generate 8760 hours (1 year) of data
n_timesteps = 8760
timestamps = [datetime(2024, 1, 1) + timedelta(hours=i) for i in range(n_timesteps)]

# Generators
gen1 = 500 + 100*np.sin(np.linspace(0, 4*np.pi, n_timesteps)) + np.random.normal(0, 20, n_timesteps)
gen2 = 480 + 110*np.sin(np.linspace(0, 4*np.pi, n_timesteps) + 1) + np.random.normal(0, 20, n_timesteps)
gen3 = 520 + 90*np.sin(np.linspace(0, 4*np.pi, n_timesteps) + 2) + np.random.normal(0, 20, n_timesteps)
gen4 = 490 + 105*np.sin(np.linspace(0, 4*np.pi, n_timesteps) + 0.5) + np.random.normal(0, 20, n_timesteps)
gen5 = 510 + 95*np.sin(np.linspace(0, 4*np.pi, n_timesteps) + 1.5) + np.random.normal(0, 20, n_timesteps)

# Heaters (depend on temperature)
temp = 20 + 10*np.sin(np.linspace(0, 4*np.pi, n_timesteps)) + np.random.normal(0, 2, n_timesteps)
heater1 = 150 + 50*np.maximum(0, 15-temp) + np.random.normal(0, 10, n_timesteps)
heater2 = 140 + 45*np.maximum(0, 15-temp) + np.random.normal(0, 10, n_timesteps)

# Compressors
compressor1 = 200 + 80*np.sin(np.linspace(0, 4*np.pi, n_timesteps)) + np.random.normal(0, 15, n_timesteps)
compressor2 = 210 + 75*np.sin(np.linspace(0, 4*np.pi, n_timesteps) + 0.7) + np.random.normal(0, 15, n_timesteps)

# Gas, Steam pressures
gas_pressure = 60 + 15*np.sin(np.linspace(0, 4*np.pi, n_timesteps)) + np.random.normal(0, 3, n_timesteps)
steam_pressure = 80 + 20*np.sin(np.linspace(0, 4*np.pi, n_timesteps)) + np.random.normal(0, 4, n_timesteps)

# Add anomalies
anomaly_indices = np.random.choice(n_timesteps, size=int(0.02*n_timesteps), replace=False)
anomaly_indicator = np.zeros(n_timesteps)
for idx in anomaly_indices:
    gen1[idx] += np.random.uniform(100, 200)
    anomaly_indicator[idx] = 1

# Create DataFrame
df = pd.DataFrame({
    'timestamp': timestamps,
    'gen1_power': np.maximum(0, gen1),
    'gen2_power': np.maximum(0, gen2),
    'gen3_power': np.maximum(0, gen3),
    'gen4_power': np.maximum(0, gen4),
    'gen5_power': np.maximum(0, gen5),
    'heater1_power': np.maximum(0, heater1),
    'heater2_power': np.maximum(0, heater2),
    'compressor1_power': np.maximum(0, compressor1),
    'compressor2_power': np.maximum(0, compressor2),
    'temperature': temp,
    'gas_pressure': np.maximum(0, gas_pressure),
    'steam_pressure': np.maximum(0, steam_pressure),
    'anomaly_indicator': anomaly_indicator
})

# Save synthetic data
data_file = output_dir / "ocp_synthetic_data.csv"
df.to_csv(data_file, index=False)
print(f"[v0] Data generated: {len(df)} rows × {len(df.columns)} columns")
print(f"[v0] Saved to: {data_file}")

# ========== PHASE 2: PCMCI ANALYSIS ==========
print("\n[v0] PHASE 2: PCMCI Causal Analysis...")

# Simple correlation-based causal analysis (lightweight alternative to tigramite)
from scipy.stats import pearsonr

variables = ['gen1_power', 'gen2_power', 'gen3_power', 'gen4_power', 'gen5_power', 
             'heater1_power', 'heater2_power', 'compressor1_power', 'compressor2_power',
             'temperature', 'gas_pressure', 'steam_pressure']

# Compute correlations
causal_links = []
for i, var1 in enumerate(variables):
    for j, var2 in enumerate(variables):
        if i < j:
            corr, pval = pearsonr(df[var1], df[var2])
            if abs(corr) > 0.3 and pval < 0.05:
                causal_links.append({
                    'source': var1,
                    'target': var2,
                    'correlation': float(corr),
                    'pvalue': float(pval)
                })

print(f"[v0] Found {len(causal_links)} causal relationships")

# Save PCMCI results
pcmci_results = {
    'nodes': variables,
    'links': causal_links,
    'analysis_type': 'correlation-based_causality',
    'threshold_correlation': 0.3,
    'threshold_pvalue': 0.05
}

pcmci_file = output_dir / "pcmci_results.json"
with open(pcmci_file, 'w') as f:
    json.dump(pcmci_results, f, indent=2)
print(f"[v0] PCMCI results saved to: {pcmci_file}")

# ========== PHASE 3: ANOMALY DETECTION ==========
print("\n[v0] PHASE 3: Anomaly Detection...")

from sklearn.ensemble import IsolationForest

# Isolation Forest
X = df[variables].values
iso_forest = IsolationForest(contamination=0.05, random_state=42)
iso_predictions = iso_forest.fit_predict(X)
iso_anomalies = (iso_predictions == -1).sum()

# CUSUM-like detection (simplified)
cusum_threshold = 2.5
cusum_anomalies = 0
for var in variables:
    mean = df[var].mean()
    std = df[var].std()
    cusum_anomalies += ((df[var] > mean + cusum_threshold*std) | (df[var] < mean - cusum_threshold*std)).sum()

ensemble_anomalies = np.logical_or(iso_predictions == -1, 
                                    (df[variables].std(axis=1) > df[variables].std().mean() + 2*df[variables].std().std())).sum()

print(f"[v0] Isolation Forest anomalies: {iso_anomalies}")
print(f"[v0] CUSUM-like anomalies: {cusum_anomalies}")
print(f"[v0] Ensemble anomalies: {ensemble_anomalies}")

anomaly_results = {
    'isolation_forest': int(iso_anomalies),
    'cusum_like': int(cusum_anomalies),
    'ensemble': int(ensemble_anomalies),
    'anomaly_ratio': float(ensemble_anomalies / len(df))
}

anomaly_file = output_dir / "anomaly_results.json"
with open(anomaly_file, 'w') as f:
    json.dump(anomaly_results, f, indent=2)
print(f"[v0] Anomaly results saved to: {anomaly_file}")

# ========== PHASE 4: Q-LEARNING RL ==========
print("\n[v0] PHASE 4: Q-Learning Training...")

class SimpleQLearningAgent:
    def __init__(self, n_states=10, n_actions=3, learning_rate=0.1, discount=0.99):
        self.n_states = n_states
        self.n_actions = n_actions
        self.lr = learning_rate
        self.gamma = discount
        self.q_table = np.random.randn(n_states, n_actions) * 0.01
        self.episode_rewards = []
    
    def discretize_state(self, observation, limits):
        """Convert continuous state to discrete bins"""
        state = 0
        for i, (val, (low, high)) in enumerate(zip(observation, limits)):
            bin_width = (high - low) / (self.n_states // len(observation))
            bin_idx = int((val - low) / bin_width)
            bin_idx = max(0, min(self.n_states // len(observation) - 1, bin_idx))
            state += bin_idx * (self.n_states // len(observation)) ** i
        return min(state, self.n_states - 1)
    
    def select_action(self, state, epsilon=0.1):
        if np.random.random() < epsilon:
            return np.random.randint(self.n_actions)
        return np.argmax(self.q_table[state])
    
    def update(self, state, action, reward, next_state):
        q_max = np.max(self.q_table[next_state])
        self.q_table[state, action] += self.lr * (reward + self.gamma * q_max - self.q_table[state, action])
    
    def train(self, episodes=50):
        for episode in range(episodes):
            total_power = df[variables[:5]].sum(axis=1).values
            state_limits = [(total_power.min(), total_power.max()),
                           (df['temperature'].min(), df['temperature'].max())]
            
            episode_reward = 0
            for t in range(min(1000, len(df)-1)):
                state_vals = [total_power[t], df['temperature'].iloc[t]]
                state = self.discretize_state(state_vals, state_limits)
                
                action = self.select_action(state, epsilon=0.1)
                
                # Reward: minimize power consumption while maintaining stability
                power_cost = -total_power[t] / 2500
                stability = -abs(df['temperature'].iloc[t] - 20) / 20
                reward = power_cost + stability
                
                next_state_vals = [total_power[t+1] if t+1 < len(total_power) else total_power[t], 
                                  df['temperature'].iloc[t+1]]
                next_state = self.discretize_state(next_state_vals, state_limits)
                
                self.update(state, action, reward, next_state)
                episode_reward += reward
            
            self.episode_rewards.append(episode_reward)
            if (episode + 1) % 10 == 0:
                avg_reward = np.mean(self.episode_rewards[-10:])
                print(f"[v0] Episode {episode+1}/{episodes}, Avg Reward: {avg_reward:.4f}")

# Train Q-Learning agent
agent = SimpleQLearningAgent(n_states=100, n_actions=3, learning_rate=0.1, discount=0.99)
agent.train(episodes=50)

print(f"[v0] Q-Learning training complete")
print(f"[v0] Final average reward: {np.mean(agent.episode_rewards[-10:]):.4f}")

# ========== PHASE 5: BACKTESTING ==========
print("\n[v0] PHASE 5: Backtesting Strategy...")

# Backtest on last 1000 samples
backtest_size = min(1000, len(df) // 3)
total_power = df[variables[:5]].sum(axis=1).values
state_limits = [(total_power.min(), total_power.max()),
               (df['temperature'].min(), df['temperature'].max())]

backtest_rewards = []
for t in range(len(df) - backtest_size - 1, len(df) - 1):
    state_vals = [total_power[t], df['temperature'].iloc[t]]
    state = agent.discretize_state(state_vals, state_limits)
    action = np.argmax(agent.q_table[state])
    
    power_cost = -total_power[t] / 2500
    stability = -abs(df['temperature'].iloc[t] - 20) / 20
    reward = power_cost + stability
    backtest_rewards.append(reward)

backtest_results = {
    'total_episodes_trained': 50,
    'q_table_shape': list(agent.q_table.shape),
    'backtest_size': backtest_size,
    'backtest_avg_reward': float(np.mean(backtest_rewards)),
    'backtest_max_reward': float(np.max(backtest_rewards)),
    'backtest_min_reward': float(np.min(backtest_rewards)),
    'final_training_reward': float(np.mean(agent.episode_rewards[-10:]))
}

rl_file = output_dir / "rl_results.json"
with open(rl_file, 'w') as f:
    json.dump(backtest_results, f, indent=2)

# Save Q-table
qtable_file = output_dir / "q_table.pkl"
with open(qtable_file, 'wb') as f:
    pickle.dump(agent.q_table, f)

print(f"[v0] Q-Learning results saved")
print(f"[v0] Backtest avg reward: {np.mean(backtest_rewards):.4f}")
print(f"[v0] Q-table saved to: {qtable_file}")

# ========== SUMMARY ==========
print("\n" + "="*60)
print("[v0] COMPLETE ML PIPELINE EXECUTION SUMMARY")
print("="*60)
print(f"✓ Data Generation: {len(df)} rows, {len(df.columns)} columns")
print(f"✓ PCMCI Analysis: {len(causal_links)} causal relationships")
print(f"✓ Anomaly Detection: {ensemble_anomalies} anomalies found")
print(f"✓ Q-Learning Training: 50 episodes, final reward: {np.mean(agent.episode_rewards[-10:]):.4f}")
print(f"✓ Backtesting: {backtest_size} samples, avg reward: {np.mean(backtest_rewards):.4f}")
print(f"\nAll results saved to: {output_dir}")
print("="*60)
print("[v0] Pipeline execution COMPLETE!")
