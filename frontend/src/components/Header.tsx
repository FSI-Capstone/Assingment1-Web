// src/app/AppHeader.tsx

'use client';

import Link from 'next/link';
import styled from '@emotion/styled';

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
  return (
    <Header>
      <Title>문제 생성기</Title>
      <Nav>
        <Link href="/">홈</Link>
        <Link href="/quizmaker">문제생성</Link>
      </Nav>
    </Header>
  );
}
