import { NextRequest, NextResponse } from 'next/server'
import { DiscountService } from '@/lib/discounts'

// 사용 가능한 할인 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const totalAmount = searchParams.get('totalAmount')

    // 총액이 제공된 경우 할인 미리보기 포함
    if (totalAmount) {
      const amount = parseInt(totalAmount, 10)
      if (isNaN(amount) || amount < 0) {
        return NextResponse.json(
          { error: '올바른 총액을 입력해주세요' },
          { status: 400 }
        )
      }

      const discountsPreview = await DiscountService.previewDiscounts(amount)
      return NextResponse.json({ 
        discounts: discountsPreview.map(p => p.discount),
        preview: discountsPreview
      })
    }

    // 기본 할인 목록 조회
    const discounts = await DiscountService.getAvailableDiscounts()
    return NextResponse.json({ discounts })
  } catch (error) {
    console.error('할인 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '할인 목록 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}