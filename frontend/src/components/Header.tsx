// src/app/AppHeader.tsx

'use client';

import Link from 'next/link';
import styled from '@emotion/styled';
import { useState } from 'react';

const Header = styled.header`
  background-color: #18181b;
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.01em;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;

  a {
    text-decoration: none;
    color: white;
    &:hover {
      text-decoration: underline;
      color: #93c5fd;
    }
  }
`;

export default function AppHeader() {
  const [loading, setLoading] = useState(false);

  const downloadCSV = async () => {
    setLoading(true);
    try {
      const response = await fetch('/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_type: '기본 정보 확인',
          domain: '일반',
          num_questions: 5,
          difficulty: '중',
          include_explanation: true,
          output_format: 'CSV',
          mainCriteria: '기준1',
          subCriteria: '기준2',
          detailCriteria: '기준3',
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'questions.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        console.error('CSV 다운로드 실패');
      }
    } catch (error) {
      console.error('오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Header>
      <Title>문제 생성기</Title>
      <Nav>
        <Link href="/">홈</Link>
        <Link href="/quizmaker">문제생성</Link>
        <button onClick={downloadCSV} disabled={loading}>
          {loading ? '다운로드 중...' : 'CSV 다운로드'}
        </button>
      </Nav>
    </Header>
  );
}
