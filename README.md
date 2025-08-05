# 🛒 Figure Commerce

현대적인 이커머스 플랫폼으로, Next.js 15와 Prisma를 활용하여 구축된 온라인 쇼핑몰입니다.

## ✨ 주요 기능

### 🛍️ 쇼핑 기능
- **상품 카탈로그**: 카테고리별 상품 브라우징 및 검색
- **장바구니**: 실시간 아이템 수 표시 및 관리
- **바로 구매**: 장바구니를 거치지 않는 즉시 주문
- **주문 관리**: 주문 생성, 상태 추적, 주문 내역 조회

### 💰 할인 시스템
- **정액 할인**: FIXED_AMOUNT 타입만 지원 (정률 할인 미지원)
- **조건부 할인**: 최소 주문 금액 기반 할인 적용
- **실시간 할인 계산**: 주문서에서 할인 선택 및 즉시 적용

### 📊 관리 기능
- **상품 관리**: 재고, 가격, 카테고리 관리
- **주문 상태**: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
- **사용자 관리**: 기본 사용자 정보 및 주문 이력

## 🚀 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: SQLite (Prisma ORM)
- **Styling**: Tailwind CSS 4
- **Build Tool**: Turbopack
- **Deployment**: Vercel Ready

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 설정
`.env` 파일을 생성하고 데이터베이스 URL을 설정합니다:
```env
DATABASE_URL="file:./prisma/dev.db"
```

### 3. 데이터베이스 초기화
```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 스키마 적용
npx prisma db push

# 시드 데이터 삽입
npm run db:seed
```

### 4. 개발 서버 실행
```bash
npm run dev
```

웹 브라우저에서 [http://localhost:3030](http://localhost:3030)으로 접속합니다.

## 📁 프로젝트 구조

```
figure-commerce/
├── prisma/
│   ├── schema.prisma          # 데이터베이스 스키마
│   ├── seed.ts               # 시드 데이터
│   └── dev.db               # SQLite 데이터베이스
├── src/
│   ├── app/
│   │   ├── api/             # API 라우트
│   │   ├── checkout/        # 주문서 페이지
│   │   ├── orders/          # 주문 관리
│   │   ├── products/        # 상품 페이지
│   │   └── layout.tsx       # 루트 레이아웃
│   ├── components/
│   │   ├── Header.tsx       # 헤더 (장바구니 아이콘 포함)
│   │   ├── ProductCard.tsx  # 상품 카드
│   │   └── ProductActions.tsx # 상품 액션 버튼
│   └── lib/
│       ├── prisma.ts        # Prisma 클라이언트
│       └── utils.ts         # 유틸리티 함수
```

## 🎯 시드 데이터

프로젝트에는 테스트를 위한 다음 데이터가 포함되어 있습니다:

- **👥 사용자**: 2명 (김철수, 이영희)
- **📂 카테고리**: 3개 (전자제품, 의류, 생활용품)
- **📦 상품**: 8개 (iPhone, MacBook, 의류, 생활용품 등)
- **🎟️ 할인정책**: 5개 (정액 할인만)
  - 첫 구매 5,000원 할인 (3만원 이상)
  - 신규회원 10,000원 할인 (5만원 이상)
  - VIP 회원 15,000원 할인 (8만원 이상)
  - 프리미엄 회원 25,000원 할인 (10만원 이상)
  - 주말 특가 7,000원 할인 (4만원 이상)

## 🐛 알려진 이슈

### 1. Google Fonts 로딩 실패
```
⚠ Failed to download `Geist` from Google Fonts. Using fallback font instead.
```
**해결책**: 네트워크 환경 문제로, fallback 폰트가 자동으로 적용됩니다.

### 2. Client Component 이벤트 핸들러 에러
```
⨯ Error: Event handlers cannot be passed to Client Component props.
```
**상태**: 기능에는 영향을 주지 않으며, 향후 수정 예정입니다.

## 🛠️ 개발 가이드

### API 엔드포인트

- `GET /api/cart?userId={id}` - 장바구니 조회
- `POST /api/cart` - 장바구니에 상품 추가
- `GET /api/discounts` - 활성 할인 목록
- `POST /api/discounts/apply` - 할인 적용 계산
- `POST /api/orders` - 주문 생성
- `GET /api/products/{id}` - 상품 상세 조회

### 데이터베이스 스키마 수정

스키마 변경 후:
```bash
npx prisma db push
npx prisma generate
```

### 새로운 시드 데이터 추가

`prisma/seed.ts` 파일을 수정한 후:
```bash
npm run db:seed
```

## 🚀 배포

### Vercel 배포
1. GitHub에 프로젝트 푸시
2. Vercel에서 프로젝트 연결
3. 환경 변수 설정
4. 자동 배포 완료

### 환경 변수 (프로덕션)
```env
DATABASE_URL="your-production-database-url"
```

## 📝 라이센스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**💡 Note**: 이 프로젝트는 교육/데모 목적으로 제작되었습니다.