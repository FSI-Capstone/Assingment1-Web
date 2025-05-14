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

// 출제기준 데이터 (각 도메인별로 변환)
type CriteriaDetail = string;
type CriteriaSub = { sub: string; details: CriteriaDetail[] };
type CriteriaMain = { main: string; subs: CriteriaSub[] };
type DomainKey = '법률' | 'IT' | '일반' | '동향';
const criteriaData: Record<DomainKey, CriteriaMain[]> = {
  법률: [
    {
      main: "1. 정보보호 관리",
      subs: [
        {
          sub: "1. 정보보호 관리 이해",
          details: [
            "1. 정보보호의 목적 및 특성",
            "2. 정보보호 관리의 개념",
            "3. 정보보호 전략 및 조직",
          ],
        },
        {
          sub: "2. 정보보호 위험평가",
          details: [
            "1. 위험분석 및 계획수립",
            "2. 정보자산 식별 및 분석",
            "3. 위험분석 및 평가",
          ],
        },
        {
          sub: "3. 정보보호 대책 구현 및 사고대응",
          details: [
            "1. 정보보호 대책 선정 및 계획서 작성",
            "2. 관리적 보호대책 구현 및 운영 (내‧외부 인력보안, 교육 및 훈련, 내부감사, 침해사고 예방‧대응, 업무연속성관리 등)",
            "3. 물리적 보호대책 구현 및 운영 (출입통제, 개인 및 공용 환경 보안 등)",
            "4. 기술적 보호대책 구현 및 운영 (시스템 및 SW개발 보안, 서버‧네트워크‧DB‧어플리케이션 보안, IT 시스템 및 정보보호 시스템 운영 보안 등)",
            "5. 정보보호 사고대응 (디지털 포렌식 등)",
          ],
        },
        {
          sub: "4. 정보보호 인증제도 이해",
          details: [
            "1. 정보보호 관리체계 인증의 이해",
            "2. 정보보호 제품인증의 이해",
          ],
        },
      ],
    },
    {
      main: "2. 정보보호 관련 윤리 및 법규",
      subs: [
        {
          sub: "1. 정보보안 윤리",
          details: [
            "1. 사이버 윤리 (보안윤리 개념, 디지털 저작권 침해 및 보호기술, 유해정보유통, 사이버폭력, 사이버 사기 등 범죄행위)",
            "2. 정보시스템 이용자 및 개인정보취급자의 금지행위",
          ],
        },
        {
          sub: "2. 정보보호 관련 법제",
          details: [
            "1. 정보보호 관련 법제 용어의 정의",
            "2. 정보통신망 이용촉진 및 정보보호 등에 관한 법률의 이해",
          ],
        },
        {
          sub: "3. 개인정보보호 관련 법제",
          details: [
            "1. 개인정보보호 관련 용어의 정의",
            "2. 개인정보보호법의 이해",
          ],
        },
      ],
    },
  ],
  IT: [
    {
      main: "1. 정보 시스템의 범위 및 이해",
      subs: [
        { sub: "1. 단말 및 서버 시스템", details: [
          "단말 시스템(PC, 모바일, 프린터, IoT/IIoT 등)",
          "시스템 서버(DB, DNS, E-mail, WEB/WAS, 파일서버, Cloud, 보안제품 등)",
        ] },
        { sub: "2. 운영체제", details: [
          "단말 운영체제 (Window, Linux, Android, iOS, Embedded OS 등)",
          "서버 운영체제 (Windows, Linux, Unix 등)",
        ] },
        { sub: "3. 시스템 정보", details: [
          "시스템 환경정보, 인증정보, 시스템/감사 로그",
        ] },
      ],
    },
    {
      main: "2. 시스템 보안위협 및 공격기법",
      subs: [
        { sub: "1. 시스템 보안위협", details: [
          "보안설정, 권한설정, 내부자 위협 등 관리적 보안위협",
          "보안취약점에 의한 도청, 정보유출‧변조, 비인가 접근 등 기술적 보안위협",
        ] },
        { sub: "2. 시스템 공격기법", details: [
          "APT, 취약점 스캐너, SQL Injection, Buffer Overflow 등 시스템 공격기법 정의 및 특성",
        ] },
      ],
    },
    {
      main: "3. 시스템 보안위협 및 공격에 대한 예방과 대응",
      subs: [
        { sub: "1. 시스템보안 대응기술", details: [
          "보안설정, 인증강화, 보안패치, 클라우드 보안 등 관리적 보안",
          "시스템 파일 위‧변조 방지, 유출방지, 접근통제, 접근제어, 로그분석, 이벤트 분석 등 기술적 보안",
        ] },
        { sub: "2. 시스템 분석 도구", details: [
          "시스템 보안취약점 분석 도구(Nmap, Kali Linux, etc. 등) 기능",
          "시스템 보안취약점 분석 도구(Nmap, Kali Linux, etc. 등) 특징 및 활용방안",
        ] },
        { sub: "3. 시스템 보안 솔루션", details: [
          "시스템 보호용 보안 솔루션 기능",
          "시스템 보호용 보안 솔루션 특징 및 활용방안",
        ] },
      ],
    },
    {
      main: "1. 네트워크 일반",
      subs: [
        { sub: "1. 네트워크 개념 이해", details: [
          "네트워크의 개요(OSI 7 Layers 및 TCP, UDP, IP, ICMP 등 네트워크 프로토콜)",
          "네트워크의 종류별 동작 원리 및 특징(Ethernet, LAN, Intranet, Extranet, Internet, CAN, PAN, HAN, SDN 등)",
          "네트워크 주소의 개요 (IPv4, IPv6 Addressing, Subnetting, CIDR, VLSM, 데이터 캡슐화, Multicast, Broadcast 등)",
          "네트워크 주소의 종류별 동작원리 및 특징(공인주소, 사설주소, 정적주소, 동적 주소, NAT 등)",
        ] },
        { sub: "2. 네트워크 활용", details: [
          "네트워크 장비별 원리 및 특징 (NIC, Router, Bridge, Switch, Hub, Repeater, Gateway, VLAN 등)",
          "네트워크 공유(Share)의 동작원리와 특징 (Netbios, Netbeui, P2P 등)",
          "유‧무선 네트워크 서비스의 개요와 종류별 특징",
          "네트워크 도구(ping, arp, rarp, traceroute, netstat, tcpdump 등)의 이해와 활용",
        ] },
      ],
    },
    {
      main: "2. 네트워크 기반 공격기술의 이해 및 대응",
      subs: [
        { sub: "1. 서비스 거부(DoS), 분산 서비스 거부(DDoS) 공격", details: [
          "서비스 거부 (DoS) 공격 유형별 동작원리 및 특징",
          "각종 서비스 거부(DoS) 공격에 대한 대응 방법",
          "분산 서비스 거부(DDoS) 공격 유형별 동작원리 및 특징",
          "각종 분산 서비스 거부(DDoS) 공격에 대한 대응 방법",
        ] },
        { sub: "2. 스캐닝", details: [
          "포트 및 취약점 스캐닝의 동작원리와 특징",
          "포트 및 취약점 스캐닝의 대응 방법",
        ] },
        { sub: "3. 스푸핑 공격", details: [
          "스푸핑 공격의 동작원리 및 특징 (Spoofing)",
          "스푸핑 공격의 대응 방법",
        ] },
        { sub: "4. 스니핑(Sniffing)", details: [
          "스니핑 공격의 동작원리 및 특징 (Sniffing, Session Hijacking 등)",
          "스니핑 공격의 대응 방법",
        ] },
        { sub: "5. 원격접속 공격", details: [
          "원격접속 공격의 동작원리 및 특징 (Trojan, Exploit 등)",
          "원격접속 공격의 대응 방법",
        ] },
      ],
    },
    {
      main: "3. 네트워크 보안 기술",
      subs: [
        { sub: "1. 보안 프로토콜 이해", details: [
          "보안 프로토콜별 동작원리 및 특징",
          "보안 프로토콜 응용 사례",
        ] },
        { sub: "2. 네트워크 보안기술 및 응용", details: [
          "보안 솔루션의 종류별 동작원리 및 특징 (Firewall, IDS, IPS, VPN, ESM, UTM, NAC, 역추적시스템 등)",
          "보안 솔루션의 활용(Snort, 탐지툴, Pcap 등)",
          "로그 분석 이해 및 응용",
          "패킷 분석 이해 및 응용",
          "역추적 이해 및 응용",
          "악성코드 분석 도구의 이해 및 응용",
        ] },
      ],
    },
    {
      main: "1. 인터넷 응용 보안",
      subs: [
        { sub: "1. FTP 보안", details: [
          "FTP 개념",
          "FTP 서비스 운영FTP 공격 유형",
          "FTP 보안기술",
        ] },
        { sub: "2. 메일 보안", details: [
          "메일 개념",
          "메일 서비스 운영",
          "메일 서비스 공격유형(스팸 메일, 악성 메일, 웜 등)과 대책",
          "메일 보안 기술",
        ] },
        { sub: "3. Web/App 보안", details: [
          "Web/App 개념",
          "Web/App 운영",
          "Web/App 장애 분석 및 대응",
          "Web/App 공격 유형",
          "Web/App 보안 기술",
        ] },
        { sub: "4. DNS 보안", details: [
          "DNS 개념",
          "DNS 서비스 운영",
          "DNS 공격유형",
          "DNS 보안 기술",
        ] },
        { sub: "5. DB 보안", details: [
          "DB 보안 개념",
          "DB 공격 유형",
          "DB 보안 기술",
        ] },
      ],
    },
    {
      main: "2. 전자상거래 보안",
      subs: [
        { sub: "1. 전자상거래 보안 기술", details: [
          "전자지불 수단별 보안요소",
          "전자상거래 보안 프로토콜",
          "전자상거래 인증기술",
          "무선플랫폼에서의 전자상거래 보안",
        ] },
      ],
    },
    {
      main: "3. 어플리케이션 보안 취약점",
      subs: [
        { sub: "1. 어플리케이션 보안 취약점 대응", details: [
          "어플리케이션 보안취약점 유형",
          "어플리케이션 보안 취약점 대응 기술",
        ] },
        { sub: "2. 어플리케이션 개발 보안", details: [
          "소프트웨어 개발 보안 개념 및 요구사항",
          "소스코드 개발 보안(Secure Coding)",
          "개발보안 툴",
        ] },
      ],
    },
  ],
  일반: [
    {
      main: "1. 보안요소 기술",
      subs: [
        { sub: "1. 인증", details: [
          "1. 사용자 인증 방식 및 원리",
          "2. 메시지에 대한 인증 방식 및 핵심 기술",
          "3. 디바이스에 대한 인증 기술의 원리",
        ] },
        { sub: "2. 접근통제", details: [
          "1. 접근통제 정책의 이해 및 구성 요소",
          "2. 접근통제 정책의 특징 및 적용 범위(임의적, 강제적, 역할 기반 등)",
          "3. 접근통제 기법과 각 모델의 특징",
        ] },
        { sub: "3. 키 분배 프로토콜", details: [
          "1. 대칭 키 기반 분배 방식의 원리 및 운영",
          "2. 공개 키 기반 분배 방식의 원리",
        ] },
        { sub: "4. 디지털서명", details: [
          "1. 인증서 구조 및 주요 특징",
          "2. 디지털서명의 이해 (종류, 보안 요구 조건, 특징, 서명 방식 등)",
          "3. PKI 구성방식 및 관리(계층구조, 네트워크 구조, 복합형 구조, CRL, OCSP 등)",
          "4. 디지털서명 응용 원리 및 구조(은닉서명, 이중서명 등)",
        ] },
      ],
    },
    {
      main: "2. 암호학",
      subs: [
        { sub: "1. 암호 알고리즘", details: [
          "1. 암호 관련 용어 및 암호 시스템의 구성",
          "2. 암호 공격의 유형별 특징",
          "3. 대칭키 암호시스템 특징 및 활용(종류, 구조, 운영 모드, 공격 기술 등)",
          "4. 공개키 암호시스템의 특징 및 활용(종류, 구조, 특징)",
          "5. 인수분해 기반 공개키 암호방식",
          "6. 이산로그 기반 공개키 암호방식",
        ] },
        { sub: "2. 해시함수", details: [
          "1. 해시함수의 개요 및 요구사항",
          "2. 해시함수별 특징 및 구조",
          "3. 메시지 인증 코드(MAC)의 원리 및 구조",
        ] },
      ],
    },
  ],
  동향: [
    {
      main: "1. 시스템 및 네트워크 보안 특성 파악",
      subs: [
        { sub: "1. 운영체제별 보안특성 파악하기", details: [
          "1. IT환경을 구성하고 있는 개인용 단말 시스템 또는 서버에 설치된 운영체제 환경 및 특징을 파악할 수 있다.",
          "2. 서비스별 운영체제 및 버전을 파악할 수 있다.",
          "3. 운영체제별 식별 및 인증, 접근통제, 보안업데이트 등 보안강화 방안을 파악할 수 있다.",
          "4. 운영체제에서 생성되는 로그파일관리가 되고 있는지 점검할 수 있다.",
        ] },
        { sub: "2. 프로토콜별 보안특성 파악하기", details: [
          "1. OSI 7계층과 TCP/IP 프로토콜의 구성 그리고 각 계층별 기능, 동작 구조를 이해할 수 있다.",
          "2. TCP/IP 각 계층에서 처리하는 PDU 구조 및 PDU 헤더별 필드 기능을 이해할 수 있다.",
          "3. IP, ARP, RARP, ICMP 그리고 각 Routing 프로토콜 동작절차 및 취약점을 이해할 수 있다.",
          "4. TCP, UDP, SSL/TLS, IPSec 프로토콜의 동작절차와 취약점을 이해할 수 있다.",
          "5. 서비스 거부(DoS/DDoS 등) 공격 방식과 절차를 이해할 수 있다.",
          "6. 무선 프로토콜 동작 구조 및 보안 기법을 이해할 수 있다.",
        ] },
        { sub: "3. 서비스별 보안특성 파악하기", details: [
          "1. FTP 서비스 동작절차와 환경 설정, 보안 기법을 이해할 수 있다.",
          "2. 메일 서비스 동작절차와 환경 설정, 보안 기법을 이해할 수 있다.",
          "3. 웹 서비스 동작절차와 환경 설정, 보안 기법을 이해할 수 있다.",
          "4. DNS 서비스 동작절차와 환경 설정, 보안 기법을 이해할 수 있다.",
          "5. DB 서비스와 환경 설정, 보안 기법을 이해할 수 있다.",
          "6. 전자서명, 공개키 기반 구조 구성과 보안 특성을 이해할 수 있다.",
        ] },
        { sub: "4. 보안장비 및 네트워크 장비별 보안특성 파악하기", details: [
          "1. 조직의 보안대상 시스템과 네트워크 장비를 파악할 수 있다.",
          "2. 네트워크 구성도를 분석하여 사용 중인 IP 주소, 서브넷 등의 네트워크 정보를 파악할 수 있다.",
          "3. SNMP를 이용한 원격관리기능과 스캐닝 도구를 이용한 관리대상시스템의 제공 서비스를 파악할 수 있다.",
          "4. 네트워크 장비의 역할과 동작을 이해할 수 있다.",
          "5. VLAN 보안 서비스 및 설정 방법을 이해할 수 있다.",
          "6. Router 설정 절차 및 트래픽 통제 기능을 이해할 수 있다.",
          "7. Firewall, IPS/IDS, WAF, VPN 등 보안 장비별 특성과 설정 방법을 이해할 수 있다.",
          "8. NAT 종류 및 동작 절차를 이해할 수 있다.",
        ] },
      ],
    },
    {
      main: "2. 취약점 점검 및 보완",
      subs: [
        { sub: "1. 운영체제 보안설정 점검과 보완하기", details: [
          "1. 불필요한 계정 존재 및 악성코드 설치 여부에 대하여 점검‧보완할 수 있다.",
          "2. 운영체제별 보호 대상 객체(파일, 폴더) 권한 설정이 보안목표에 따라 설정되어 있는지 점검․보완할 수 있다.",
          "3. 운영체제별 이벤트 로그정보 생성과 관리가 보안목표에 따라 설정되어 있는지 점검․보완할 수 있다.",
          "4. 운영체제 종류 및 버전 정보가 불필요하게 노출되어 있는지 점검‧보완할 수 있다.",
          "5. 원격접속 및 원격관리 기능이 보안목표에 따라 설정되어 있는지 점검․보완할 수 있다.",
          "6. 운영체제의 패치관리가 적절히 설정되어 있는지 점검‧보완할 수 있다.",
        ] },
        { sub: "2. 서비스 보안설정 점검과 보완하기", details: [
          "1. 비인가된 서비스가 동작하고 있는지 점검한 후 제거 할 수 있다.",
          "2. 파일서버, FTP서버에 권한이 없는 사용자가 접근할 수 있게 설정되어 있는지, 각 사용자별로 접근할 수 있는 파일‧폴더가 적절히 설정되어 있는지 점검할 수 있다.",
          "3. 공유폴더에 적절한 접근통제가 보안목표에 적합한지 점검하며, 폴더가 불필요하게 공유되어 있는지 점검․보완할 수 있다.",
          "4. 메일 서버 설정에서 스팸메일 릴레이가 허용되어 있는지, 메일 송수신 프로토콜(SMTP, POP, IMAP) 보안 설정이 적절한지 점검할 수 있다.",
          "5. WEB/WAS 서버 설정에서 다양한 공격 유형들에 대비하여 보안 설정이 적절한지 점검할 수 있다.",
          "6. DNS 서버 설정에서 불필요한 명령어 수행이 허가되어 있지 않은지, DNS 보안 조치가 적절히 설정되어 있는지 점검할 수 있다.",
          "7. DB 서버 설정에서 중요 정보가 암호화되어 저장되고 있는지, DB객체(테이블, 칼럼, 뷰 등)별 접근통제가 적절히 설정되어 있는지 점검할 수 있다.",
        ] },
        { sub: "3. 네트워크 및 보안장비 설정 점검과 보완하기", details: [
          "1. 네트워크 장비의 관리자 계정 보안이 적절히 설정되어 있는지 점검할 수 있다.",
          "2. 침입차단시스템(Firewall) 장비의 보안 설정 (IP별 통제, Port별 통제, 사용자 ID별 통제 등)이 보안목표에 따라 적절히 설정되어 있는지 점검할 수 있다.",
          "3. 침입탐지 및 방지 시스템(IDS/IPS) 보안 설정이 보안목표에 따라 적절히 설정되어 있는지 점검할 수 있다.",
          "4. NAT 설정이 보안목표에 따라 적절히 설정되어 있는지 점검할 수 있다.",
          "5. 무선접속 장비가 보안목표에 따라 암호화 및 접근통제가 적절히 설정되어 있는지 확인할 수 있다.",
          "6. WAF 보안 설정이 보안목표에 따라 적절히 설정되어 있는지 점검할 수 있다.",
          "7. Anti-DDoS(DDOS 대응장비) 보안 설정이 보안목표에 따라 적절히 설정되어 있는지 점검할 수 있다.",
          "8. Anti-APT(APT 대응솔루션) 보안 설정이 보안목표에 따라 적절히 설정되어 있는지 점검할 수 있다.",
        ] },
        { sub: "4. 취약점 점검이력과 보완 내용 관리하기", details: [
          "1. 운영체제별 보안점검 내용과 방법(도구), 발견된 보안취약점 및 보완 사항을 기록할 수 있다.",
          "2. 조직에서 사용 중인 주요 서비스에 대해 수행한 보안점검 내용과 방법(도구), 발견된 보안취약점 및 보완 사항을 기록할 수 있다.",
          "3. 네트워크 장비에 대해 수행한 보안점검 내용과 방법(도구), 발견된 보안취약점 및 보완사항을 기록할 수 있다.",
          "4. 보안장비에 대해 수행한 보안점검 내용과 방법(도구), 발견된 보안취약점 및 보완사항을 기록할 수 있다.",
        ] },
      ],
    },
    {
      main: "3. 보안관제 및 대응",
      subs: [
        { sub: "1. 정보수집 및 모니터링", details: [
          "1. 조직의 보안목표에 따라 운영체제 및 버전별, 서비스별(FTP, 메일, WWW, DNS, DB 등) 보안 등 생성되는 로그 정보를 파악하고 로그 내용을 모니터링 및 통제할 수 있다.",
          "2. 주요 보안장비(Firewall, IDS, IPS 등), 네트워크 장비(Switch, Router, 무선 접속AP 등) 등에서 제공되는 로그정보 관리 도구를 이용하여 로그정보의 생성 수준, 구성요소 등을 설정 할 수 있다.",
        ] },
        { sub: "2. 로그분석 및 대응", details: [
          "1. 시스템별, 주요 서비스별, 유‧무선 네트워크 장비별, 보안장비별, 시간대별로 보안 로그 정보를 통합‧분석할 수 있다.",
          "2. 통합 보안로그를 정렬하여 내‧외부 공격 시도 및 침투 여부 등 관련 정보를 수집 및 분석할 수 있다.",
          "3. 시스템별, 주요 서비스별, 유‧무선 네트워크 장비별, 보안장비별 비정상 접근과 변경 여부를 확인 및 분석할 수 있다.",
          "4. 업무 연속성을 위한 정보 및 보안 설정 정보를 백업 및 복구 등으로 대응할 수 있다.",
        ] },
      ],
    },
    {
      main: "4. 위험분석 및 정보 보호 대책 수립",
      subs: [
        { sub: "1. IT 자산 위협 분석하기", details: [
          "1. 조직의 IT환경의 시스템 및 네트워크 구성도 등 정보자산 현황을 파악할 수 있다.",
          "2. IT환경을 구성하는 서버, 어플리케이션, DBMS, WEB/WAS, PC 등으로부터의 위협 요인을 식별할 수 있다.",
          "3. 조직의 네트워크를 구성하는 네트워크 장비, 보안 장비로부터의 위협요인을 식별할 수 있다.",
          "4. 정보보호 및 개인정보보호 관련 법적 준거성 위험을 식별할 수 있다.",
        ] },
        { sub: "2. 조직의 정보자산 위협 및 취약점 분석 정리하기", details: [
          "1. 조직의 H/W자산(PC, 서버, 네트워크 및 보안장비)에 대한 중요도, 내․외부위협 및 취약점분석 내용을 정리할 수 있다.",
          "2. 조직의 S/W자산(운영체제, 상용 및 자가 개발패키지)에 대한 중요도, 내․외부 위협 및 취약점분석 내용을 정리할 수 있다.",
          "3. 조직의 정보자산(기업정보 및 고객정보)에 대한 중요도, 내․외부 위협 및 취약점 분석 내용을 정리할 수 있다.",
        ] },
        { sub: "3. 위험평가하기", details: [
          "1. 식별된 위험을 기반으로 위험도를 산정할 수 있다.",
          "2. 조직에서 수용 가능한 목표 위험수준을 정하고 그 수준을 초과하는 위험을 식별할 수 있다.",
        ] },
        { sub: "4. 정보보호대책 선정 및 이행 계획 수립하기", details: [
          "1. 식별된 위험에 대한 처리 전략(위험감소, 위험회피, 위험전가, 위험수용 등)을 수립하고 위험처리를 위한 정보보호대책을 파악할 수 있다.",
          "2. 정보보호대책의 우선순위를 정한 후에 일정, 예산 등을 포함하여 정보보호 대책 이행계획을 수립할 수 있다.",
        ] },
      ],
    },
  ],
};

// ✅ 메인 컴포넌트
type Settings = {
  question_type: string;
  domain: DomainKey;
  num_questions: number;
  difficulty: string;
  include_explanation: boolean;
  output_format: string;
  mainCriteria: string;
  subCriteria: string;
  detailCriteria: string;
};

export default function QuizmakerPage() {
  const [settings, setSettings] = useState<Settings>({
    question_type: '기본 정보 확인',
    domain: 'IT',
    num_questions: 1,
    difficulty: '중',
    include_explanation: true,
    output_format: 'Plain Text',
    mainCriteria: '',
    subCriteria: '',
    detailCriteria: '',
  });
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mainOptions, setMainOptions] = useState<string[]>([]);
  const [subOptions, setSubOptions] = useState<string[]>([]);
  const [detailOptions, setDetailOptions] = useState<string[]>([]);

  // 도메인 변경 시 주요항목 옵션 업데이트
  useEffect(() => {
    const domain = settings.domain;
    const mainList = criteriaData[domain]?.map((item: CriteriaMain) => item.main) || [];
    setMainOptions(mainList);
    setSettings((prev) => ({ ...prev, mainCriteria: '', subCriteria: '', detailCriteria: '' }));
    setSubOptions([]);
    setDetailOptions([]);
  }, [settings.domain]);

  // 주요항목 변경 시 세부항목 옵션 업데이트
  useEffect(() => {
    const domain = settings.domain;
    const main = settings.mainCriteria;
    const mainObj = criteriaData[domain]?.find((item: CriteriaMain) => item.main === main);
    const subList = mainObj?.subs.map((item: CriteriaSub) => item.sub) || [];
    setSubOptions(subList);
    setSettings((prev) => ({ ...prev, subCriteria: '', detailCriteria: '' }));
    setDetailOptions([]);
  }, [settings.mainCriteria, settings.domain]);

  // 세부항목 변경 시 세세항목 옵션 업데이트
  useEffect(() => {
    const domain = settings.domain;
    const main = settings.mainCriteria;
    const sub = settings.subCriteria;
    const mainObj = criteriaData[domain]?.find((item: CriteriaMain) => item.main === main);
    const subObj = mainObj?.subs.find((item: CriteriaSub) => item.sub === sub);
    const detailList = subObj?.details || [];
    setDetailOptions(detailList);
    setSettings((prev) => ({ ...prev, detailCriteria: '' }));
  }, [settings.subCriteria, settings.mainCriteria, settings.domain]);

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
      const res = await fetch('http://127.0.0.1:5000/generate', {
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
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1rem', background: '#f9fafb', marginTop: '0.5rem' }}>
              <Label style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', color: '#3730a3' }}>출제기준 선택 <span style={{ color: '#a1a1aa', fontWeight: 400, fontSize: '0.9em' }}></span></Label>
              <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: '1fr' }}>
                <div>
                  <Label htmlFor="mainCriteria">주요항목</Label>
                  <Select id="mainCriteria" name="mainCriteria" value={settings.mainCriteria} onChange={handleChange}>
                    <option value="">주요항목을 선택하세요</option>
                    {mainOptions.map((main) => (
                      <option key={main} value={main}>{main}</option>
                    ))}
                  </Select>
                  
                </div>
                <div>
                  <Label htmlFor="subCriteria">세부항목</Label>
                  <Select id="subCriteria" name="subCriteria" value={settings.subCriteria} onChange={handleChange} disabled={!settings.mainCriteria}>
                    <option value="">세부항목을 선택하세요</option>
                    {subOptions.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </Select>
                  
                </div>
                <div>
                  <Label htmlFor="detailCriteria">세세항목</Label>
                  <Select id="detailCriteria" name="detailCriteria" value={settings.detailCriteria} onChange={handleChange} disabled={!settings.subCriteria}>
                    <option value="">세세항목을 선택하세요</option>
                    {detailOptions.map((detail) => (
                      <option key={detail} value={detail}>{detail}</option>
                    ))}
                  </Select>
                  
                </div>
              </div>
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
