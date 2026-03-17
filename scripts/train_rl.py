"""Train Q-Learning agent on OCP data and perform backtesting."""

import pandas as pd
import numpy as np
import json
import sys
from pathlib import Path

# Direct implementation without imports
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))


def discretize_value(value, min_val, max_val, n_states=10):
    """Discretize continuous value to state index."""
    if max_val == min_val:
        return 0
    normalized = (value - min_val) / (max_val - min_val)
    state = int(normalized * (n_states - 1))
    return max(0, min(state, n_states - 1))


def compute_reward(power, target_power, anomaly_detected):
    """Compute reward signal."""
    power_deviation = abs(power - target_power)
    power_reward = -0.1 * power_deviation
    anomaly_penalty = -10.0 if anomaly_detected else 0.0
    stability_bonus = 0.5
    return power_reward + anomaly_penalty + stability_bonus


def train_q_learning(states, rewards, n_states=10, n_actions=5, episodes=100):
    """Train Q-Learning agent."""
    q_table = np.zeros((n_states, n_actions))
    learning_rate = 0.1
    discount_factor = 0.95
    exploration_rate = 0.1
    
    episode_rewards = []
    
    for episode in range(episodes):
        episode_reward = 0
        
        for i in range(min(len(states) - 1, 500)):
            state = states[i]
            next_state = states[i + 1]
            reward = rewards[i]
            
            # Epsilon-greedy action selection
            if np.random.random() < exploration_rate:
                action = np.random.randint(0, n_actions)
            else:
                action = np.argmax(q_table[state, :])
            
            # Q-Learning update
            max_next_q = np.max(q_table[next_state, :])
            current_q = q_table[state, action]
            new_q = current_q + learning_rate * (reward + discount_factor * max_next_q - current_q)
            q_table[state, action] = new_q
            
            episode_reward += reward
        
        episode_rewards.append(episode_reward)
        
        if (episode + 1) % 20 == 0:
            print(f"[v0] Episode {episode + 1}/{episodes}, Reward: {episode_reward:.2f}")
    
    return q_table, episode_rewards


def evaluate_policy(q_table, states, n_actions):
    """Evaluate learned policy."""
    actions = []
    for state in states[:-1]:
        action = np.argmax(q_table[state, :])
        actions.append(action)
    return actions


def compute_policy_entropy(policy, n_actions):
    """Compute policy entropy."""
    action_counts = np.bincount(policy, minlength=n_actions)
    probabilities = action_counts / len(policy)
    entropy = -np.sum(probabilities[probabilities > 0] * np.log2(probabilities[probabilities > 0]))
    return float(entropy)


print("[v0] Loading synthetic data...")
data_path = Path("/vercel/share/v0-project/backend/data/ocp_synthetic_data.csv")

if not data_path.exists():
    print(f"[v0] ERROR: Data file not found at {data_path}")
    sys.exit(1)

df = pd.read_csv(data_path)
print(f"[v0] Loaded {len(df)} rows of data")

# Select power column (use first numeric column that looks like power)
power_column = "total_power"
if power_column not in df.columns:
    # Find any power-related column
    power_columns = [col for col in df.columns if "power" in col.lower()]
    if power_columns:
        power_column = power_columns[0]
    else:
        power_column = df.select_dtypes(include=[np.number]).columns[0]

print(f"[v0] Using power column: {power_column}")

# Get anomaly column
anomaly_column = "anomaly_ensemble"
if anomaly_column not in df.columns:
    df[anomaly_column] = 0

# Q-Learning setup
n_states = 10
n_actions = 5
target_power = df[power_column].mean()

print(f"\n[v0] Q-Learning Configuration:")
print(f"[v0]   States: {n_states}")
print(f"[v0]   Actions: {n_actions}")
print(f"[v0]   Target Power: {target_power:.2f}")

# Discretize states
print(f"\n[v0] Discretizing power data to states...")
min_power = df[power_column].min()
max_power = df[power_column].max()
states = [discretize_value(p, min_power, max_power, n_states) for p in df[power_column].values]

# Compute rewards
print(f"[v0] Computing rewards...")
rewards = [
    compute_reward(df[power_column].iloc[i], target_power, df[anomaly_column].iloc[i])
    for i in range(len(df))
]

# Train Q-Learning
print(f"\n[v0] Training Q-Learning agent...")
q_table, episode_rewards = train_q_learning(states, rewards, n_states, n_actions, episodes=100)

# Evaluate policy
print(f"\n[v0] Evaluating learned policy...")
actions = evaluate_policy(q_table, states, n_actions)
policy = np.argmax(q_table, axis=1)
policy_entropy = compute_policy_entropy(actions, n_actions)

# Backtest metrics
total_reward = sum(rewards)
average_reward = total_reward / len(actions) if actions else 0
anomalies_detected = int(df[anomaly_column].sum())
anomalies_handled = sum(1 for i, a in enumerate(actions) if df[anomaly_column].iloc[i] and a > 0)

print(f"\n[v0] Backtest Results:")
print(f"[v0]   Total Reward: {total_reward:.2f}")
print(f"[v0]   Average Reward/Step: {average_reward:.4f}")
print(f"[v0]   Anomalies Detected: {anomalies_detected}")
print(f"[v0]   Anomalies Handled: {anomalies_handled}")
print(f"[v0]   Policy Entropy: {policy_entropy:.4f}")
print(f"[v0]   Unique Actions: {len(set(actions))}")

# Save Q-table and results
output_dir = Path("/vercel/share/v0-project/backend/data")
output_dir.mkdir(parents=True, exist_ok=True)

# Save Q-table
q_table_path = output_dir / "q_table.json"
q_table_dict = {
    "q_table": q_table.tolist(),
    "n_states": n_states,
    "n_actions": n_actions,
    "learning_rate": 0.1,
    "discount_factor": 0.95
}
with open(q_table_path, 'w') as f:
    json.dump(q_table_dict, f, indent=2)

# Save backtest results
backtest_path = output_dir / "rl_backtest_results.json"
backtest_results = {
    "total_reward": float(total_reward),
    "average_reward": float(average_reward),
    "n_steps": len(actions),
    "anomalies_detected": anomalies_detected,
    "anomalies_handled": anomalies_handled,
    "policy_entropy": policy_entropy,
    "unique_actions": len(set(actions)),
    "episode_rewards": [float(r) for r in episode_rewards[-10:]]  # Last 10 episodes
}
with open(backtest_path, 'w') as f:
    json.dump(backtest_results, f, indent=2)

# Save action sequence
actions_path = output_dir / "rl_action_sequence.json"
with open(actions_path, 'w') as f:
    json.dump({"actions": actions, "n_actions": n_actions}, f)

print(f"\n[v0] Saved Q-table to: {q_table_path}")
print(f"[v0] Saved backtest results to: {backtest_path}")
print(f"[v0] Saved action sequence to: {actions_path}")

print(f"\n[v0] Q-Learning training and backtesting COMPLETE!")
