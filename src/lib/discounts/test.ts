// 정액할인 테스트 스크립트
import { DiscountService, FixedAmountDiscount } from './index'
import type { DiscountData } from './types'

/**
 * 정액할인 기능 테스트
 */
export async function testFixedAmountDiscount() {
  console.log('🧪 정액할인 기능 테스트 시작')

  // 테스트용 정액할인 데이터
  const testDiscount: DiscountData = {
    id: 'test-fixed-discount',
    name: '신규회원 5000원 할인',
    description: '신규회원 대상 정액 할인',
    type: 'FIXED_AMOUNT',
    value: 5000,
    minAmount: 20000,
    maxAmount: null,
    isActive: true,
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2025-12-31')
  }

  // 테스트 케이스들
  const testCases = [
    {
      name: '정상 적용 (30,000원 주문)',
      totalAmount: 30000,
      expected: { discountAmount: 5000, finalAmount: 25000, isApplicable: true }
    },
    {
      name: '최소 주문 금액 미달 (15,000원 주문)',
      totalAmount: 15000,
      expected: { discountAmount: 0, finalAmount: 15000, isApplicable: false }
    },
    {
      name: '할인 금액이 총액보다 큰 경우 (3,000원 주문)',
      totalAmount: 3000,
      expected: { discountAmount: 3000, finalAmount: 0, isApplicable: true }
    },
    {
      name: '정확히 최소 금액 (20,000원 주문)',
      totalAmount: 20000,
      expected: { discountAmount: 5000, finalAmount: 15000, isApplicable: true }
    }
  ]

  let passCount = 0
  let totalTests = testCases.length

  for (const testCase of testCases) {
    console.log(`\n📝 테스트: ${testCase.name}`)
    
    try {
      const discount = new FixedAmountDiscount(testDiscount)
      const result = discount.apply({ totalAmount: testCase.totalAmount })
      
      const passed = 
        result.discountAmount === testCase.expected.discountAmount &&
        result.finalAmount === testCase.expected.finalAmount &&
        result.isApplicable === testCase.expected.isApplicable
      
      if (passed) {
        console.log('✅ 통과')
        console.log(`   할인금액: ${result.discountAmount}원, 최종금액: ${result.finalAmount}원`)
        passCount++
      } else {
        console.log('❌ 실패')
        console.log(`   예상: 할인 ${testCase.expected.discountAmount}원, 최종 ${testCase.expected.finalAmount}원, 적용가능 ${testCase.expected.isApplicable}`)
        console.log(`   실제: 할인 ${result.discountAmount}원, 최종 ${result.finalAmount}원, 적용가능 ${result.isApplicable}`)
        console.log(`   메시지: ${result.message}`)
      }
    } catch (error) {
      console.log('❌ 오류 발생:', error)
    }
  }

  console.log(`\n📊 테스트 결과: ${passCount}/${totalTests} 통과`)
  
  // Preview 기능 테스트
  console.log('\n🔍 Preview 기능 테스트')
  const discount = new FixedAmountDiscount(testDiscount)
  const preview30000 = discount.preview(30000)
  const preview15000 = discount.preview(15000)
  
  console.log(`30,000원: ${preview30000.message} (적용 가능: ${preview30000.canApply})`)
  console.log(`15,000원: ${preview15000.message} (적용 가능: ${preview15000.canApply})`)

  return passCount === totalTests
}

// Node.js 환경에서 직접 실행 시
if (require.main === module) {
  testFixedAmountDiscount().then(success => {
    console.log(success ? '\n🎉 모든 테스트 통과!' : '\n⚠️ 일부 테스트 실패')
    process.exit(success ? 0 : 1)
  })
}







