![Makerkit - Next.js Supabase SaaS 스타터 키트 \[Lite 버전\]](apps/web/public/images/makerkit.webp)

# 새로운 기능! Next.js Supabase SaaS 스타터 키트 (Lite)

Next.js 15 + Supabase 스타터 키트로 SaaS 구축을 더 빠르게 시작하세요.

👉 **모든 기능을 갖춘 SaaS 스타터 키트를 찾고 계신가요?** [전체 버전 확인하기](https://makerkit.dev)

⭐️ **개발자들이 Makerkit을 신뢰하는 이유:**
- 프로덕션 수준의 아키텍처 결정
- 포괄적인 TypeScript 설정
- 최신 스택: Next.js 15, Supabase, TailwindCSS v4
- 고품질 코드 도구: ESLint v9, Prettier, 엄격한 TypeScript 등
- 정기적인 업데이트 및 적극적인 유지보수

추신: 이 키트의 문서는 아직 업데이트 중이므로 나중에 자세한 내용을 다시 확인해주세요.

## 포함된 내용

### 핵심 아키텍처
- 🏗️ Next.js 15 + Turborepo 모노레포 설정
- 🎨 TailwindCSS v4를 사용한 Shadcn UI 컴포넌트
- 🔐 Supabase 인증 및 기본 DB
- 🌐 i18n 번역 (클라이언트 + 서버)
- ✨ 전체 TypeScript + ESLint v9 + Prettier 구성

### 주요 기능
- 👤 사용자 인증 흐름
- ⚙️ 사용자 프로필 및 설정
- 📱 반응형 마케팅 페이지
- 🔒 보호된 라우트
- 🎯 Playwright를 사용한 기본 테스트 설정

### 기술

이 스타터 키트는 핵심 기반을 제공합니다:

🛠️ **기술 스택**:
- [Next.js 15](https://nextjs.org/): 서버 사이드 렌더링 및 정적 사이트 생성을 위한 React 기반 프레임워크입니다.
- [Tailwind CSS](https://tailwindcss.com/): 사용자 정의 디자인을 빠르게 구축하기 위한 유틸리티 우선 CSS 프레임워크입니다.
- [Supabase](https://supabase.com/): 웹 및 모바일 애플리케이션을 위한 실시간 데이터베이스입니다.
- [i18next](https://www.i18next.com/): JavaScript를 위한 인기 있는 국제화 프레임워크입니다.
- [Turborepo](https://turborepo.org/): 여러 패키지 및 애플리케이션을 관리하기 위한 모노레포 도구입니다.
- [Shadcn UI](https://shadcn.com/): Tailwind CSS를 사용하여 구축된 컴포넌트 모음입니다.
- [Zod](https://github.com/colinhacks/zod): TypeScript 우선 스키마 유효성 검사 라이브러리입니다.
- [React Query](https://tanstack.com/query/v4): React를 위한 강력한 데이터 가져오기 및 캐싱 라이브러리입니다.
- [Prettier](https://prettier.io/): JavaScript, TypeScript 및 CSS를 위한 독단적인 코드 포맷터입니다.
- [Eslint](https://eslint.org/): JavaScript 및 TypeScript를 위한 강력한 린팅 도구입니다.
- [Playwright](https://playwright.dev/): 웹 애플리케이션의 엔드 투 엔드 테스트를 위한 프레임워크입니다.

이 키트는 [이 SaaS 스타터 키트의 전체 버전](https://makerkit.dev)을 축소한 버전입니다. 전체 키트의 작은 부분을 평가하거나 자체 프로젝트의 기반으로 사용하기에 좋은 방법입니다.

## Lite 버전과 전체 버전 비교

Lite 키트는 다음에 적합합니다:
- 코드 아키텍처 및 패턴 평가
- 기본 SaaS 프로토타입 구축
- 기술 스택 접근 방식 학습
- 기본 SaaS 도구 구축

[전체 버전](https://makerkit.dev)에는 다음과 같은 프로덕션 기능이 추가됩니다:
- 💳 완전한 청구 및 구독 시스템
- 👥 팀 계정 및 관리
- 📧 메일러 및 이메일 템플릿 (Nodemailer, Resend 등)
- 📊 분석 (GA, Posthog, Umami 등)
- 🔦 모니터링 공급자 (Sentry, Baselime 등)
- 🔐 프로덕션 데이터베이스 스키마
- ✅ 포괄적인 테스트 스위트
- 🔔 실시간 알림
- 📝 블로깅 시스템
- 💡 문서 시스템
- ‍💻 슈퍼 관리자 패널
- 🕒 매일 업데이트 및 개선
- 🐛 우선 버그 수정
- 🤝 지원
- ⭐️ 1000명 이상의 개발자가 사용
- 💪 활발한 커뮤니티 회원
- 🏢 스타트업에서 대기업까지 지원

[전체 기능 비교 보기 →](https://makerkit.dev/#pricing)

## 시작하기

### 사전 요구 사항

- Node.js 18.x 이상 (최신 LTS 버전 권장)
- Docker
- PNPM

컴퓨터에서 Docker 데몬이 실행 중인지 확인하십시오. Supabase CLI가 작동하려면 필요합니다.

### 설치

#### 1. 이 저장소 복제

```bash
git clone https://github.com/makerkit/next-supabase-saas-kit-lite.git
```

#### 2. 종속성 설치

```bash
pnpm install
```

#### 3. Supabase 시작

컴퓨터에서 Docker 데몬이 실행 중인지 확인하십시오.

그런 다음 다음 명령을 실행하여 Supabase를 시작합니다:

```bash
pnpm run supabase:web:start
```

Supabase 서버가 실행되면 이전 명령의 출력에 있는 포트를 사용하여 Supabase 대시보드에 액세스하십시오. 일반적으로 [http://localhost:54323](http://localhost:54323)에서 찾을 수 있습니다.

명령이 실행된 후 터미널에 모든 Supabase 서비스가 인쇄된 것을 볼 수 있습니다.

##### Supabase 중지

Supabase 서버를 중지하려면 다음 명령을 실행하십시오:

```bash
pnpm run supabase:web:stop
```

##### Supabase 재설정

Supabase 서버를 재설정하려면 다음 명령을 실행하십시오:

```bash
pnpm run supabase:web:reset
```

##### 더 많은 Supabase 명령

더 많은 Supabase 명령은 [Supabase CLI 문서](https://supabase.com/docs/guides/cli)를 참조하십시오.

```
# 새 마이그레이션 만들기
pnpm --filter web supabase migration new <name>

# Supabase 프로젝트에 연결
pnpm --filter web supabase db link

# 마이그레이션 푸시
pnpm --filter web supabase db push
```

#### 4. Next.js 애플리케이션 시작

```bash
pnpm run dev
```

애플리케이션은 http://localhost:3000에서 사용할 수 있습니다.

#### 5. 코드 상태 (린팅, 포맷팅 등)

코드를 포맷하려면 다음 명령을 실행하십시오:

```bash
pnpm run format:fix
```

코드를 린트하려면 다음 명령을 실행하십시오:

```bash
pnpm run lint
```

TypeScript 코드를 유효성 검사하려면 다음 명령을 실행하십시오:

```bash
pnpm run typecheck
```

Turborepo는 이러한 명령의 결과를 캐시하므로 성능에 영향을 주지 않고 원하는 만큼 여러 번 실행할 수 있습니다.

## 프로젝트 구조

프로젝트는 다음 폴더로 구성됩니다:

```
apps/
├── web/                  # Next.js 애플리케이션
│   ├── app/             # App Router 페이지
│   │   ├── (marketing)/ # 공개 마케팅 페이지
│   │   ├── auth/        # 인증 페이지
│   │   └── home/        # 보호된 앱 페이지
│   ├── supabase/        # 데이터베이스 및 마이그레이션
│   └── config/          # 앱 구성
│
packages/
├── ui/                  # 공유 UI 컴포넌트
└── features/           # 핵심 기능 패키지
    ├── auth/           # 인증 로직
    └── ...
```

이 프로젝트 구조에 대한 자세한 내용은 [Next.js App Router: 프로젝트 구조](https://makerkit.dev/blog/tutorials/nextjs-app-router-project-structure) 문서를 참조하십시오.

### 환경 변수

`.env.local` 파일에서 환경 변수를 설정하여 애플리케이션을 구성할 수 있습니다.

사용 가능한 변수는 다음과 같습니다:

| 변수 이름 | 설명 | 기본값 |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | SaaS 애플리케이션의 URL | `http://localhost:3000` |
| `NEXT_PUBLIC_PRODUCT_NAME` | SaaS 제품의 이름 | `Makerkit` |
| `NEXT_PUBLIC_SITE_TITLE` | SaaS 제품의 제목 | `Makerkit - SaaS를 구축하고 관리하는 가장 쉬운 방법` |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | SaaS 제품에 대한 설명 | `Makerkit은 SaaS를 구축하고 관리하는 가장 쉬운 방법입니다. 처음부터 구축하는 번거로움 없이 SaaS를 구축하는 데 필요한 도구를 제공합니다.` |
| `NEXT_PUBLIC_DEFAULT_THEME_MODE` | SaaS 제품의 기본 테마 모드 | `light` |
| `NEXT_PUBLIC_THEME_COLOR` | SaaS 제품의 기본 테마 색상 | `#ffffff` |
| `NEXT_PUBLIC_THEME_COLOR_DARK` | 다크 모드에서 SaaS 제품의 기본 테마 색상 | `#0a0a0a` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트의 URL | `http://127.0.0.1:54321` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 프로젝트의 익명 키 | '' |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 프로젝트의 서비스 역할 키 | '' |

## 아키텍처

이 스타터 키트는 모노레포 아키텍처를 사용합니다.

1. `apps/web` 디렉터리는 Next.js 애플리케이션입니다.
2. `packages` 디렉터리에는 애플리케이션에서 사용하는 모든 패키지가 포함되어 있습니다.
3. `packages/features` 디렉터리에는 애플리케이션의 모든 기능이 포함되어 있습니다.
4. `packages/ui` 디렉터리에는 모든 UI 컴포넌트가 포함되어 있습니다.

아키텍처에 대한 자세한 내용은 [Makerkit 블로그 게시물 Next.js 프로젝트 구조](https://makerkit.dev/blog/tutorials/nextjs-app-router-project-structure)를 참조하십시오.

### 마케팅 페이지

마케팅 페이지는 `apps/web/app/(marketing)` 디렉터리에 있습니다. 이러한 페이지는 SaaS의 기능을 소개하고 제품에 대한 정보를 제공하는 데 사용됩니다.

### 인증

인증은 Supabase에서 지원됩니다. `apps/web/app/auth` 디렉터리에는 인증 페이지가 포함되어 있지만 로직은 `packages/features/auth`에 있는 자체 패키지 `@kit/auth`에 있습니다.

이 패키지는 여러 애플리케이션에서 사용할 수 있습니다.

### 게이트 페이지

게이트 페이지는 `apps/web/app/home` 디렉터리에 있습니다. 여기에서 인증으로 보호되는 SaaS 페이지를 구축할 수 있습니다.

### 데이터베이스

Supabase 데이터베이스는 `apps/web/supabase` 디렉터리에 있습니다. 이 디렉터리에는 데이터베이스 스키마, 마이그레이션 및 시드 데이터가 있습니다.

#### 새 마이그레이션 만들기
새 마이그레이션을 만들려면 다음 명령을 실행하십시오:

```bash
pnpm --filter web supabase migration new --name <migration-name>
```

이 명령은 `apps/web/supabase/migrations` 디렉터리에 새 마이그레이션 파일을 만듭니다.

#### 마이그레이션 적용

마이그레이션을 만든 후 다음 명령을 실행하여 데이터베이스에 적용할 수 있습니다:

```bash
pnpm run supabase:web:reset
```

이 명령은 데이터베이스에 마이그레이션을 적용하고 스키마를 업데이트합니다. 또한 제공된 시드 데이터를 사용하여 데이터베이스를 재설정합니다.

#### Supabase 데이터베이스 연결

로컬 Supabase 데이터베이스를 Supabase 프로젝트에 연결하려면 다음 명령을 실행합니다:

```bash
pnpm --filter web supabase db link
```

이 명령은 로컬 Supabase 데이터베이스를 Supabase 프로젝트에 연결합니다.

#### Supabase 프로젝트에 마이그레이션 푸시

마이그레이션을 변경한 후 다음 명령을 실행하여 Supabase 프로젝트에 마이그레이션을 푸시할 수 있습니다:

```bash
pnpm --filter web supabase db push
```

이 명령은 Supabase 프로젝트에 마이그레이션을 푸시합니다. 이제 Supabase 데이터베이스에 마이그레이션을 적용할 수 있습니다.

## 프로덕션으로 이동

#### 1. Supabase 프로젝트 만들기

애플리케이션을 프로덕션에 배포하려면 Supabase 프로젝트를 만들어야 합니다.

#### 2. Supabase 프로젝트에 마이그레이션 푸시

마이그레이션을 변경한 후 다음 명령을 실행하여 Supabase 프로젝트에 마이그레이션을 푸시할 수 있습니다:

```bash
pnpm --filter web supabase db push
```

이 명령은 Supabase 프로젝트에 마이그레이션을 푸시합니다.

#### 3. Supabase 콜백 URL 설정

원격 Supabase 프로젝트로 작업할 때 Supabase 콜백 URL을 설정해야 합니다.

Supabase 프로젝트 설정에서 콜백 URL을 다음 URL로 설정하십시오:

`<url>/auth/callback`

여기서 `<url>`은 애플리케이션의 URL입니다.

#### 4. Vercel 또는 기타 호스팅 공급자에 배포

Next.js를 지원하는 모든 호스팅 공급자에 애플리케이션을 배포할 수 있습니다.

#### 5. Cloudflare에 배포

구성은 그대로 작동해야 하지만 루트 레이아웃 파일 (`apps/web/app/layout.tsx`)에서 런타임을 `edge`로 설정해야 합니다.

```tsx
export const runtime = 'edge';
```

Cloudflare 대시보드에서 Node.js 호환성을 활성화하는 것을 잊지 마십시오.

## 기여

버그 수정에 대한 기여는 환영합니다! 그러나 풀 리퀘스트를 만들기 전에 아이디어를 논의하기 위해 먼저 문제를 열어주십시오.

## 라이선스

이 프로젝트는 MIT 라이선스에 따라 라이선스가 부여됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하십시오.

## 지원

이 키트에는 지원이 제공되지 않습니다. 질문이 있거나 도움이 필요한 경우 언제든지 문제를 열 수 있지만 응답 시간이나 수정은 보장되지 않습니다.

전용 지원, 우선 수정 및 고급 기능은 [전체 버전 확인하기](https://makerkit.dev)를 참조하십시오.
