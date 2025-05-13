from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# 문제 유형 설명 매핑
QUESTION_TYPE_DESCRIPTIONS = {
    "기본 정보 확인": "정보 또는 정의를 묻는 정형화된 문제",
    "빈칸 채우기": "내 핵심 개념을 빈칸으로 제시, 알맞은 단어나 개념 선택하는 문제",
    "사례/시나리오": "상황을 간단히 설명하고, 올바른 대처법이나 판단을 묻는 문제",
    "일치 여부 판단": "설명이 주어진 뒤, 관련 정보 중 올바른 것을 선택하는 문제",
    "원인-결과 연결": "현상의 원인 또는 결과를 묻는 문제",
    "우선순위/절차": "단계가 있는 절차 중, 가장 먼저 혹은 올바른 순서를 묻는 문제",
    "틀린 것 고르기": "보기 중 틀린 정보를 선택하는 문제",
    "비교/구분": "개념이나 기술을 구별하거나 비교하는 문제",
    "적용 판단": "지침/보안수칙 등을 특정 상황에 적용할 수 있는지 묻는 문제"
}


@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    question_type = data.get("question_type", "기본 정보 확인")
    domain = data.get("domain", "일반")
    num_questions = int(data.get("num_questions", 1))
    difficulty = data.get("difficulty", "중")
    include_explanation = data.get("include_explanation", True)
    output_format = data.get("output_format", "Plain Text")

    question_type_desc = QUESTION_TYPE_DESCRIPTIONS.get(question_type, "")

    # 프롬프트 구성
    prompt = f"""
다음 조건에 맞는 금융보안 문제를 생성해주세요:

1. 문제 유형: {question_type}
   - 유형 설명: {question_type_desc}
2. 도메인: {domain}
3. 난이도: {difficulty}
4. 문제 수: {num_questions}개
5. 출력 형식: {output_format}

각 문제는 5지선다로 다음 형식을 정확히 따라주세요:

[문제 형식]
- 출제 기준: [주요항목] > [세부항목] > [세세항목] 형식으로 표시
- 문제 번호와 내용 (반드시 위에서 설명한 문제 유형의 특성을 정확히 반영해야 함)
- 보기

[해답]
- 정답
{f'- 해설 (문제 유형의 특성에 맞춰 상세히 설명)' if include_explanation else ''}

문제와 해답은 "[해답]" 구분자로 구분하고, 각 문제는 "---" 구분자로 구분해주세요.
문제들은 서로 중복되지 않아야 하며, 명확하고 정확한 내용을 담고 있어야 합니다.
각 문제마다 위의 출제 기준 중에서 하나를 선택하여 반드시 명시해주세요.
특히, 선택한 문제 유형의 특성을 정확히 반영하여 문제를 출제해주세요.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "당신은 전문적인 금융보안 문제 출제자입니다."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.0,
            max_tokens=2000
        )
        result = response.choices[0].message.content
        questions = parse_response(result)
        return jsonify({"questions": questions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def parse_response(content):
    questions_and_answers = []
    raw_questions = [q.strip() for q in content.split("\n\n---\n\n") if q.strip()]
    for raw in raw_questions:
        parts = raw.split("\n\n[해답]\n")
        if len(parts) == 2:
            question = parts[0].strip()
            answer = parts[1].strip()
            questions_and_answers.append({"question": question, "answer": answer})
    return questions_and_answers


if __name__ == "__main__":
    app.run(debug=True, port=5000)
