import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { calculateDiscount } from '@/lib/utils'

// 할인 적용 계산
export async function POST(request: NextRequest) {
  try {
    const { discountId, totalAmount } = await request.json()

    if (!discountId || !totalAmount) {
      return NextResponse.json(
        { error: '할인 ID와 총 금액이 필요합니다' },
        { status: 400 }
      )
    }

    // 할인 정보 조회
    const discount = await prisma.discount.findUnique({
      where: { id: discountId }
    })

    if (!discount) {
      return NextResponse.json(
        { error: '존재하지 않는 할인입니다' },
        { status: 404 }
      )
    }

    // 할인 유효성 검사
    if (!discount.isActive) {
      return NextResponse.json(
        { error: '비활성화된 할인입니다' },
        { status: 400 }
      )
    }

    // 정률 할인은 현재 지원하지 않음
    if (discount.type === 'PERCENTAGE') {
      return NextResponse.json(
        { error: '정률 할인은 현재 지원하지 않습니다' },
        { status: 400 }
      )
    }

    const now = new Date()
    if (discount.validFrom > now || discount.validTo < now) {
      return NextResponse.json(
        { error: '할인 적용 기간이 아닙니다' },
        { status: 400 }
      )
    }

    // 할인 금액 계산
    const discountAmount = calculateDiscount(
      totalAmount,
      discount.type as 'FIXED_AMOUNT' | 'PERCENTAGE',
      discount.value,
      discount.minAmount || undefined,
      discount.maxAmount || undefined
    )

    if (discountAmount === 0) {
      return NextResponse.json(
        { error: '할인 조건에 맞지 않습니다' },
        { status: 400 }
      )
    }

    const finalAmount = totalAmount - discountAmount

    return NextResponse.json({
      discount,
      discountAmount,
      finalAmount,
      message: '할인이 적용되었습니다'
    })
  } catch (error) {
    console.error('할인 적용 오류:', error)
    return NextResponse.json(
      { error: '할인 적용 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}