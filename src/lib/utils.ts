// 가격 포맷팅 함수
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price)
}

// 할인 금액 계산 함수
export function calculateDiscount(
  totalAmount: number,
  discountType: 'FIXED_AMOUNT' | 'PERCENTAGE',
  discountValue: number,
  minAmount?: number,
  maxAmount?: number
): number {
  // 최소 주문 금액 체크
  if (minAmount && totalAmount < minAmount) {
    return 0
  }

  let discountAmount = 0

  if (discountType === 'FIXED_AMOUNT') {
    discountAmount = discountValue
  } else if (discountType === 'PERCENTAGE') {
    discountAmount = Math.floor((totalAmount * discountValue) / 100)
    
    // 최대 할인 금액 체크
    if (maxAmount && discountAmount > maxAmount) {
      discountAmount = maxAmount
    }
  }

  // 할인 금액이 총 금액을 초과하지 않도록 제한
  return Math.min(discountAmount, totalAmount)
}