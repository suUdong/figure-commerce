import { DiscountBase } from './DiscountBase'
import { DiscountCalculationParams } from './types'

/**
 * 정액 할인 구현 클래스
 * 고정된 금액만큼 할인을 적용합니다.
 */
export class FixedAmountDiscount extends DiscountBase {
  /**
   * 정액 할인 금액 계산
   * @param params 할인 계산에 필요한 파라미터
   * @returns 할인 금액
   */
  protected calculateDiscountAmount(params: DiscountCalculationParams): number {
    const { totalAmount } = params
    const discountValue = this.discountData.value

    // 정액 할인: 설정된 금액만큼 할인
    // 할인 금액이 총 주문 금액을 초과하지 않도록 제한
    return Math.min(discountValue, totalAmount)
  }

  /**
   * 정액 할인에 대한 설명 반환
   */
  public getDescription(): string {
    const { value, minAmount } = this.discountData
    const minAmountText = minAmount ? ` (${minAmount}원 이상 구매 시)` : ''
    return `${value}원 할인${minAmountText}`
  }

  /**
   * 할인 적용 가능 여부와 예상 할인 금액 미리보기
   */
  public preview(totalAmount: number): { canApply: boolean; discountAmount: number; message: string } {
    if (!this.discountData.isActive) {
      return { canApply: false, discountAmount: 0, message: '비활성화된 할인입니다' }
    }

    const now = new Date()
    if (this.discountData.validFrom > now || this.discountData.validTo < now) {
      return { canApply: false, discountAmount: 0, message: '할인 적용 기간이 아닙니다' }
    }

    if (this.discountData.minAmount && totalAmount < this.discountData.minAmount) {
      const remainingAmount = this.discountData.minAmount - totalAmount
      return { 
        canApply: false, 
        discountAmount: 0, 
        message: `${remainingAmount}원 더 구매하시면 할인이 적용됩니다` 
      }
    }

    const discountAmount = Math.min(this.discountData.value, totalAmount)
    return { 
      canApply: true, 
      discountAmount, 
      message: `${discountAmount}원 할인이 적용됩니다` 
    }
  }
}

