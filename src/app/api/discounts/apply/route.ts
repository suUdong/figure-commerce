import { NextRequest, NextResponse } from 'next/server'
import { DiscountService } from '@/lib/discounts'

// 할인 적용 계산
export async function POST(request: NextRequest) {
  try {
    const { discountId, totalAmount, items } = await request.json()

    if (!discountId || !totalAmount) {
      return NextResponse.json(
        { error: '할인 ID와 총 금액이 필요합니다' },
        { status: 400 }
      )
    }

    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: '올바른 총 금액을 입력해주세요' },
        { status: 400 }
      )
    }

    // 객체지향 할인 시스템을 통한 할인 적용
    const result = await DiscountService.applyDiscount(discountId, {
      totalAmount,
      items
    })

    if (!result.isApplicable) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      discount: result.discount,
      discountAmount: result.discountAmount,
      finalAmount: result.finalAmount,
      message: result.message
    })
  } catch (error) {
    console.error('할인 적용 오류:', error)
    return NextResponse.json(
      { error: '할인 적용 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}