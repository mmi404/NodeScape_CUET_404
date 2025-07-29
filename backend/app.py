from flask import Flask, request, jsonify
from flask_cors import CORS
from parser import parse_text_to_graph
from graph_classifier import GraphFeatureExtractor 
import pickle
import pandas as pd
import joblib
import os
import numpy as np

app = Flask(__name__)
CORS(app)

# Load model and feature extractor
try:
    clf = joblib.load("graph_classifier_random_forest.pkl")
    if os.path.exists("feature_extractor.pkl"):
        feature_extractor = joblib.load("feature_extractor.pkl")
    else:
        feature_extractor = GraphFeatureExtractor()
except FileNotFoundError:
    print("Model files not found. Please train the model first.")
    clf = None
    feature_extractor = GraphFeatureExtractor()

@app.route("/parse-graph", methods=["POST"])
def parse_graph():
    data = request.get_json()
    text = data.get("text", "")
    nodes, edges = parse_text_to_graph(text)
    return jsonify({"nodes": nodes, "edges": edges})

@app.route("/classify-graph", methods=["POST"])
def classify_graph():
    data = request.get_json()
    edges = data.get("edges", [])

    if not edges:
        return jsonify({"error": "No edges provided"}), 400

    try:
        # Validate and normalize edges
        edge_list = []
        for edge in edges:
            if isinstance(edge, (list, tuple)) and len(edge) == 2:
                edge_list.append((str(edge[0]), str(edge[1])))
            else:
                return jsonify({"error": "Invalid edge format. Expected [source, target] pairs."}), 400
        
        if not edge_list:
            return jsonify({"error": "No valid edges found"}), 400

        # Extract features using GraphFeatureExtractor
        temp_extractor = GraphFeatureExtractor()
        features_list = temp_extractor.extract_features(edge_list)
        features_array = np.array([features_list]).reshape(1, -1)
        
        # Create features dict for response
        feature_names = temp_extractor.feature_names or [f'feature_{i}' for i in range(len(features_list))]
        features = dict(zip(feature_names, features_list))

        # Make sure model is loaded
        global clf
        if clf is None:
            clf = joblib.load("graph_classifier_random_forest.pkl")

        # Predict class and confidence
        prediction = clf.predict(features_array)[0]
        confidence = clf.predict_proba(features_array)[0].max()

        return jsonify({
            "prediction": int(prediction),
            "confidence": float(confidence),
            "features": features
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
