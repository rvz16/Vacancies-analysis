import requests
import json
import time

all_vacancies = []

for page in range(20):
    print(f"Parsing page number {page + 1}")
    url = f"https://api.hh.ru/vacancies?text=Python&per_page=50&page={page}"
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"Ошибка {response.status_code} на странице {page}")
        continue
    
    data = response.json()
    for item in data['items']:
        vacancy_id = item['id']

        detail_url = f"https://api.hh.ru/vacancies/{vacancy_id}"
        vacancy_resp = requests.get(detail_url)
        if vacancy_resp.status_code != 200:
            print(f"Ошибка при получении вакансии {vacancy_id}")
            continue
        
        vacancy_data = vacancy_resp.json()

        full_info = {
            "id": vacancy_data.get("id"),
            "name": vacancy_data.get("name"),
            "description": vacancy_data.get("description"),
            "key_skills": [skill["name"] for skill in vacancy_data.get("key_skills", [])],
            "experience": vacancy_data.get("experience", {}).get("name"),
            "employment": vacancy_data.get("employment", {}).get("name"),
            "schedule": vacancy_data.get("schedule", {}).get("name"),
            "salary": vacancy_data.get("salary"),
            "area": vacancy_data.get("area", {}).get("name"),
            "employer": vacancy_data.get("employer", {}).get("name"),
            "published_at": vacancy_data.get("published_at")
        }

        all_vacancies.append(full_info)

        # Pause between requests to do not get banned
        time.sleep(0.2)

with open("vacancies_full.json", "w", encoding="utf-8") as f:
    json.dump(all_vacancies, f, ensure_ascii=False, indent=4)

print("✅ Сохранено", len(all_vacancies), "полных вакансий в 'vacancies_full.json'")
