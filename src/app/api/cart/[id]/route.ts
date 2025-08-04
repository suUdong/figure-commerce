import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// 장바구니 아이템 수량 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { quantity } = await request.json()

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: '올바른 수량을 입력해주세요' },
        { status: 400 }
      )
    }

    // 장바구니 아이템 조회
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { product: true }
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: '장바구니 아이템을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 재고 확인
    if (quantity > cartItem.product.stock) {
      return NextResponse.json(
        { error: '재고를 초과할 수 없습니다' },
        { status: 400 }
      )
    }

    // 수량 업데이트
    const updatedCartItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product: {
          include: { category: true }
        }
      }
    })

    return NextResponse.json({
      message: '수량이 변경되었습니다',
      cartItem: updatedCartItem
    })
  } catch (error) {
    console.error('장바구니 수정 오류:', error)
    return NextResponse.json(
      { error: '장바구니 수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// 장바구니 아이템 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const cartItem = await prisma.cartItem.findUnique({
      where: { id }
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: '장바구니 아이템을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    await prisma.cartItem.delete({
      where: { id }
    })

    return NextResponse.json({
      message: '장바구니에서 삭제되었습니다'
    })
  } catch (error) {
    console.error('장바구니 삭제 오류:', error)
    return NextResponse.json(
      { error: '장바구니 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}