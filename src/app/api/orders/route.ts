import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { calculateDiscount } from '@/lib/utils'

// 주문 목록 조회
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

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        discount: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('주문 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '주문 목록 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// 주문 생성
export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      items, 
      shippingAddress, 
      discountId,
      isDirect = false // 바로구매 여부
    } = await request.json()

    if (!userId || !items || !items.length || !shippingAddress) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다' },
        { status: 400 }
      )
    }

    // 트랜잭션으로 주문 처리
    const result = await prisma.$transaction(async (tx) => {
      // 상품들 조회 및 재고 확인
      const productIds = items.map((item: any) => item.productId)
      const products = await tx.product.findMany({
        where: { id: { in: productIds } }
      })

      // 총 금액 계산
      let totalAmount = 0
      const orderItems = []

      for (const item of items) {
        const product = products.find(p => p.id === item.productId)
        if (!product) {
          throw new Error(`상품 ${item.productId}를 찾을 수 없습니다`)
        }

        if (product.stock < item.quantity) {
          throw new Error(`${product.name}의 재고가 부족합니다`)
        }

        const itemTotal = product.price * item.quantity
        totalAmount += itemTotal

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price
        })
      }

      // 할인 적용
      let discountAmount = 0
      let discount = null

      if (discountId) {
        discount = await tx.discount.findUnique({
          where: { id: discountId }
        })

        if (discount && discount.isActive) {
          const now = new Date()
          if (discount.validFrom <= now && discount.validTo >= now) {
            discountAmount = calculateDiscount(
              totalAmount,
              discount.type as 'FIXED_AMOUNT' | 'PERCENTAGE',
              discount.value,
              discount.minAmount || undefined,
              discount.maxAmount || undefined
            )
          }
        }
      }

      const finalAmount = totalAmount - discountAmount

      // 주문 생성
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          discountAmount,
          finalAmount,
          discountId: discountId || null,
          shippingAddress,
          status: 'PENDING',
          items: {
            create: orderItems
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          discount: true
        }
      })

      // 재고 감소
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }

      // 바로구매가 아닌 경우에만 장바구니에서 주문한 상품들 삭제
      if (!isDirect) {
        await tx.cartItem.deleteMany({
          where: {
            userId,
            productId: { in: productIds }
          }
        })
      }

      return order
    })

    return NextResponse.json({
      message: '주문이 성공적으로 생성되었습니다',
      order: result
    })
  } catch (error) {
    console.error('주문 생성 오류:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '주문 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}