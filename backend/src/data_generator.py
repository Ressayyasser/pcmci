"""
Synthetic data generator for OCP cogeneration systems.
Simulates realistic energy consumption patterns with causal relationships.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path


class OCPDataGenerator:
    """Generate realistic OCP cogeneration system data with causal relationships."""
    
    def __init__(self, seed=42, system_name="OCP_Plant_01"):
        self.seed = seed
        self.system_name = system_name
        np.random.seed(seed)
        
    def generate_dataset(self, n_samples=1000, freq='1H'):
        """
        Generate synthetic time series data for OCP cogeneration system.
        
        Variables:
        - Ambient_Temp: Ambient temperature (°C)
        - Grid_Demand: Electricity demand from grid (MW)
        - Gas_Flow: Natural gas flow rate (m³/h)
        - Heat_Demand: Industrial heat demand (MWth)
        - CHP_Output_Elec: CHP electrical output (MW)
        - CHP_Output_Heat: CHP thermal output (MWth)
        - Boiler_Output: Backup boiler thermal output (MWth)
        - Grid_Export: Electricity exported to grid (MW)
        - Fuel_Efficiency: System efficiency ratio (%)
        - Maintenance_Flag: Maintenance activity (binary)
        - Equipment_Anomaly: Equipment malfunction (binary)
        """
        
        # Create time index
        start_date = datetime(2023, 1, 1)
        dates = pd.date_range(start=start_date, periods=n_samples, freq=freq)
        
        df = pd.DataFrame(index=dates)
        df.index.name = 'timestamp'
        
        # 1. Ambient temperature (seasonal pattern + noise)
        t = np.arange(n_samples)
        ambient_temp = 15 + 10 * np.sin(2 * np.pi * t / 8760) + np.random.normal(0, 2, n_samples)
        df['Ambient_Temp'] = ambient_temp
        
        # 2. Grid demand (daily + weekly pattern + noise)
        grid_demand_base = 50 + 20 * np.sin(2 * np.pi * (t % 24) / 24)
        grid_demand_weekly = 10 * np.sin(2 * np.pi * (t % 168) / 168)
        grid_demand = grid_demand_base + grid_demand_weekly + np.random.normal(0, 2, n_samples)
        df['Grid_Demand'] = np.clip(grid_demand, 10, 100)
        
        # 3. Gas flow (main driver - causally influences CHP output)
        gas_flow_base = 40 + 0.3 * df['Grid_Demand'].values + np.random.normal(0, 1.5, n_samples)
        df['Gas_Flow'] = np.clip(gas_flow_base, 15, 80)
        
        # 4. Heat demand (seasonal + temperature dependent)
        heat_demand = 25 - 0.5 * (df['Ambient_Temp'].values - 15) + np.random.normal(0, 2, n_samples)
        df['Heat_Demand'] = np.clip(heat_demand, 5, 50)
        
        # 5. CHP electrical output (directly caused by gas flow)
        chp_elec = 0.6 * df['Gas_Flow'].values + np.random.normal(0, 1, n_samples)
        df['CHP_Output_Elec'] = np.clip(chp_elec, 5, 50)
        
        # 6. CHP thermal output (from gas combustion + ambient temp effect)
        chp_heat = 0.4 * df['Gas_Flow'].values - 0.2 * (df['Ambient_Temp'].values - 15) + np.random.normal(0, 1, n_samples)
        df['CHP_Output_Heat'] = np.clip(chp_heat, 3, 35)
        
        # 7. Boiler output (covers deficit in heat demand)
        heat_deficit = df['Heat_Demand'].values - df['CHP_Output_Heat'].values
        boiler_output = np.maximum(heat_deficit, 0) + np.random.normal(0, 0.5, n_samples)
        df['Boiler_Output'] = np.clip(boiler_output, 0, 20)
        
        # 8. Grid export (excess production)
        grid_export = df['CHP_Output_Elec'].values - df['Grid_Demand'].values
        df['Grid_Export'] = np.clip(grid_export, -10, 20)
        
        # 9. Fuel efficiency
        total_output_thermal = df['CHP_Output_Heat'].values + df['Boiler_Output'].values
        total_output_elec = df['CHP_Output_Elec'].values
        efficiency = 100 * (total_output_thermal + total_output_elec) / (df['Gas_Flow'].values * 0.01)
        df['Fuel_Efficiency'] = np.clip(efficiency, 60, 95)
        
        # 10. Maintenance flag (random low frequency events)
        df['Maintenance_Flag'] = np.random.binomial(1, 0.01, n_samples)
        
        # 11. Equipment anomaly (rare events, partially caused by high gas flow + ambient stress)
        anomaly_prob = 0.005 + 0.001 * (df['Gas_Flow'].values > df['Gas_Flow'].quantile(0.75))
        df['Equipment_Anomaly'] = np.random.binomial(1, anomaly_prob)
        
        # Add some anomalies manually for testing
        anomaly_indices = np.random.choice(n_samples, size=int(n_samples * 0.02), replace=False)
        for idx in anomaly_indices:
            if np.random.random() > 0.5:  # Inject 50% of anomalies
                df.loc[df.index[idx], 'Equipment_Anomaly'] = 1
                # Anomalies cause efficiency drop
                df.loc[df.index[idx], 'Fuel_Efficiency'] -= np.random.uniform(5, 15)
        
        return df
    
    def save_dataset(self, df, output_dir='./data'):
        """Save dataset to CSV."""
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        filepath = Path(output_dir) / f"{self.system_name}_data.csv"
        df.to_csv(filepath)
        print(f"Dataset saved to {filepath}")
        return filepath


def load_or_generate_data(data_path=None, n_samples=1000):
    """Load existing data or generate synthetic data."""
    if data_path and Path(data_path).exists():
        df = pd.read_csv(data_path, index_col='timestamp', parse_dates=True)
        print(f"Loaded data from {data_path}")
        return df
    else:
        print("Generating synthetic data...")
        generator = OCPDataGenerator()
        df = generator.generate_dataset(n_samples=n_samples)
        generator.save_dataset(df)
        return df


if __name__ == "__main__":
    # Generate and save sample dataset
    generator = OCPDataGenerator()
    df = generator.generate_dataset(n_samples=8760)  # 1 year hourly data
    generator.save_dataset(df)
    print(f"\nDataset shape: {df.shape}")
    print(f"\nFirst few rows:\n{df.head()}")
    print(f"\nData summary:\n{df.describe()}")
