from flask import Flask, render_template, request, jsonify
import time
import json
from collections import Counter

app = Flask(__name__)

with open("vacancies_full.json", encoding="utf-8") as f:
    data = json.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route("/data")
def get_data():
    all_skills = [skill for v in data for skill in v.get("key_skills", [])]
    skill_counts = Counter(all_skills)

    # Threshold for skill's appearance in list of jobs
    min_skill_threshold = 5
    filtered_skills = [
        {"name": s, "count": c}
        for s, c in skill_counts.items()
        if c >= min_skill_threshold
    ]

    experience_counts = Counter([v.get("experience") for v in data if v.get("experience")])
    schedule_counts = Counter([v.get("schedule") for v in data if v.get("schedule")])

    return jsonify({
        "skills": filtered_skills,
        "experience": [{"name": e, "count": c} for e, c in experience_counts.items()],
        "schedule": [{"name": s, "count": c} for s, c in schedule_counts.items()]
    })


if __name__ == "__main__":
    app.run(debug=True)