import pandas as pd
import numpy as np
import networkx as nx
from sklearn.model_selection import cross_val_score, train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import ast
import warnings
import re
import os
warnings.filterwarnings('ignore')

class GraphFeatureExtractor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.is_fitted = False
        self.feature_names = None

    def parse_edgelist(self, edgelist_str):
        try:
            if isinstance(edgelist_str, str):
                try:
                    return ast.literal_eval(edgelist_str)
                except:
                    edgelist_str = edgelist_str.strip('[]')
                    if not edgelist_str:
                        return []
                    edges = []
                    edge_strings = re.split(r'\),\s*\(', edgelist_str)
                    for edge_str in edge_strings:
                        edge_str = edge_str.strip('()')
                        if edge_str:
                            parts = [part.strip() for part in edge_str.split(',')]
                            if len(parts) == 2:
                                try:
                                    edges.append((int(parts[0]), int(parts[1])))
                                except ValueError:
                                    continue
                    return edges
            elif isinstance(edgelist_str, list):
                return edgelist_str
            else:
                return []
        except Exception as e:
            print(f"Warning: Could not parse edge list: {edgelist_str}. Error: {e}")
            return []

    def extract_features(self, edgelist_str):
        edges = self.parse_edgelist(edgelist_str)
        G_directed = nx.DiGraph()
        G_directed.add_edges_from(edges)
        G_undirected = nx.Graph()
        G_undirected.add_edges_from(edges)
        features = {}
        features['num_nodes'] = G_directed.number_of_nodes()
        features['num_edges'] = G_directed.number_of_edges()
        features['density'] = nx.density(G_directed) if G_directed.number_of_nodes() > 1 else 0
        if G_directed.number_of_nodes() > 0:
            in_degrees = dict(G_directed.in_degree())
            out_degrees = dict(G_directed.out_degree())
            in_vals = list(in_degrees.values())
            out_vals = list(out_degrees.values())
            features['avg_in_degree'] = np.mean(in_vals) if in_vals else 0
            features['avg_out_degree'] = np.mean(out_vals) if out_vals else 0
            features['max_in_degree'] = max(in_vals) if in_vals else 0
            features['max_out_degree'] = max(out_vals) if out_vals else 0
            features['std_in_degree'] = np.std(in_vals) if len(in_vals) > 1 else 0
            features['std_out_degree'] = np.std(out_vals) if len(out_vals) > 1 else 0
        else:
            for key in ['avg_in_degree','avg_out_degree','max_in_degree','max_out_degree','std_in_degree','std_out_degree']:
                features[key] = 0
        try:
            features['is_weakly_connected'] = int(nx.is_weakly_connected(G_directed))
            features['num_weakly_connected_components'] = nx.number_weakly_connected_components(G_directed)
        except:
            features['is_weakly_connected'] = 0
            features['num_weakly_connected_components'] = 0
        try:
            features['is_strongly_connected'] = int(nx.is_strongly_connected(G_directed))
            features['num_strongly_connected_components'] = nx.number_strongly_connected_components(G_directed)
        except:
            features['is_strongly_connected'] = 0
            features['num_strongly_connected_components'] = 0
        try:
            features['has_cycle'] = 0 if nx.is_directed_acyclic_graph(G_directed) else 1
        except:
            features['has_cycle'] = 1
        features['is_tree'] = int(nx.is_tree(G_undirected))
        features['is_forest'] = int(nx.is_forest(G_undirected))
        features['is_dag'] = int(nx.is_directed_acyclic_graph(G_directed))
        try:
            if features['is_dag']:
                topo = list(nx.topological_generations(G_directed))
                features['num_topo_levels'] = len(topo)
                features['max_topo_level_size'] = max(len(level) for level in topo)
            else:
                features['num_topo_levels'] = 0
                features['max_topo_level_size'] = 0
        except:
            features['num_topo_levels'] = 0
            features['max_topo_level_size'] = 0
        try:
            features['avg_clustering'] = nx.average_clustering(G_undirected)
        except:
            features['avg_clustering'] = 0
        features['has_self_loops'] = int(any(u == v for u, v in G_directed.edges()))
        try:
            features['reciprocity'] = nx.reciprocity(G_directed) if G_directed.number_of_edges() > 0 else 0
        except:
            features['reciprocity'] = 0
        if self.feature_names is None:
            self.feature_names = sorted(features.keys())
        return [features[name] for name in self.feature_names]

    def fit_transform(self, edgelist_series):
        features = [self.extract_features(e) for e in edgelist_series]
        features = np.nan_to_num(np.array(features), nan=0.0, posinf=1e6, neginf=-1e6)
        scaled = self.scaler.fit_transform(features)
        self.is_fitted = True
        return scaled

    def transform(self, edgelist_series):
        if not self.is_fitted:
            raise ValueError("Feature extractor must be fitted before transform")
        features = [self.extract_features(e) for e in edgelist_series]
        features = np.nan_to_num(np.array(features), nan=0.0, posinf=1e6, neginf=-1e6)
        return self.scaler.transform(features)

def load_data():
    train_file = "train_data.csv"
    val_file = "validation_data.csv"
    try:
        print("Loading training data...")
        train_df = pd.read_csv(train_file)
        print(f"Training data loaded: {len(train_df)} samples")
    except Exception as e:
        print(f"Error loading training data: {e}")
        return None, None
    if val_file and os.path.exists(val_file):
        try:
            print("Loading validation data...")
            val_df = pd.read_csv(val_file)
            print(f"Validation data loaded: {len(val_df)} samples")
            return train_df, val_df
        except Exception as e:
            print(f"Error loading validation data: {e}")
            return train_df, None
    else:
        print(f"Validation file '{val_file}' not found. Using train-test split.")
        return train_df, None

def train_models(X_train, y_train, X_val=None, y_val=None):
    models = {
        'Random Forest': RandomForestClassifier(random_state=42, n_jobs=-1),
        'Gradient Boosting': GradientBoostingClassifier(random_state=42),
        'SVM': SVC(kernel='rbf', random_state=42, probability=True)
    }
    param_grids = {
        'Random Forest': {
            'n_estimators': [100, 200],
            'max_depth': [10, 20, None],
            'min_samples_split': [2, 5],
        },
        'Gradient Boosting': {
            'n_estimators': [100, 200],
            'learning_rate': [0.1, 0.15],
            'max_depth': [3, 5],
        },
        'SVM': {
            'C': [1, 10, 100],
            'gamma': ['scale', 'auto']
        }
    }
    best_models = {}
    best_scores = {}
    for name, model in models.items():
        print(f"\nTraining {name}...")
        try:
            grid = GridSearchCV(model, param_grids[name], cv=3, scoring='accuracy', n_jobs=-1 if name != 'SVM' else 1, verbose=1)
            grid.fit(X_train, y_train)
            best_models[name] = grid.best_estimator_
            best_scores[name] = grid.best_score_
            print(f"Best {name} CV Score: {grid.best_score_:.4f}")
            print(f"Best parameters: {grid.best_params_}")
            if X_val is not None and y_val is not None:
                val_score = grid.best_estimator_.score(X_val, y_val)
                print(f"Validation Score: {val_score:.4f}")
                y_pred = grid.best_estimator_.predict(X_val)
                print("\nClassification Report:")
                print(classification_report(y_val, y_pred, target_names=['Tree', 'Cyclic', 'DAG']))
        except Exception as e:
            print(f"Error training {name}: {e}")
    if not best_models:
        raise ValueError("No models were successfully trained!")
    if best_scores:
        try:
            best_model_name = max(best_scores, key=best_scores.get)
            print(f"\nBest model: {best_model_name} with CV score: {best_scores[best_model_name]:.4f}")
            return best_models[best_model_name], best_model_name
        except Exception as e:
            print(f"Error selecting best model: {e}")
            raise e
    else:
        raise ValueError("All models failed to produce valid scores.")

def save_model(model, feature_extractor, model_name):
    try:
        filename = f'graph_classifier_{model_name.lower().replace(" ", "_")}.pkl'
        joblib.dump(model, filename)
        joblib.dump(feature_extractor, 'feature_extractor.pkl')
        print(f"Model saved as {filename}")
        return filename
    except Exception as e:
        print(f"Error saving model: {e}")
        return None

def main():
    train_df, val_df = load_data()
    if train_df is None:
        print("Training data load failed.")
        return
    if 'edgelist' not in train_df or 'label' not in train_df:
        print("'edgelist' and 'label' columns required.")
        return
    feature_extractor = GraphFeatureExtractor()
    try:
        X_train = feature_extractor.fit_transform(train_df['edgelist'])
        y_train = train_df['label'].values
        if val_df is not None and 'edgelist' in val_df and 'label' in val_df:
            X_val = feature_extractor.transform(val_df['edgelist'])
            y_val = val_df['label'].values
        else:
            print("No validation data found. Performing train-test split.")
            X_train, X_val, y_train, y_val = train_test_split(X_train, y_train, test_size=0.2, random_state=42, stratify=y_train)
        best_model, model_name = train_models(X_train, y_train, X_val, y_val)
        model_file = save_model(best_model, feature_extractor, model_name)
        print("\nFinal Validation Performance:")
        y_pred = best_model.predict(X_val)
        print(classification_report(y_val, y_pred, target_names=['Tree', 'Cyclic', 'DAG']))
        print("\nConfusion Matrix:")
        print(confusion_matrix(y_val, y_pred))
        if hasattr(best_model, 'feature_importances_'):
            print("\nTop 10 Important Features:")
            importances = best_model.feature_importances_
            indices = np.argsort(importances)[::-1][:10]
            for i, idx in enumerate(indices):
                print(f"{i+1}. {feature_extractor.feature_names[idx]}: {importances[idx]:.4f}")
    except Exception as e:
        print(f"Pipeline error: {e}")

if __name__ == "__main__":
    main()
