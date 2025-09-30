// 할인 관련 타입 정의
export interface DiscountData {
  id: string
  name: string
  description?: string | null
  type: 'FIXED_AMOUNT' | 'PERCENTAGE'
  value: number
  minAmount?: number | null
  maxAmount?: number | null
  isActive: boolean
  validFrom: Date
  validTo: Date
}

export interface DiscountCalculationParams {
  totalAmount: number
  items?: Array<{
    productId: string
    quantity: number
    price: number
  }>
}

export interface DiscountResult {
  discountAmount: number
  finalAmount: number
  isApplicable: boolean
  message: string
}

