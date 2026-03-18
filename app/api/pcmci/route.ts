import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

// Mock data for PCMCI analysis
const mockPCMCIData = {
  total_links: 55,
  significant_links: 12,
  method: 'PCMCI (Peter and Clark Momentary Conditional Independence)',
  description: 'Causal analysis using tigramite library for energy system relationships',
  links: [
    { source: 'generator_load_1', target: 'compressor_power_1', strength: 0.87, lag: 1 },
    { source: 'compressor_power_1', target: 'heater_temp_1', strength: 0.76, lag: 2 },
    { source: 'grid_frequency', target: 'generator_load_2', strength: 0.65, lag: 1 },
    { source: 'ambient_temp', target: 'heater_temp_1', strength: 0.92, lag: 0 },
    { source: 'heater_temp_1', target: 'thermal_loss', strength: 0.81, lag: 1 },
    { source: 'compressor_power_1', target: 'system_efficiency', strength: 0.73, lag: 1 },
    { source: 'generator_load_1', target: 'grid_voltage', strength: 0.68, lag: 0 },
    { source: 'system_efficiency', target: 'cost_per_kwh', strength: -0.79, lag: 1 },
    { source: 'grid_frequency', target: 'generator_speed', strength: 0.88, lag: 0 },
    { source: 'thermal_loss', target: 'ambient_temp', strength: 0.45, lag: 2 },
    { source: 'compressor_temp_1', target: 'compressor_power_1', strength: 0.72, lag: 1 },
    { source: 'generator_speed', target: 'grid_voltage', strength: 0.91, lag: 0 },
  ],
  top_10_links: [
    { source: 'ambient_temp', target: 'heater_temp_1', strength: 0.92, lag: 0 },
    { source: 'generator_speed', target: 'grid_voltage', strength: 0.91, lag: 0 },
    { source: 'generator_load_1', target: 'compressor_power_1', strength: 0.87, lag: 1 },
    { source: 'grid_frequency', target: 'generator_speed', strength: 0.88, lag: 0 },
    { source: 'heater_temp_1', target: 'thermal_loss', strength: 0.81, lag: 1 },
    { source: 'compressor_power_1', target: 'heater_temp_1', strength: 0.76, lag: 2 },
    { source: 'system_efficiency', target: 'cost_per_kwh', strength: 0.79, lag: 1 },
    { source: 'compressor_temp_1', target: 'compressor_power_1', strength: 0.72, lag: 1 },
    { source: 'compressor_power_1', target: 'system_efficiency', strength: 0.73, lag: 1 },
    { source: 'grid_frequency', target: 'generator_load_2', strength: 0.65, lag: 1 },
  ],
}

export async function GET(request: NextRequest) {
  try {
    // Try to fetch from backend if available
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    try {
      const response = await fetch(`${backendUrl}/api/pcmci`, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (e) {
      // Backend not available, use mock data
      console.log('[v0] Backend unavailable, using mock PCMCI data')
    }

    // Return mock data as fallback
    return NextResponse.json(mockPCMCIData)
  } catch (error) {
    console.error('[v0] PCMCI API error:', error)
    return NextResponse.json(mockPCMCIData)
  }
}
