// src/app/quizmaker/page.tsx

'use client';

import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import isPropValid from '@emotion/is-prop-valid';

// 🎨 Emotion 스타일 정의
const SectionWrapper = styled.div`
  max-width: 768px;
  margin: 0 auto;
  padding: 2.5rem 1rem;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  color: #27272a;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #52525b;
  margin-bottom: 0.25rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d4d4d8;
  border-radius: 0.5rem;
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const SubmitButton = styled('button', {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== 'loading',
})<{ loading: boolean }>`
  width: 100%;
  margin-top: 1.5rem;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  color: white;
  font-weight: 600;
  background-color: ${({ loading }) => (loading ? '#a1a1aa' : '#4f46e5')};
  cursor: ${({ loading }) => (loading ? 'not-allowed' : 'pointer')};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ loading }) => (loading ? '#a1a1aa' : '#4338ca')};
  }
`;

const ProgressWrapper = styled.div`
  width: 100%;
  background-color: #f0f8ff;
  border-radius: 9999px;
  height: 0.5rem;
  margin-top: 1.5rem;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ width: number }>`
  background-color: #87cefa;
  height: 100%;
  transition: width 1s ease;
  width: ${({ width }) => width}%;
`;

const QuestionSection = styled.div`
  margin-top: 2rem;
`;

const QuestionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  color: #27272a;
`;

const QuestionList = styled.ul`
  margin-top: 1rem;
  padding-left: 1rem;
  list-style: disc;
`;

const QuestionItem = styled.li`
  margin-bottom: 1.5rem;
`;

const QuestionText = styled.p`
  white-space: pre-wrap;
  margin-bottom: 0.5rem;
`;

const AnswerBox = styled.p`
  background: #f3f4f6;
  padding: 0.75rem;
  border-radius: 0.5rem;
  white-space: pre-wrap;
`;

// 📚 선택지 목록
const questionTypes = [
  '기본 정보 확인',
  '빈칸 채우기',
  '사례/시나리오',
  '일치 여부 판단',
  '원인-결과 연결',
  '우선순위/절차',
  '틀린 것 고르기',
  '비교/구분',
  '적용 판단',
];

// ✅ 메인 컴포넌트
export default function QuizmakerPage() {
  const [settings, setSettings] = useState({
    question_type: '기본 정보 확인',
    domain: 'IT',
    num_questions: 1,
    difficulty: '중',
    include_explanation: true,
    output_format: 'Plain Text',
  });

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' && 'checked' in e.target
        ? (e.target as HTMLInputElement).checked
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProgress(0);

    try {
      const res = await fetch('http://localhost:5000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error(`서버 응답 오류: ${res.status}`);

      const data = await res.json();
      setQuestions(data.questions);
      setProgress(100);
      console.log('✅ 문제 생성 완료:', data.questions);
    } catch (error) {
      console.error('❌ 문제 생성 실패:', error);
      alert('문제 생성 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 1500); // 약간의 여유 시간 후 초기화
    }
  };

  return (
    <SectionWrapper>
      <Card>
        <Title>📘 금융보안 문제 생성기</Title>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
            <div>
              <Label>문제 유형</Label>
              <Select name="question_type" value={settings.question_type} onChange={handleChange}>
                {questionTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>도메인</Label>
              <Select name="domain" value={settings.domain} onChange={handleChange}>
                {["IT", "일반", "법률", "동향"].map((domain) => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>문제 수</Label>
              <Select name="num_questions" value={settings.num_questions} onChange={handleChange}>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>난이도</Label>
              <Select name="difficulty" value={settings.difficulty} onChange={handleChange}>
                {["하", "중", "상"].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
            </div>
            <CheckboxRow>
              <input
                type="checkbox"
                name="include_explanation"
                checked={settings.include_explanation}
                onChange={handleChange}
              />
              <Label style={{ margin: 0 }}>해설 포함</Label>
            </CheckboxRow>
            <div>
              <Label>출력 형식</Label>
              <Select name="output_format" value={settings.output_format} onChange={handleChange}>
                {["Plain Text", "CSV"].map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </Select>
            </div>
          </div>

          {loading ? (
            <ProgressWrapper>
              <ProgressBar width={progress} />
            </ProgressWrapper>
          ) : (
            <SubmitButton type="submit" loading={false}>
              🚀 문제 생성
            </SubmitButton>
          )}
        </form>

        {questions.length > 0 && (
          <QuestionSection>
            <QuestionTitle>생성된 문제</QuestionTitle>
            <QuestionList>
              {questions.map((q, i) => (
                <QuestionItem key={i}>
                  <QuestionText>{q.question}</QuestionText>
                  {q.answer && (
                    <AnswerBox>
                      <strong>📝 정답 및 해설:</strong><br />
                      {q.answer}
                    </AnswerBox>
                  )}
                </QuestionItem>
              ))}
            </QuestionList>
          </QuestionSection>
        )}
      </Card>
    </SectionWrapper>
  );
}
