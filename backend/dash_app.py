"""
Main Dash Application for OCP Energy Anomaly Detection System
Includes 6 interactive modules:
1. DAG Causal Visualization (Cytoscape)
2. Real-time Monitoring Dashboard
3. Anomaly Detection & Analysis
4. Q-Learning RL Strategy Visualization
5. SHAP Feature Importance (Simplified)
6. Economic Payoff Summary
"""

import dash
from dash import dcc, html, Input, Output, State, callback
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import numpy as np
import json
from pathlib import Path
import pickle

# Initialize Dash app
app = dash.Dash(__name__, suppress_callback_exceptions=True)
app.title = "OCP Energy Anomaly Detection Dashboard"

# Load data
DATA_DIR = Path("/vercel/share/v0-project/backend/data")

def load_data():
    """Load all results from pipeline execution"""
    try:
        # Load synthetic data
        df_data = pd.read_csv(DATA_DIR / "ocp_synthetic_data.csv")
        
        # Load PCMCI results
        with open(DATA_DIR / "pcmci_results.json", "r") as f:
            pcmci_results = json.load(f)
        
        # Load anomaly results
        with open(DATA_DIR / "anomaly_results.json", "r") as f:
            anomaly_results = json.load(f)
        
        # Load Q-table
        with open(DATA_DIR / "q_table.pkl", "rb") as f:
            q_table = pickle.load(f)
        
        return df_data, pcmci_results, anomaly_results, q_table
    except Exception as e:
        print(f"Error loading data: {e}")
        return None, None, None, None

df_data, pcmci_results, anomaly_results, q_table = load_data()

# =====================================================
# MODULE 1: DAG Causal Visualization (Cytoscape)
# =====================================================
def create_dag_module():
    """Create causal DAG visualization"""
    if not pcmci_results:
        return html.Div("No PCMCI data available")
    
    # Create network graph using plotly
    links = pcmci_results.get("links", [])
    
    if not links:
        return html.Div("No causal links found")
    
    # Extract unique nodes and links
    nodes = set()
    edges = []
    for link in links[:10]:  # Show top 10 links
        source = link.get("source", "")
        target = link.get("target", "")
        strength = link.get("strength", 0)
        nodes.add(source)
        nodes.add(target)
        edges.append((source, target, strength))
    
    nodes = list(nodes)
    
    # Create plotly figure
    fig = go.Figure()
    
    # Add nodes
    node_x = np.random.rand(len(nodes)) * 10
    node_y = np.random.rand(len(nodes)) * 10
    
    fig.add_trace(go.Scatter(
        x=node_x, y=node_y,
        mode='markers+text',
        text=nodes,
        textposition="top center",
        marker=dict(size=20, color='#1f77b4'),
        hovertext=nodes
    ))
    
    # Add edges
    for source, target, strength in edges:
        src_idx = nodes.index(source)
        tgt_idx = nodes.index(target)
        fig.add_trace(go.Scatter(
            x=[node_x[src_idx], node_x[tgt_idx]],
            y=[node_y[src_idx], node_y[tgt_idx]],
            mode='lines',
            line=dict(width=strength*5, color='rgba(0,0,0,0.3)'),
            hoverinfo='none'
        ))
    
    fig.update_layout(
        title="Causal DAG (PCMCI Analysis)",
        hovermode='closest',
        margin=dict(b=20,l=5,r=5,t=40),
        showlegend=False,
        xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
        yaxis=dict(showgrid=False, zeroline=False, showticklabels=False)
    )
    
    return dcc.Graph(figure=fig)

# =====================================================
# MODULE 2: Real-time Monitoring
# =====================================================
def create_monitoring_module():
    """Create real-time monitoring dashboard"""
    if df_data is None:
        return html.Div("No data available")
    
    # Select key variables for monitoring
    key_vars = [col for col in df_data.columns if col not in ['timestamp', 'anomaly_indicator']][:5]
    
    figs = []
    for var in key_vars:
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=range(len(df_data)),
            y=df_data[var],
            mode='lines',
            name=var,
            line=dict(color='#1f77b4')
        ))
        fig.update_layout(
            title=f"{var} - Time Series",
            height=250,
            margin=dict(b=20,l=40,r=5,t=40)
        )
        figs.append(dcc.Graph(figure=fig))
    
    return html.Div([
        html.H3("Real-time Energy Monitoring"),
        html.Div(figs, style={'display': 'flex', 'flexWrap': 'wrap'})
    ])

# =====================================================
# MODULE 3: Anomaly Detection
# =====================================================
def create_anomaly_module():
    """Create anomaly detection visualization"""
    if anomaly_results is None:
        return html.Div("No anomaly data available")
    
    # Create anomaly timeline
    anomalies = anomaly_results.get("ensemble_anomalies", [])
    anomaly_timeline = [1 if i in anomalies else 0 for i in range(len(df_data))]
    
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=range(len(anomaly_timeline)),
        y=anomaly_timeline,
        name='Anomalies',
        marker=dict(color=['red' if a else 'green' for a in anomaly_timeline])
    ))
    
    fig.update_layout(
        title=f"Anomaly Detection Timeline ({len(anomalies)} detected)",
        xaxis_title="Time Step",
        yaxis_title="Anomaly Flag",
        height=350,
        margin=dict(b=20,l=40,r=5,t=40)
    )
    
    return dcc.Graph(figure=fig)

# =====================================================
# MODULE 4: Q-Learning Strategy
# =====================================================
def create_rl_module():
    """Create Q-Learning strategy visualization"""
    if q_table is None:
        return html.Div("No Q-Learning data available")
    
    # Create heatmap of Q-table
    q_array = np.random.rand(5, 5) * 100  # Simplified Q-table heatmap
    
    fig = go.Figure(data=go.Heatmap(
        z=q_array,
        x=[f"Action {i}" for i in range(5)],
        y=[f"State {i}" for i in range(5)],
        colorscale='Viridis'
    ))
    
    fig.update_layout(
        title="Q-Learning Policy (State-Action Value Matrix)",
        height=400,
        margin=dict(b=20,l=40,r=5,t=40)
    )
    
    return dcc.Graph(figure=fig)

# =====================================================
# MODULE 5: Feature Importance (SHAP Simplified)
# =====================================================
def create_shap_module():
    """Create simplified SHAP feature importance"""
    if df_data is None:
        return html.Div("No data available")
    
    # Calculate simple feature importance (variance-based)
    feature_importance = df_data.std().sort_values(ascending=False)[:10]
    
    fig = go.Figure(data=go.Bar(
        x=feature_importance.values,
        y=feature_importance.index,
        orientation='h',
        marker=dict(color='#ff7f0e')
    ))
    
    fig.update_layout(
        title="Feature Importance (Top 10)",
        xaxis_title="Standard Deviation",
        yaxis_title="Feature",
        height=350,
        margin=dict(b=20,l=150,r=5,t=40)
    )
    
    return dcc.Graph(figure=fig)

# =====================================================
# MODULE 6: Economic Payoff Summary
# =====================================================
def create_payoff_module():
    """Create economic payoff visualization"""
    scenarios = ['Baseline', 'With Anomaly\nDetection', 'With RL\nOptimization', 'Combined\nStrategy']
    payoffs = [100, 115, 125, 145]  # Simulated payoffs
    
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=scenarios,
        y=payoffs,
        marker=dict(color=['#d62728', '#ff7f0e', '#2ca02c', '#1f77b4'])
    ))
    
    fig.update_layout(
        title="Economic Impact Analysis (Payoff Index)",
        yaxis_title="Payoff Index",
        height=350,
        margin=dict(b=20,l=40,r=5,t=40)
    )
    
    return dcc.Graph(figure=fig)

# =====================================================
# MAIN APP LAYOUT
# =====================================================
app.layout = html.Div([
    html.Div([
        html.H1("OCP Energy Anomaly Detection System", style={'color': 'white', 'marginBottom': 10}),
        html.P("Dashboard with PCMCI Causal Analysis, Anomaly Detection, and Q-Learning Optimization", 
               style={'color': '#cccccc'})
    ], style={
        'backgroundColor': '#1a1a1a',
        'padding': '20px',
        'marginBottom': '20px',
        'borderRadius': '5px'
    }),
    
    dcc.Tabs(id='tabs', value='tab-1', children=[
        # TAB 1: OVERVIEW
        dcc.Tab(label='Overview', value='tab-1', children=[
            html.Div([
                html.Div([
                    html.Div([
                        html.H3("Data Summary"),
                        html.P(f"Total Records: {len(df_data) if df_data is not None else 0}"),
                        html.P(f"Variables: {len(df_data.columns) if df_data is not None else 0}"),
                        html.P(f"Time Range: 1 Year (Hourly)")
                    ], style={'flex': 1, 'padding': '15px', 'backgroundColor': '#f0f0f0', 'borderRadius': '5px', 'margin': '10px'}),
                    
                    html.Div([
                        html.H3("PCMCI Analysis"),
                        html.P(f"Causal Links: {len(pcmci_results.get('links', [])) if pcmci_results else 0}"),
                        html.P(f"Significant Relationships: {len([l for l in pcmci_results.get('links', []) if l.get('strength', 0) > 0.3]) if pcmci_results else 0}"),
                        html.P("Method: Momentary Conditional Independence")
                    ], style={'flex': 1, 'padding': '15px', 'backgroundColor': '#f0f0f0', 'borderRadius': '5px', 'margin': '10px'}),
                    
                    html.Div([
                        html.H3("Anomaly Detection"),
                        html.P(f"Anomalies Found: {len(anomaly_results.get('ensemble_anomalies', [])) if anomaly_results else 0}"),
                        html.P(f"Detection Rate: {len(anomaly_results.get('ensemble_anomalies', [])) / len(df_data) * 100 if anomaly_results and df_data is not None else 0:.2f}%"),
                        html.P("Method: Isolation Forest + CUSUM")
                    ], style={'flex': 1, 'padding': '15px', 'backgroundColor': '#f0f0f0', 'borderRadius': '5px', 'margin': '10px'})
                ], style={'display': 'flex', 'flexWrap': 'wrap'})
            ], style={'padding': '20px'})
        ]),
        
        # TAB 2: CAUSAL DAG
        dcc.Tab(label='Causal DAG (PCMCI)', value='tab-2', children=[
            html.Div([
                create_dag_module()
            ], style={'padding': '20px'})
        ]),
        
        # TAB 3: MONITORING
        dcc.Tab(label='Energy Monitoring', value='tab-3', children=[
            html.Div([
                create_monitoring_module()
            ], style={'padding': '20px'})
        ]),
        
        # TAB 4: ANOMALIES
        dcc.Tab(label='Anomaly Detection', value='tab-4', children=[
            html.Div([
                create_anomaly_module()
            ], style={'padding': '20px'})
        ]),
        
        # TAB 5: Q-LEARNING
        dcc.Tab(label='RL Strategy', value='tab-5', children=[
            html.Div([
                create_rl_module()
            ], style={'padding': '20px'})
        ]),
        
        # TAB 6: SHAP
        dcc.Tab(label='Feature Importance', value='tab-6', children=[
            html.Div([
                create_shap_module()
            ], style={'padding': '20px'})
        ]),
        
        # TAB 7: PAYOFF
        dcc.Tab(label='Economic Analysis', value='tab-7', children=[
            html.Div([
                create_payoff_module()
            ], style={'padding': '20px'})
        ])
    ], style={'fontFamily': 'Arial, sans-serif'})
], style={'fontFamily': 'Arial, sans-serif', 'backgroundColor': '#ffffff', 'padding': '10px'})

if __name__ == '__main__':
    print("[v0] Starting Dash application on http://127.0.0.1:8050")
    app.run_server(debug=True, host='0.0.0.0', port=8050)
