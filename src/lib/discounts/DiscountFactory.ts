import { DiscountBase } from './DiscountBase'
import { FixedAmountDiscount } from './FixedAmountDiscount'
import { DiscountData } from './types'

/**
 * 할인 객체 생성을 위한 Factory 클래스
 * Factory 패턴을 적용하여 할인 타입에 따라 적절한 할인 객체를 생성합니다.
 */
export class DiscountFactory {
  /**
   * 할인 데이터를 기반으로 적절한 할인 객체를 생성
   * @param discountData Prisma에서 조회된 할인 데이터
   * @returns 해당 타입에 맞는 할인 객체
   */
  public static createDiscount(discountData: DiscountData): DiscountBase {
    switch (discountData.type) {
      case 'FIXED_AMOUNT':
        return new FixedAmountDiscount(discountData)
      
      case 'PERCENTAGE':
        // TODO: 나중에 PercentageDiscount 클래스 구현 시 추가
        throw new Error('정률 할인은 아직 구현되지 않았습니다. 정액 할인만 사용 가능합니다.')
      
      default:
        throw new Error(`지원하지 않는 할인 타입입니다: ${discountData.type}`)
    }
  }

  /**
   * 할인 타입별 사용 가능한 할인 목록 반환
   */
  public static getSupportedDiscountTypes(): string[] {
    return ['FIXED_AMOUNT']
  }

  /**
   * 할인 타입이 지원되는지 확인
   */
  public static isDiscountTypeSupported(type: string): boolean {
    return this.getSupportedDiscountTypes().includes(type)
  }
}

