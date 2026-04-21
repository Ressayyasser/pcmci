import { PageHeader } from '@/components/page-header'
import { PPOTrainingDashboard } from '@/components/ppo-training-dashboard'

export const metadata = {
  title: 'PPO Agent Training | OCP Dashboard',
  description: 'Monitor and train the Proximal Policy Optimization RL agent for optimal GTA control',
}

export default function PPOTrainingPage() {
  return (
    <div>
      <PageHeader
        title="PPO Agent Training"
        description="Proximal Policy Optimization - Real-time RL agent learning and optimization"
      />

      <main className="max-w-7xl mx-auto px-8 py-16 w-full">
        <PPOTrainingDashboard />
      </main>
    </div>
  )
}
