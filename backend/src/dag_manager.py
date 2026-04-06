"""
DAG Manager for PCMCI Causal Graph Visualization and Analysis
Provides interactive causal graph with temporal lags, strengths, and explanations
"""

from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from enum import Enum


class LinkSignificance(Enum):
    """Link significance levels based on p-value"""
    HIGHLY_SIGNIFICANT = "highly_significant"  # p < 0.01
    SIGNIFICANT = "significant"  # p < 0.05
    WEAK = "weak"  # p < 0.10
    MARGINAL = "marginal"  # p < 0.20


@dataclass
class CausalLink:
    """Represents a temporal causal link in PCMCI DAG"""
    source: str
    target: str
    lag: int
    strength: float  # normalized correlation/partial correlation
    p_value: float
    confidence_interval: Tuple[float, float]
    e_value: float  # robustness to unmeasured confounders (VanderWeele)
    significance: LinkSignificance
    explanation: str
    
    def to_dict(self) -> Dict:
        return {
            "source": self.source,
            "target": self.target,
            "lag": self.lag,
            "strength": float(self.strength),
            "p_value": float(self.p_value),
            "confidence_interval": [float(self.confidence_interval[0]), float(self.confidence_interval[1])],
            "e_value": float(self.e_value),
            "significance": self.significance.value,
            "explanation": self.explanation
        }


@dataclass
class DAGNode:
    """Represents a variable node in the PCMCI DAG"""
    name: str
    variable_type: str  # "state", "action", "exogenous"
    unit: str
    description: str
    temporal_lags: List[int] = None
    
    def __post_init__(self):
        if self.temporal_lags is None:
            self.temporal_lags = [0, 1, 2, 3]  # Standard lags to consider
    
    def to_dict(self) -> Dict:
        return {
            "name": self.name,
            "variable_type": self.variable_type,
            "unit": self.unit,
            "description": self.description,
            "temporal_lags": self.temporal_lags
        }


class DAGManager:
    """
    Manages PCMCI causal graphs with visualization support
    Handles multiple temporal lags, significance testing, and robustness quantification
    """
    
    def __init__(self):
        self.nodes: Dict[str, DAGNode] = {}
        self.links: List[CausalLink] = []
        self.data: Optional[pd.DataFrame] = None
        self.causal_matrix: Optional[np.ndarray] = None
        
    def add_node(self, name: str, variable_type: str, unit: str, description: str):
        """Add a node to the DAG"""
        self.nodes[name] = DAGNode(
            name=name,
            variable_type=variable_type,
            unit=unit,
            description=description
        )
    
    def add_causal_link(
        self, 
        source: str,
        target: str,
        lag: int,
        strength: float,
        p_value: float,
        confidence_interval: Tuple[float, float],
        e_value: float = None,
        explanation: str = ""
    ):
        """Add a causal link with temporal lag"""
        
        # Determine significance level
        if p_value < 0.01:
            significance = LinkSignificance.HIGHLY_SIGNIFICANT
        elif p_value < 0.05:
            significance = LinkSignificance.SIGNIFICANT
        elif p_value < 0.10:
            significance = LinkSignificance.WEAK
        else:
            significance = LinkSignificance.MARGINAL
        
        # Default e_value if not provided
        if e_value is None:
            # Estimate from p-value and strength
            e_value = abs(strength) / max(p_value, 0.001)
        
        link = CausalLink(
            source=source,
            target=target,
            lag=lag,
            strength=strength,
            p_value=p_value,
            confidence_interval=confidence_interval,
            e_value=e_value,
            significance=significance,
            explanation=explanation
        )
        
        self.links.append(link)
    
    def get_cytoscape_graph(self) -> Dict:
        """Convert DAG to Cytoscape.js compatible format for visualization"""
        elements = []
        
        # Add nodes
        for node_name, node in self.nodes.items():
            elements.append({
                "data": {
                    "id": node_name,
                    "label": node_name,
                    "type": node.variable_type,
                    "unit": node.unit,
                    "description": node.description
                },
                "classes": f"node {node.variable_type}"
            })
        
        # Add edges with temporal information
        for link in self.links:
            edge_id = f"{link.source}_t{link.lag}_{link.target}"
            elements.append({
                "data": {
                    "id": edge_id,
                    "source": link.source,
                    "target": link.target,
                    "lag": link.lag,
                    "strength": round(link.strength, 3),
                    "p_value": f"{link.p_value:.4f}",
                    "significance": link.significance.value,
                    "label": f"τ={link.lag}"
                },
                "classes": f"edge {link.significance.value}"
            })
        
        return {
            "nodes": [e for e in elements if "source" not in e["data"]],
            "edges": [e for e in elements if "source" in e["data"]]
        }
    
    def get_strongest_links(self, n: int = 10) -> List[Dict]:
        """Get the n strongest causal links"""
        sorted_links = sorted(
            self.links,
            key=lambda x: abs(x.strength),
            reverse=True
        )
        return [link.to_dict() for link in sorted_links[:n]]
    
    def get_links_for_variable(self, variable: str, direction: str = "both") -> List[Dict]:
        """Get all causal links affecting a specific variable"""
        result = []
        
        for link in self.links:
            if direction in ["both", "incoming"] and link.target == variable:
                result.append(link.to_dict())
            if direction in ["both", "outgoing"] and link.source == variable:
                result.append(link.to_dict())
        
        return result
    
    def get_causal_paths(self, source: str, target: str, max_depth: int = 3) -> List[List[Dict]]:
        """Find all causal paths from source to target variable"""
        paths = []
        
        def dfs(current: str, target_var: str, path: List[Dict], depth: int):
            if depth == 0 or current == target_var:
                if current == target_var:
                    paths.append(path)
                return
            
            for link in self.links:
                if link.source == current:
                    new_path = path + [link.to_dict()]
                    dfs(link.target, target_var, new_path, depth - 1)
        
        dfs(source, target, [], max_depth)
        return paths
    
    def get_dag_summary(self) -> Dict:
        """Get summary statistics of the DAG"""
        return {
            "num_nodes": len(self.nodes),
            "num_links": len(self.links),
            "num_significant_links": len([l for l in self.links if l.p_value < 0.05]),
            "num_highly_significant_links": len([l for l in self.links if l.p_value < 0.01]),
            "avg_strength": float(np.mean([abs(l.strength) for l in self.links])) if self.links else 0.0,
            "max_lag": max([l.lag for l in self.links]) if self.links else 0,
            "temporal_coverage": list(set([l.lag for l in self.links]))
        }
    
    def to_json(self) -> Dict:
        """Export entire DAG to JSON"""
        return {
            "nodes": [node.to_dict() for node in self.nodes.values()],
            "links": [link.to_dict() for link in self.links],
            "summary": self.get_dag_summary(),
            "cytoscape": self.get_cytoscape_graph()
        }


def create_sample_dag() -> DAGManager:
    """Create a sample PCMCI DAG for the OCP cogénération system"""
    dag = DAGManager()
    
    # Define nodes
    nodes_config = [
        ("vapeur_HP_admission", "exogenous", "t/h", "High pressure steam inlet from upstream"),
        ("GTA1_load", "state", "MW", "Generator turbine 1 electrical load"),
        ("GTA2_load", "state", "MW", "Generator turbine 2 electrical load"),
        ("GTA3_load", "state", "MW", "Generator turbine 3 electrical load"),
        ("prod_total", "state", "MW", "Total electrical production"),
        ("vapeur_MP_soutir", "state", "t/h", "Medium pressure steam extraction"),
        ("vapeur_BP_soutir", "state", "t/h", "Low pressure steam extraction"),
        ("bilan_net", "state", "MWh", "Net energy balance"),
        ("system_efficiency", "state", "%", "Overall system thermal efficiency"),
        ("anomaly_score", "state", "score", "Detected anomaly intensity"),
        ("maintenance_flag", "action", "binary", "Maintenance action flag"),
        ("condenser_temp", "state", "°C", "Condenser outlet temperature"),
    ]
    
    for name, var_type, unit, desc in nodes_config:
        dag.add_node(name, var_type, unit, desc)
    
    # Define causal links (realistic for cogénération)
    links_config = [
        ("vapeur_HP_admission", "prod_total", 0, 0.92, 0.001, (0.88, 0.96), 12.5,
         "High pressure steam directly drives turbine production"),
        ("vapeur_HP_admission", "GTA1_load", 1, 0.87, 0.002, (0.82, 0.92), 10.2,
         "HP steam with 1-month lag affects GTA1 efficiency and load"),
        ("GTA1_load", "vapeur_MP_soutir", 0, 0.76, 0.005, (0.70, 0.82), 8.1,
         "Generator operation extracts medium pressure steam"),
        ("prod_total", "bilan_net", 0, 0.81, 0.001, (0.76, 0.86), 9.8,
         "Total production directly impacts net balance"),
        ("system_efficiency", "bilan_net", 1, -0.68, 0.008, (-0.75, -0.61), 6.4,
         "Low efficiency (1-month lag) reduces net balance"),
        ("anomaly_score", "vapeur_MP_soutir", 2, 0.45, 0.045, (0.35, 0.55), 3.2,
         "Detected anomalies correlate with steam extraction issues (2-month lag)"),
        ("condenser_temp", "system_efficiency", 1, -0.71, 0.003, (-0.78, -0.64), 8.5,
         "High condenser temperature degrades efficiency (thermal feedback loop)"),
        ("maintenance_flag", "condenser_temp", 0, -0.63, 0.012, (-0.72, -0.54), 5.1,
         "Maintenance reduces condenser temperature"),
    ]
    
    for source, target, lag, strength, p_val, ci, e_val, expl in links_config:
        dag.add_causal_link(source, target, lag, strength, p_val, ci, e_val, expl)
    
    return dag
