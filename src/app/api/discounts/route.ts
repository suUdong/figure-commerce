import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { calculateDiscount } from '@/lib/utils'

// 사용 가능한 할인 목록 조회
export async function GET() {
  try {
    const discounts = await prisma.discount.findMany({
      where: {
        isActive: true,
        validFrom: { lte: new Date() },
        validTo: { gte: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ discounts })
  } catch (error) {
    console.error('할인 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '할인 목록 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}