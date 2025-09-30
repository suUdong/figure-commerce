import prisma from '@/lib/prisma'
import { DiscountFactory } from './DiscountFactory'
import { DiscountData, DiscountCalculationParams, DiscountResult } from './types'

/**
 * 할인 관련 비즈니스 로직을 담당하는 서비스 클래스
 */
export class DiscountService {
  /**
   * 할인 ID로 할인 적용
   * @param discountId 할인 ID
   * @param params 할인 계산 파라미터
   * @returns 할인 적용 결과
   */
  public static async applyDiscount(
    discountId: string, 
    params: DiscountCalculationParams
  ): Promise<DiscountResult & { discount?: DiscountData }> {
    try {
      // DB에서 할인 정보 조회
      const discountData = await prisma.discount.findUnique({
        where: { id: discountId }
      })

      if (!discountData) {
        return {
          discountAmount: 0,
          finalAmount: params.totalAmount,
          isApplicable: false,
          message: '존재하지 않는 할인입니다'
        }
      }

      // Prisma 데이터를 DiscountData 타입으로 변환
      const discountInfo: DiscountData = {
        id: discountData.id,
        name: discountData.name,
        description: discountData.description,
        type: discountData.type as 'FIXED_AMOUNT' | 'PERCENTAGE',
        value: discountData.value,
        minAmount: discountData.minAmount,
        maxAmount: discountData.maxAmount,
        isActive: discountData.isActive,
        validFrom: discountData.validFrom,
        validTo: discountData.validTo
      }

      // Factory를 통해 할인 객체 생성
      const discount = DiscountFactory.createDiscount(discountInfo)

      // 할인 적용
      const result = discount.apply(params)

      return {
        ...result,
        discount: discountInfo
      }
    } catch (error) {
      console.error('할인 적용 중 오류 발생:', error)
      
      if (error instanceof Error && error.message.includes('구현되지 않았습니다')) {
        return {
          discountAmount: 0,
          finalAmount: params.totalAmount,
          isApplicable: false,
          message: error.message
        }
      }

      return {
        discountAmount: 0,
        finalAmount: params.totalAmount,
        isApplicable: false,
        message: '할인 적용 중 오류가 발생했습니다'
      }
    }
  }

  /**
   * 사용 가능한 할인 목록 조회
   * @returns 활성화된 할인 목록
   */
  public static async getAvailableDiscounts(): Promise<DiscountData[]> {
    try {
      const discounts = await prisma.discount.findMany({
        where: {
          isActive: true,
          validFrom: { lte: new Date() },
          validTo: { gte: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      })

      return discounts.map(discount => ({
        id: discount.id,
        name: discount.name,
        description: discount.description,
        type: discount.type as 'FIXED_AMOUNT' | 'PERCENTAGE',
        value: discount.value,
        minAmount: discount.minAmount,
        maxAmount: discount.maxAmount,
        isActive: discount.isActive,
        validFrom: discount.validFrom,
        validTo: discount.validTo
      }))
    } catch (error) {
      console.error('할인 목록 조회 중 오류 발생:', error)
      return []
    }
  }

  /**
   * 특정 총액에 대해 적용 가능한 할인들의 미리보기
   * @param totalAmount 총 주문 금액
   * @returns 적용 가능한 할인들의 미리보기 정보
   */
  public static async previewDiscounts(totalAmount: number): Promise<Array<{
    discount: DiscountData
    canApply: boolean
    discountAmount: number
    finalAmount: number
    message: string
  }>> {
    try {
      const availableDiscounts = await this.getAvailableDiscounts()
      const supportedDiscounts = availableDiscounts.filter(d => 
        DiscountFactory.isDiscountTypeSupported(d.type)
      )

      return supportedDiscounts.map(discountData => {
        try {
          const discount = DiscountFactory.createDiscount(discountData)
          
          if ('preview' in discount && typeof discount.preview === 'function') {
            const preview = (discount as any).preview(totalAmount)
            return {
              discount: discountData,
              canApply: preview.canApply,
              discountAmount: preview.discountAmount,
              finalAmount: totalAmount - preview.discountAmount,
              message: preview.message
            }
          }

          // preview 메서드가 없는 경우 apply 메서드 사용
          const result = discount.apply({ totalAmount })
          return {
            discount: discountData,
            canApply: result.isApplicable,
            discountAmount: result.discountAmount,
            finalAmount: result.finalAmount,
            message: result.message
          }
        } catch (error) {
          return {
            discount: discountData,
            canApply: false,
            discountAmount: 0,
            finalAmount: totalAmount,
            message: error instanceof Error ? error.message : '할인 처리 중 오류 발생'
          }
        }
      })
    } catch (error) {
      console.error('할인 미리보기 중 오류 발생:', error)
      return []
    }
  }
}

