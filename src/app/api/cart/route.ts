import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// 장바구니 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다' },
        { status: 400 }
      )
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // 총 금액 계산
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity)
    }, 0)

    return NextResponse.json({
      items: cartItems,
      totalAmount,
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    })
  } catch (error) {
    console.error('장바구니 조회 오류:', error)
    return NextResponse.json(
      { error: '장바구니 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// 장바구니에 상품 추가
export async function POST(request: NextRequest) {
  try {
    const { userId, productId, quantity = 1 } = await request.json()

    if (!userId || !productId) {
      return NextResponse.json(
        { error: '사용자 ID와 상품 ID가 필요합니다' },
        { status: 400 }
      )
    }

    // 상품 존재 및 재고 확인
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: '존재하지 않는 상품입니다' },
        { status: 404 }
      )
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: '재고가 부족합니다' },
        { status: 400 }
      )
    }

    // 이미 장바구니에 있는 상품인지 확인
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    })

    let cartItem
    if (existingCartItem) {
      // 기존 수량에 추가
      const newQuantity = existingCartItem.quantity + quantity
      if (newQuantity > product.stock) {
        return NextResponse.json(
          { error: '재고를 초과할 수 없습니다' },
          { status: 400 }
        )
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: {
          product: {
            include: { category: true }
          }
        }
      })
    } else {
      // 새로운 장바구니 아이템 생성
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity
        },
        include: {
          product: {
            include: { category: true }
          }
        }
      })
    }

    return NextResponse.json({
      message: '장바구니에 추가되었습니다',
      cartItem
    })
  } catch (error) {
    console.error('장바구니 추가 오류:', error)
    return NextResponse.json(
      { error: '장바구니 추가 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}