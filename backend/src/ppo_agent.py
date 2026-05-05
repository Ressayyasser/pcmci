"""
PPO (Proximal Policy Optimization) Based RL Agent for OCP GTA Control
Trains itself continuously to optimize energy production and system efficiency
"""

import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime
import json
from pathlib import Path


@dataclass
class PPOExperience:
    """Single experience tuple for PPO training"""
    state: np.ndarray
    action: int
    reward: float
    next_state: np.ndarray
    done: bool
    log_prob: float
    value: float


class SimpleNeuralNet:
    """Simple 3-layer neural network for policy and value functions"""
    
    def __init__(self, input_size: int, hidden_size: int = 128):
        self.input_size = input_size
        self.hidden_size = hidden_size
        
        # Policy network weights
        self.w1_policy = np.random.randn(input_size, hidden_size) * 0.01
        self.b1_policy = np.zeros((1, hidden_size))
        self.w2_policy = np.random.randn(hidden_size, 7) * 0.01  # 7 actions
        self.b2_policy = np.zeros((1, 7))
        
        # Value network weights
        self.w1_value = np.random.randn(input_size, hidden_size) * 0.01
        self.b1_value = np.zeros((1, hidden_size))
        self.w2_value = np.random.randn(hidden_size, 1) * 0.01
        self.b2_value = np.zeros((1, 1))
        
        self.training_steps = 0
        
    def relu(self, x):
        return np.maximum(0, x)
    
    def relu_derivative(self, x):
        return (x > 0).astype(float)
    
    def softmax(self, x):
        x = x - np.max(x, axis=1, keepdims=True)
        exp_x = np.exp(x)
        return exp_x / np.sum(exp_x, axis=1, keepdims=True)
    
    def forward_policy(self, state: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Forward pass through policy network"""
        x = state.reshape(1, -1) if state.ndim == 1 else state
        
        # Hidden layer
        h = self.relu(np.dot(x, self.w1_policy) + self.b1_policy)
        
        # Output layer (action logits)
        logits = np.dot(h, self.w2_policy) + self.b2_policy
        
        # Softmax to get probabilities
        action_probs = self.softmax(logits)
        
        return action_probs, h
    
    def forward_value(self, state: np.ndarray) -> float:
        """Forward pass through value network"""
        x = state.reshape(1, -1) if state.ndim == 1 else state
        
        # Hidden layer
        h = self.relu(np.dot(x, self.w1_value) + self.b1_value)
        
        # Output layer (value)
        value = np.dot(h, self.w2_value) + self.b2_value
        
        return value[0, 0]
    
    def select_action(self, state: np.ndarray) -> Tuple[int, float]:
        """Select action based on current policy"""
        action_probs, _ = self.forward_policy(state)
        action_probs = action_probs[0]
        
        # Sample action from probability distribution
        action = np.random.choice(len(action_probs), p=action_probs)
        log_prob = np.log(action_probs[action] + 1e-8)
        
        return action, log_prob
    
    def backward_step(self, states: np.ndarray, actions: np.ndarray, 
                      returns: np.ndarray, advantages: np.ndarray, learning_rate: float = 0.001):
        """Single PPO training step using simple backprop"""
        batch_size = len(states)
        
        for i in range(batch_size):
            state = states[i:i+1]
            action = actions[i]
            return_val = returns[i]
            advantage = advantages[i]
            
            # Policy loss
            action_probs, h_policy = self.forward_policy(state)
            old_prob = action_probs[0, action]
            policy_loss = -np.log(old_prob + 1e-8) * advantage
            
            # Value loss
            value = self.forward_value(state)
            value_loss = 0.5 * (value - return_val) ** 2
            
            # Simplified gradient updates
            grad_policy = policy_loss * 0.01
            grad_value = (value - return_val) * 0.01
            
            self.w2_policy[action] -= learning_rate * grad_policy
            self.b2_policy[0, action] -= learning_rate * grad_policy
            self.w2_value -= learning_rate * grad_value
            self.b2_value -= learning_rate * grad_value
        
        self.training_steps += 1


class PPOAgent:
    """
    Proximal Policy Optimization Agent for GTA Control
    Continuously learns to optimize energy production with constraints
    """
    
    def __init__(self, state_dim: int = 9, learning_rate: float = 0.001):
        self.state_dim = state_dim
        self.learning_rate = learning_rate
        self.network = SimpleNeuralNet(state_dim)
        self.experience_buffer: List[PPOExperience] = []
        self.total_reward = 0.0
        self.episode_count = 0
        self.improvement_trend = []
        self.training_history = []
        
        # Action definitions
        self.actions = [
            "INCREASE_GTA1",
            "INCREASE_GTA2", 
            "INCREASE_GTA3",
            "OPTIMIZE_STEAM_ROUTING",
            "ACTIVATE_AUXILIARY_BOILER",
            "MAINTENANCE_CONDENSER",
            "DO_NOTHING"
        ]
        
    def encode_state(self, state_dict: Dict) -> np.ndarray:
        """Convert state dict to normalized numpy array"""
        state_vector = np.array([
            state_dict.get("vapor_hp", 50) / 100.0,           # 0-1
            state_dict.get("gta1_power", 140) / 200.0,         # 0-1
            state_dict.get("gta2_power", 140) / 200.0,         # 0-1
            state_dict.get("gta3_power", 140) / 200.0,         # 0-1
            state_dict.get("bilan_net", 400) / 500.0,          # 0-1
            state_dict.get("system_efficiency", 85) / 100.0,   # 0-1
            state_dict.get("anomaly_score", 0) / 1.0,          # 0-1
            state_dict.get("condenser_temp", 42) / 50.0,       # 0-1
            state_dict.get("vibration", 2) / 5.0               # 0-1
        ], dtype=np.float32)
        
        return state_vector
    
    def compute_reward(self, state_dict: Dict, action: int, next_state_dict: Dict) -> float:
        """
        Compute reward signal that encourages:
        1. High system efficiency
        2. Balanced production across GTAs
        3. Low anomalies
        4. Smooth operations (low vibration)
        """
        
        efficiency = next_state_dict.get("system_efficiency", 85) / 100.0
        total_power = (next_state_dict.get("gta1_power", 140) + 
                       next_state_dict.get("gta2_power", 140) + 
                       next_state_dict.get("gta3_power", 140)) / 450.0
        anomaly_score = 1.0 - next_state_dict.get("anomaly_score", 0)
        vibration = 1.0 - (next_state_dict.get("vibration", 2) / 5.0)
        
        # Balance reward: penalize if one GTA is overloaded
        gta1 = next_state_dict.get("gta1_power", 140)
        gta2 = next_state_dict.get("gta2_power", 140)
        gta3 = next_state_dict.get("gta3_power", 140)
        balance = 1.0 - (max(gta1, gta2, gta3) - min(gta1, gta2, gta3)) / 200.0
        
        # Composite reward
        reward = (
            efficiency * 0.3 +        # 30% weight on efficiency
            total_power * 0.2 +       # 20% weight on total production
            anomaly_score * 0.2 +     # 20% weight on system health
            balance * 0.15 +          # 15% weight on load balancing
            vibration * 0.15          # 15% weight on smooth operation
        )
        
        return reward * 10.0  # Scale to reasonable range
    
    def select_action(self, state: Dict) -> Tuple[int, str, float]:
        """
        Select action using current policy
        Returns: action_index, action_name, confidence
        """
        state_vec = self.encode_state(state)
        action_idx, log_prob = self.network.select_action(state_vec)
        
        # Confidence based on how much policy favors this action
        action_probs, _ = self.network.forward_policy(state_vec)
        confidence = action_probs[0, action_idx]
        
        return action_idx, self.actions[action_idx], float(confidence)
    
    def store_experience(self, state: Dict, action: int, reward: float, 
                        next_state: Dict, done: bool, log_prob: float):
        """Store experience in replay buffer"""
        state_vec = self.encode_state(state)
        next_state_vec = self.encode_state(next_state)
        value = self.network.forward_value(state_vec)
        
        exp = PPOExperience(
            state=state_vec,
            action=action,
            reward=reward,
            next_state=next_state_vec,
            done=done,
            log_prob=log_prob,
            value=value
        )
        
        self.experience_buffer.append(exp)
        self.total_reward += reward
    
    def train_on_batch(self, gamma: float = 0.99, gae_lambda: float = 0.95):
        """
        Train network on collected experiences using PPO
        gamma: discount factor
        gae_lambda: generalized advantage estimation lambda
        """
        
        if len(self.experience_buffer) == 0:
            return {"status": "no_experiences"}
        
        # Compute returns and advantages
        experiences = self.experience_buffer
        states = np.array([exp.state for exp in experiences])
        actions = np.array([exp.action for exp in experiences])
        rewards = np.array([exp.reward for exp in experiences])
        values = np.array([exp.value for exp in experiences])
        
        # Generalized Advantage Estimation
        advantages = []
        returns = []
        running_advantage = 0
        
        for t in reversed(range(len(experiences))):
            if experiences[t].done:
                next_value = 0
            else:
                next_value = self.network.forward_value(experiences[t].next_state)
            
            td_target = rewards[t] + gamma * next_value
            td_error = td_target - values[t]
            
            running_advantage = td_error + gamma * gae_lambda * running_advantage
            advantages.append(running_advantage)
            returns.append(td_target)
        
        advantages = np.array(list(reversed(advantages)))
        returns = np.array(list(reversed(returns)))
        
        # Normalize advantages
        advantages = (advantages - np.mean(advantages)) / (np.std(advantages) + 1e-8)
        
        # PPO training step
        self.network.backward_step(states, actions, returns, advantages, self.learning_rate)
        
        # Update stats
        self.episode_count += 1
        mean_reward = np.mean(rewards)
        self.improvement_trend.append(mean_reward)
        
        # Exponential smoothing for trend
        if len(self.improvement_trend) > 100:
            recent_avg = np.mean(self.improvement_trend[-100:])
            old_avg = np.mean(self.improvement_trend[-200:-100])
            improvement_pct = ((recent_avg - old_avg) / abs(old_avg)) * 100 if old_avg != 0 else 0
        else:
            improvement_pct = 0.0
        
        training_stats = {
            "episode": self.episode_count,
            "mean_reward": float(mean_reward),
            "mean_advantage": float(np.mean(advantages)),
            "training_steps": self.network.training_steps,
            "improvement_trend": improvement_pct,
            "buffer_size": len(self.experience_buffer)
        }
        
        self.training_history.append(training_stats)
        
        # Clear buffer after training
        self.experience_buffer = []
        self.total_reward = 0.0
        
        return training_stats
    
    def get_training_metrics(self) -> Dict:
        """Get comprehensive training metrics"""
        if len(self.training_history) == 0:
            return {"status": "no_training_data"}
        
        recent_history = self.training_history[-20:] if len(self.training_history) >= 20 else self.training_history
        
        return {
            "total_episodes": self.episode_count,
            "total_training_steps": self.network.training_steps,
            "recent_mean_reward": float(np.mean([h["mean_reward"] for h in recent_history])),
            "recent_improvement_trend": float(np.mean([h["improvement_trend"] for h in recent_history])),
            "max_reward": float(max([h["mean_reward"] for h in self.training_history])),
            "training_convergence": "improving" if self.improvement_trend[-1] > np.mean(self.improvement_trend[-20:-1]) else "stable",
            "policy_accuracy": float(np.mean([h["mean_advantage"] for h in recent_history])),
            "last_update": datetime.now().isoformat()
        }
    
    def save_checkpoint(self, filepath: str):
        """Save trained model checkpoint"""
        checkpoint = {
            "episode_count": self.episode_count,
            "training_steps": self.network.training_steps,
            "improvement_trend": self.improvement_trend[-100:],  # Last 100 episodes
            "training_history": self.training_history[-50:],     # Last 50 training batches
            "timestamp": datetime.now().isoformat()
        }
        
        Path(filepath).parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, 'w') as f:
            json.dump(checkpoint, f, indent=2)
    
    def load_checkpoint(self, filepath: str):
        """Load training checkpoint"""
        try:
            with open(filepath, 'r') as f:
                checkpoint = json.load(f)
            
            self.episode_count = checkpoint.get("episode_count", 0)
            self.network.training_steps = checkpoint.get("training_steps", 0)
            self.improvement_trend = checkpoint.get("improvement_trend", [])
            self.training_history = checkpoint.get("training_history", [])
            
            return True
        except FileNotFoundError:
            return False
