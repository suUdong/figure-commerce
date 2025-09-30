import { DiscountData, DiscountCalculationParams, DiscountResult } from './types'

/**
 * 할인 계산을 위한 추상 클래스
 * Strategy 패턴을 적용하여 각 할인 타입별로 구체적인 구현을 제공
 */
export abstract class DiscountBase {
  protected readonly discountData: DiscountData

  constructor(discountData: DiscountData) {
    this.discountData = discountData
  }

  /**
   * 할인을 적용하고 결과를 반환하는 메인 메서드
   */
  public apply(params: DiscountCalculationParams): DiscountResult {
    // 할인 유효성 검증
    const validationResult = this.validate(params)
    if (!validationResult.isValid) {
      return {
        discountAmount: 0,
        finalAmount: params.totalAmount,
        isApplicable: false,
        message: validationResult.message
      }
    }

    // 구체적인 할인 계산 로직 호출
    const discountAmount = this.calculateDiscountAmount(params)
    const finalAmount = Math.max(0, params.totalAmount - discountAmount)

    return {
      discountAmount,
      finalAmount,
      isApplicable: true,
      message: `할인이 적용되었습니다. ${this.discountData.name}`
    }
  }

  /**
   * 각 할인 타입별로 구현해야 하는 추상 메서드
   */
  protected abstract calculateDiscountAmount(params: DiscountCalculationParams): number

  /**
   * 할인 적용 가능 여부 검증
   */
  protected validate(params: DiscountCalculationParams): { isValid: boolean; message: string } {
    // 활성화 상태 체크
    if (!this.discountData.isActive) {
      return { isValid: false, message: '비활성화된 할인입니다' }
    }

    // 유효 기간 체크
    const now = new Date()
    if (this.discountData.validFrom > now) {
      return { isValid: false, message: '할인 적용 기간이 아닙니다' }
    }
    if (this.discountData.validTo < now) {
      return { isValid: false, message: '할인 기간이 만료되었습니다' }
    }

    // 최소 주문 금액 체크
    if (this.discountData.minAmount && params.totalAmount < this.discountData.minAmount) {
      return { 
        isValid: false, 
        message: `최소 주문 금액 ${this.discountData.minAmount}원 이상이어야 합니다` 
      }
    }

    return { isValid: true, message: '할인 적용 가능' }
  }

  /**
   * 할인 정보 반환
   */
  public getDiscountInfo(): DiscountData {
    return { ...this.discountData }
  }

  /**
   * 할인명 반환
   */
  public getName(): string {
    return this.discountData.name
  }

  /**
   * 할인 타입 반환
   */
  public getType(): 'FIXED_AMOUNT' | 'PERCENTAGE' {
    return this.discountData.type
  }
}

