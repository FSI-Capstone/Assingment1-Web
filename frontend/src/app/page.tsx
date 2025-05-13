// src/app/page.tsx

'use client';

import Link from 'next/link';
import styled from '@emotion/styled';

const Container = styled.main`
  min-height: 100vh;
  background: linear-gradient(to bottom, #18181b, #27272a);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
`;

const Description = styled.p`
  font-size: 1.125rem;
  color: #d1d5db;
  text-align: center;
  max-width: 40rem;
  margin-bottom: 2rem;
`;

const StartButton = styled.button`
  margin-top: 2.5rem;
  padding: 0.75rem 1.5rem;
  background-color: white;
  color: #111827;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #e5e7eb;
  }
`;

export default function Home() {
  return (
    <Container>
      <Title>문제 생성기</Title>
      <Description>출제기준 PDF를 업로드하고, GPT로 문제를 생성해보세요.</Description>
      <Link href="/quizmaker">
        <StartButton>시작하기</StartButton>
      </Link>
    </Container>
  );
}

