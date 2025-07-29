import re
from spellchecker import SpellChecker
from sentence_transformers import SentenceTransformer, util

spell = SpellChecker()
model = SentenceTransformer("all-MiniLM-L6-v2")

graph_types = {
    "cyclic": ["cyclic graph", "circular graph", "looped graph"],
    "tree": ["tree", "acyclic connected graph"],
    "dag": ["directed acyclic graph", "dag"],
    "complete": ["complete graph", "fully connected"],
    "bipartite": ["bipartite graph", "two set graph"],
}

# Flatten all phrases
corpus = [p for phrases in graph_types.values() for p in phrases]
corpus_embeddings = model.encode(corpus, convert_to_tensor=True)

def preprocess(text):
    text = re.sub(r"(\d+)([a-zA-Z]+)", r"\1 \2", text)
    text = re.sub(r"([a-zA-Z]+)(\d+)", r"\1 \2", text)
    corrected_words = [spell.correction(w) for w in text.split()]
    # Filter out None or empty strings if any
    corrected_words = [w for w in corrected_words if w]
    corrected = " ".join(corrected_words)
    return corrected.lower()

def classify_type(user_input):
    processed = preprocess(user_input)
    input_embedding = model.encode(processed, convert_to_tensor=True)
    hits = util.semantic_search(input_embedding, corpus_embeddings, top_k=1)
    match_idx = hits[0][0]["corpus_id"]
    matched_phrase = corpus[int(match_idx)]
    for gtype, phrases in graph_types.items():
        if matched_phrase in phrases:
            return gtype
    return "unknown"

def parse_node_count(text):
    match = re.search(r"(\d+)\s*nodes?", text)
    if match:
        return int(match.group(1))
    return None

def parse_text_to_graph(text):
    text = preprocess(text)
    gtype = classify_type(text)
    n = parse_node_count(text) or 5

    def label(i):
        if i < 26:
            return chr(65 + i)
        else:
            return f"N{i}"

    nodes = [{"id": str(i), "label": label(i)} for i in range(n)]

    edges = []
    if gtype == "cyclic":
        edges = [{"source": str(i), "target": str((i + 1) % n)} for i in range(n)]
    elif gtype == "tree":
        for i in range(1, n):
            edges.append({"source": str((i - 1) // 2), "target": str(i)})
    elif gtype == "complete":
        for i in range(n):
            for j in range(i + 1, n):
                edges.append({"source": str(i), "target": str(j)})
    elif gtype == "dag":
        for i in range(n):
            for j in range(i + 1, n):
                edges.append({"source": str(i), "target": str(j)})
    elif gtype == "bipartite":
        part1 = n // 2
        part2 = n - part1
        nodes = [{"id": str(i), "label": label(i)} for i in range(part1 + part2)]
        for i in range(part1):
            for j in range(part1, part1 + part2):
                edges.append({"source": str(i), "target": str(j)})
    else:
        edges = []

    return nodes, edges
