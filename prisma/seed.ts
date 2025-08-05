// import { PrismaClient } from '../src/generated/prisma'
const { PrismaClient } = require('../src/generated/prisma')

const prisma = new PrismaClient()

async function main() {
  // 기존 데이터 삭제
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.discount.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  console.log('기존 데이터 삭제 완료')

  // 사용자 생성
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'test1@example.com',
        name: '김철수',
        phone: '010-1234-5678',
        address: '서울시 강남구 테헤란로 123'
      }
    }),
    prisma.user.create({
      data: {
        email: 'test2@example.com',
        name: '이영희',
        phone: '010-9876-5432',
        address: '서울시 서초구 반포대로 456'
      }
    })
  ])

  console.log('사용자 생성 완료')
  console.log(`첫 번째 사용자 ID: ${users[0].id}`)
  console.log(`두 번째 사용자 ID: ${users[1].id}`)

  // 카테고리 생성
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: '전자제품',
        description: '스마트폰, 노트북, 태블릿 등'
      }
    }),
    prisma.category.create({
      data: {
        name: '의류',
        description: '남성의류, 여성의류, 아동의류'
      }
    }),
    prisma.category.create({
      data: {
        name: '생활용품',
        description: '주방용품, 생활잡화, 인테리어 소품'
      }
    })
  ])

  console.log('카테고리 생성 완료')

  // 상품 생성
  const products = await Promise.all([
    // 전자제품
    prisma.product.create({
      data: {
        name: 'iPhone 15 Pro',
        description: '최신 애플 스마트폰, 256GB',
        price: 1390000,
        imageUrl: '/images/iphone15pro.svg',
        stock: 50,
        categoryId: categories[0].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'MacBook Air M3',
        description: '13인치 MacBook Air, 8GB RAM, 256GB SSD',
        price: 1590000,
        imageUrl: '/images/macbook-air.svg',
        stock: 30,
        categoryId: categories[0].id
      }
    }),
    prisma.product.create({
      data: {
        name: 'Samsung Galaxy Tab S9',
        description: '11인치 안드로이드 태블릿, 128GB',
        price: 890000,
        imageUrl: '/images/galaxy-tab.svg',
        stock: 25,
        categoryId: categories[0].id
      }
    }),
    // 의류
    prisma.product.create({
      data: {
        name: '남성 정장 셔츠',
        description: '100% 면 소재, 화이트',
        price: 49000,
        imageUrl: '/images/mens-shirt.svg',
        stock: 100,
        categoryId: categories[1].id
      }
    }),
    prisma.product.create({
      data: {
        name: '여성 원피스',
        description: '플로럴 패턴, A라인 원피스',
        price: 89000,
        imageUrl: '/images/womens-dress.svg',
        stock: 80,
        categoryId: categories[1].id
      }
    }),
    prisma.product.create({
      data: {
        name: '청바지',
        description: '슬림핏 데님 청바지',
        price: 79000,
        imageUrl: '/images/jeans.svg',
        stock: 120,
        categoryId: categories[1].id
      }
    }),
    // 생활용품
    prisma.product.create({
      data: {
        name: '스테인레스 텀블러',
        description: '보온보냉 텀블러, 500ml',
        price: 25000,
        imageUrl: '/images/tumbler.svg',
        stock: 200,
        categoryId: categories[2].id
      }
    }),
    prisma.product.create({
      data: {
        name: '무선 충전기',
        description: 'Qi 호환 무선 충전패드',
        price: 35000,
        imageUrl: '/images/wireless-charger.svg',
        stock: 150,
        categoryId: categories[2].id
      }
    })
  ])

  console.log('상품 생성 완료')

  // 할인 정책 생성 (쉽게 테스트할 수 있도록 조건 완화)
  const discounts = await Promise.all([
    prisma.discount.create({
      data: {
        name: '첫 구매 5,000원 할인',
        description: '첫 구매 고객 대상 즉시 할인',
        type: 'FIXED_AMOUNT',
        value: 5000,
        minAmount: 30000, // 3만원 이상 구매시
        isActive: true,
        validFrom: new Date('2025-01-01'),
        validTo: new Date('2025-12-31')
      }
    }),
    prisma.discount.create({
      data: {
        name: '신규회원 10,000원 할인',
        description: '신규 가입 고객 대상 특별 할인',
        type: 'FIXED_AMOUNT',
        value: 10000,
        minAmount: 50000, // 5만원 이상 구매시
        isActive: true,
        validFrom: new Date('2025-01-01'),
        validTo: new Date('2025-12-31')
      }
    }),
    prisma.discount.create({
      data: {
        name: 'VIP 회원 15,000원 할인',
        description: 'VIP 회원 대상 특별 할인',
        type: 'FIXED_AMOUNT',
        value: 15000,
        minAmount: 80000, // 8만원 이상 구매시
        isActive: true,
        validFrom: new Date('2025-01-01'),
        validTo: new Date('2025-12-31')
      }
    }),
    prisma.discount.create({
      data: {
        name: '프리미엄 회원 25,000원 할인',
        description: '프리미엄 회원 대상 최대 할인',
        type: 'FIXED_AMOUNT',
        value: 25000,
        minAmount: 100000, // 10만원 이상 구매시
        isActive: true,
        validFrom: new Date('2025-01-01'),
        validTo: new Date('2025-12-31')
      }
    }),
    prisma.discount.create({
      data: {
        name: '주말 특가 7,000원 할인',
        description: '주말 한정 특가 할인',
        type: 'FIXED_AMOUNT',
        value: 7000,
        minAmount: 40000, // 4만원 이상 구매시
        isActive: true,
        validFrom: new Date('2025-01-01'),
        validTo: new Date('2025-12-31')
      }
    })
  ])

  console.log('할인 정책 생성 완료')

  // 장바구니 아이템 생성
  await Promise.all([
    prisma.cartItem.create({
      data: {
        userId: users[0].id,
        productId: products[0].id,
        quantity: 1
      }
    }),
    prisma.cartItem.create({
      data: {
        userId: users[0].id,
        productId: products[6].id,
        quantity: 2
      }
    }),
    prisma.cartItem.create({
      data: {
        userId: users[1].id,
        productId: products[4].id,
        quantity: 1
      }
    })
  ])

  console.log('장바구니 아이템 생성 완료')

  // 샘플 주문 생성
  const sampleOrder = await prisma.order.create({
    data: {
      userId: users[0].id,
      status: 'CONFIRMED',
      totalAmount: 1440000, // iPhone + 텀블러 2개
      discountAmount: 10000, // 신규가입 할인
      finalAmount: 1430000,
      discountId: discounts[0].id,
      shippingAddress: '서울시 강남구 테헤란로 123',
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
            price: 1390000
          },
          {
            productId: products[6].id,
            quantity: 2,
            price: 25000
          }
        ]
      }
    }
  })

  console.log('샘플 주문 생성 완료')

  console.log('🌱 시드 데이터 생성이 완료되었습니다!')
  console.log(`📊 데이터 요약:`)
  console.log(`  👥 사용자: ${users.length}명`)
  console.log(`  📂 카테고리: ${categories.length}개`)
  console.log(`  📦 상품: ${products.length}개`)
  console.log(`  🎟️ 할인정책: ${discounts.length}개 (정액할인만)`)
  console.log(`  🛒 장바구니 아이템: 3개`)
  console.log(`  📋 샘플 주문: 1개`)
  console.log('')
  console.log('🔥 테스트 가능한 할인:')
  console.log('  • 첫 구매 5,000원 할인 (3만원 이상)')
  console.log('  • 신규회원 10,000원 할인 (5만원 이상)')
  console.log('  • VIP 회원 15,000원 할인 (8만원 이상)')
  console.log('  • 프리미엄 회원 25,000원 할인 (10만원 이상)')
  console.log('  • 주말 특가 7,000원 할인 (4만원 이상)')
  console.log('')
  console.log('🌐 서버 주소: http://localhost:3030')
}

main()
  .catch((e) => {
    console.error('시드 데이터 생성 중 오류가 발생했습니다:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })