from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import os
import re
from pathlib import Path
import csv
import io

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

# 출제기준 가이드 불러오기
def load_guide_content(domain):
    base_path = Path(__file__).parent / "guides"
    guide_files = {
        "일반": "general.md",
        "IT": "it.md",
        "법률": "law.md",
        "동향": "trend.md"
    }

    try:
        file_path = base_path / guide_files[domain]
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"❌ 가이드 로딩 오류: {str(e)}"

@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    question_type = data.get("question_type", "기본 정보 확인")
    domain = data.get("domain", "일반")
    num_questions = int(data.get("num_questions", 1))
    difficulty = data.get("difficulty", "중")
    include_explanation = data.get("include_explanation", True)
    output_format = data.get("output_format", "Plain Text")
    main_criteria = data.get("mainCriteria", "")
    sub_criteria = data.get("subCriteria", "")
    detail_criteria = data.get("detailCriteria", "")

    question_type_desc = QUESTION_TYPE_DESCRIPTIONS.get(question_type, "")
    guide_content = load_guide_content(domain)  # 🔧 도메인별 가이드 로딩

    if guide_content.startswith("❌"):
        return jsonify({"error": guide_content}), 500

    # 프롬프트 구성
    prompt = f"""
당신은 금융보안 교육용 문제를 출제하는 전문가입니다. 아래 조건에 따라 문제를 생성해주세요:
빈 배열은 절대 반환하지 마세요.

1. 문제 유형: {question_type}
   - 유형 설명: {question_type_desc}
2. 도메인: {domain}
3. 난이도: {difficulty}
4. 문제 수: {num_questions}개
5. 출력 형식: {output_format}
6. 출제기준: {main_criteria} > {sub_criteria} > {detail_criteria}

각 문제는 5지선다로 다음 형식을 정확히 따라주세요:

[문제 형식]
- 출제 기준: {main_criteria}> {sub_criteria} > {detail_criteria} 형식으로 표시
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
        print("📤 GPT 응답 원문:\n", result)
        questions = parse_response(result)

        if output_format == "CSV":
            # Create CSV data
            csv_output = io.StringIO()
            csv_writer = csv.writer(csv_output)
            csv_writer.writerow(["번호", "출제기준", "문제", "해답"])
            for idx, qa in enumerate(questions, start=1):
                csv_writer.writerow([idx, f"{main_criteria} > {sub_criteria} > {detail_criteria}", qa["question"], qa["answer"]])
            csv_output.seek(0)
            return send_file(io.BytesIO(csv_output.getvalue().encode('utf-8')), mimetype='text/csv', as_attachment=True, download_name='questions.csv')

        return jsonify({"questions": questions})
    except Exception as e:
        import traceback
        print("❌ GPT 호출 중 오류 발생:\n", traceback.format_exc())
        return jsonify({"error": str(e)}), 500


def parse_response(content):
    questions_and_answers = []
    raw_questions = re.split(r"\n-{3,}\n", content.strip())

    for raw in raw_questions:
        parts = re.split(r"\n*\[해답\]|\n*해답\n*|\n*해답:\n*", raw)
        if len(parts) == 2:
            question = parts[0].strip()
            answer = parts[1].strip()

            if not question:
                print("⚠️ 질문 누락됨:", raw[:200])
                continue

            questions_and_answers.append({
                "question": question,
                "answer": answer
            })
        else:
            print("⚠️ 파싱 실패:", raw[:200])
    return questions_and_answers

# New endpoint to download CSV file
@app.route("/download_csv", methods=["GET"])
def download_csv():
    # This endpoint can be used if CSV is pre-generated and stored
    return send_file("path_to_csv_file.csv", mimetype='text/csv', as_attachment=True, attachment_filename='questions.csv')

if __name__ == "__main__":
    app.run(debug=True, port=5000)
