// 할인 관련 클래스 및 타입 export
export { DiscountBase } from './DiscountBase'
export { FixedAmountDiscount } from './FixedAmountDiscount'
export { DiscountFactory } from './DiscountFactory'
export { DiscountService } from './DiscountService'
export type { DiscountData, DiscountCalculationParams, DiscountResult } from './types'

// 기존 utils.ts의 calculateDiscount 함수를 대체하는 헬퍼 함수
export async function calculateDiscount(
  discountId: string,
  totalAmount: number,
  items?: Array<{ productId: string; quantity: number; price: number }>
) {
  const result = await DiscountService.applyDiscount(discountId, {
    totalAmount,
    items
  })
  
  return result.discountAmount
}

