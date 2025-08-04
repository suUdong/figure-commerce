import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// 주문 상세 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        },
        discount: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: '주문을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('주문 조회 오류:', error)
    return NextResponse.json(
      { error: '주문 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// 주문 상태 업데이트
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json(
        { error: '주문 상태가 필요합니다' },
        { status: 400 }
      )
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: '올바르지 않은 주문 상태입니다' },
        { status: 400 }
      )
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true
          }
        },
        discount: true
      }
    })

    return NextResponse.json({
      message: '주문 상태가 업데이트되었습니다',
      order
    })
  } catch (error) {
    console.error('주문 상태 업데이트 오류:', error)
    return NextResponse.json(
      { error: '주문 상태 업데이트 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}