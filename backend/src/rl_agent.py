"""Q-Learning Reinforcement Learning Agent for OCP Energy Control Optimization."""

import numpy as np
import pandas as pd
import json
from typing import Dict, List, Tuple, Optional
from pathlib import Path
from dataclasses import dataclass, asdict
import pickle


@dataclass
class RLConfig:
    """Configuration for Q-Learning agent."""
    n_states: int = 10
    n_actions: int = 5
    learning_rate: float = 0.1
    discount_factor: float = 0.95
    exploration_rate: float = 0.1
    max_episodes: int = 100
    max_steps_per_episode: int = 500
    
    def to_dict(self) -> Dict:
        return asdict(self)


class QLearningAgent:
    """Q-Learning agent for energy optimization and anomaly response."""
    
    def __init__(self, config: RLConfig):
        """Initialize Q-Learning agent."""
        self.config = config
        self.q_table = np.zeros((config.n_states, config.n_actions))
        self.episode_rewards = []
        self.state_action_visits = np.zeros((config.n_states, config.n_actions))
        self.training_history = []
        
    def state_discretization(self, value: float, min_val: float, max_val: float) -> int:
        """Discretize continuous value to state index."""
        if max_val == min_val:
            return 0
        normalized = (value - min_val) / (max_val - min_val)
        state = int(normalized * (self.config.n_states - 1))
        return max(0, min(state, self.config.n_states - 1))
    
    def select_action(self, state: int, training: bool = True) -> int:
        """Select action using epsilon-greedy strategy."""
        if training and np.random.random() < self.config.exploration_rate:
            return np.random.randint(0, self.config.n_actions)
        return np.argmax(self.q_table[state, :])
    
    def train_episode(self, states_sequence: List[int], rewards_sequence: List[float]) -> float:
        """Train agent on one episode."""
        episode_reward = 0
        
        for i in range(min(len(states_sequence) - 1, self.config.max_steps_per_episode)):
            state = states_sequence[i]
            next_state = states_sequence[i + 1]
            reward = rewards_sequence[i]
            
            # Select action
            action = self.select_action(state, training=True)
            
            # Q-Learning update: Q(s,a) = Q(s,a) + lr * (r + γ * max(Q(s',a')) - Q(s,a))
            max_next_q = np.max(self.q_table[next_state, :])
            current_q = self.q_table[state, action]
            new_q = current_q + self.config.learning_rate * (reward + self.config.discount_factor * max_next_q - current_q)
            
            self.q_table[state, action] = new_q
            self.state_action_visits[state, action] += 1
            episode_reward += reward
        
        self.episode_rewards.append(episode_reward)
        return episode_reward
    
    def evaluate_policy(self, states_sequence: List[int], rewards_sequence: List[float]) -> Dict:
        """Evaluate learned policy without exploration."""
        total_reward = 0
        action_sequence = []
        
        for i in range(min(len(states_sequence) - 1, self.config.max_steps_per_episode)):
            state = states_sequence[i]
            action = self.select_action(state, training=False)
            action_sequence.append(action)
            total_reward += rewards_sequence[i]
        
        return {
            "total_reward": total_reward,
            "average_reward": total_reward / len(action_sequence) if action_sequence else 0,
            "action_sequence": action_sequence,
            "n_steps": len(action_sequence)
        }
    
    def get_policy(self) -> np.ndarray:
        """Get greedy policy from Q-table."""
        return np.argmax(self.q_table, axis=1)
    
    def get_value_function(self) -> np.ndarray:
        """Get value function (max Q-value for each state)."""
        return np.max(self.q_table, axis=1)
    
    def save(self, filepath: Path):
        """Save agent to disk."""
        agent_data = {
            "q_table": self.q_table.tolist(),
            "config": self.config.to_dict(),
            "episode_rewards": self.episode_rewards,
            "state_action_visits": self.state_action_visits.tolist(),
            "training_history": self.training_history
        }
        
        with open(filepath, 'w') as f:
            json.dump(agent_data, f, indent=2)
    
    def load(self, filepath: Path):
        """Load agent from disk."""
        with open(filepath, 'r') as f:
            agent_data = json.load(f)
        
        self.q_table = np.array(agent_data["q_table"])
        self.episode_rewards = agent_data["episode_rewards"]
        self.state_action_visits = np.array(agent_data["state_action_visits"])
        self.training_history = agent_data["training_history"]


class EnergyOptimizer:
    """Optimize energy consumption using Q-Learning agent."""
    
    def __init__(self, agent: QLearningAgent):
        self.agent = agent
        self.optimization_results = []
    
    def compute_reward(self, 
                      current_power: float, 
                      target_power: float, 
                      anomaly_detected: bool) -> float:
        """Compute reward signal for RL agent."""
        # Penalty for deviation from target
        power_deviation = abs(current_power - target_power)
        power_reward = -0.1 * power_deviation
        
        # Penalty for anomalies
        anomaly_penalty = -10.0 if anomaly_detected else 0.0
        
        # Bonus for stable operation
        stability_bonus = 0.5
        
        return power_reward + anomaly_penalty + stability_bonus
    
    def optimize_trajectory(self, 
                           power_data: np.ndarray, 
                           anomaly_flags: np.ndarray,
                           target_power: float) -> Dict:
        """Optimize energy trajectory using learned policy."""
        
        # Discretize power data to states
        min_power = power_data.min()
        max_power = power_data.max()
        states = [self.agent.state_discretization(p, min_power, max_power) for p in power_data]
        
        # Compute rewards
        rewards = [
            self.compute_reward(power_data[i], target_power, anomaly_flags[i])
            for i in range(len(power_data))
        ]
        
        # Evaluate policy
        evaluation = self.agent.evaluate_policy(states, rewards)
        
        return {
            "optimization_reward": evaluation["total_reward"],
            "average_reward_per_step": evaluation["average_reward"],
            "actions": evaluation["action_sequence"],
            "n_steps": evaluation["n_steps"]
        }


class BacktestEngine:
    """Backtest RL control strategy on historical data."""
    
    def __init__(self, agent: QLearningAgent):
        self.agent = agent
        self.backtest_results = []
    
    def backtest(self, 
                df: pd.DataFrame,
                power_column: str,
                target_power: float,
                anomaly_column: str = "anomaly_ensemble") -> Dict:
        """Run backtest on historical data."""
        
        # Extract data
        power_data = df[power_column].values
        anomaly_flags = df[anomaly_column].values if anomaly_column in df.columns else np.zeros(len(df))
        
        # Discretize states
        min_power = power_data.min()
        max_power = power_data.max()
        states = [self.agent.state_discretization(p, min_power, max_power) for p in power_data]
        
        # Simulate control
        actions = []
        total_reward = 0
        control_signals = []
        
        for i in range(len(states) - 1):
            state = states[i]
            action = self.agent.select_action(state, training=False)
            actions.append(action)
            
            # Compute reward
            reward = self._compute_backtest_reward(
                power_data[i], target_power, action, anomaly_flags[i]
            )
            total_reward += reward
            
            # Generate control signal (0-100%)
            control_signal = (action / self.agent.config.n_actions) * 100
            control_signals.append(control_signal)
        
        # Compute metrics
        n_anomalies_handled = sum(1 for i, a in enumerate(actions) if anomaly_flags[i] and a > 0)
        
        results = {
            "total_reward": float(total_reward),
            "average_reward": float(total_reward / len(actions)) if actions else 0,
            "n_steps": len(actions),
            "unique_actions": len(set(actions)),
            "anomalies_detected": int(anomaly_flags.sum()),
            "anomalies_handled": n_anomalies_handled,
            "control_signals": control_signals,
            "action_sequence": actions,
            "policy_entropy": self._compute_policy_entropy()
        }
        
        self.backtest_results.append(results)
        return results
    
    def _compute_backtest_reward(self, 
                                power: float, 
                                target: float, 
                                action: int,
                                anomaly_flag: bool) -> float:
        """Compute reward for backtest step."""
        deviation = abs(power - target)
        deviation_penalty = -0.1 * deviation
        
        action_efficiency = -(action / 5.0) * 0.1  # Small penalty for control effort
        
        anomaly_bonus = 1.0 if (anomaly_flag and action > 0) else 0
        
        return deviation_penalty + action_efficiency + anomaly_bonus
    
    def _compute_policy_entropy(self) -> float:
        """Compute entropy of learned policy."""
        policy = self.agent.get_policy()
        action_counts = np.bincount(policy, minlength=self.agent.config.n_actions)
        probabilities = action_counts / len(policy)
        # Shannon entropy
        entropy = -np.sum(probabilities[probabilities > 0] * np.log2(probabilities[probabilities > 0]))
        return float(entropy)


def train_rl_agent(df: pd.DataFrame, 
                   power_column: str,
                   target_power: float,
                   config: Optional[RLConfig] = None) -> Tuple[QLearningAgent, Dict]:
    """Train Q-Learning agent on data."""
    
    if config is None:
        config = RLConfig()
    
    agent = QLearningAgent(config)
    power_data = df[power_column].values
    
    # Discretize to states
    min_power = power_data.min()
    max_power = power_data.max()
    states = [agent.state_discretization(p, min_power, max_power) for p in power_data]
    
    # Compute rewards
    optimizer = EnergyOptimizer(agent)
    anomaly_flags = np.zeros(len(df))
    if "anomaly_ensemble" in df.columns:
        anomaly_flags = df["anomaly_ensemble"].values
    
    rewards = [
        optimizer.compute_reward(power_data[i], target_power, bool(anomaly_flags[i]))
        for i in range(len(power_data))
    ]
    
    # Train
    for episode in range(config.max_episodes):
        episode_reward = agent.train_episode(states, rewards)
        
        if (episode + 1) % 20 == 0:
            print(f"[v0] Episode {episode + 1}/{config.max_episodes}, Reward: {episode_reward:.2f}")
    
    # Backtest
    backtester = BacktestEngine(agent)
    backtest_results = backtester.backtest(df, power_column, target_power)
    
    return agent, backtest_results
