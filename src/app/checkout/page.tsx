'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { formatPrice } from '@/lib/utils'

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    imageUrl: string | null
    category: {
      name: string
    }
  }
}

interface Discount {
  id: string
  name: string
  description: string | null
  type: 'FIXED_AMOUNT' | 'PERCENTAGE'
  value: number
  minAmount: number | null
  maxAmount: number | null
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [selectedDiscount, setSelectedDiscount] = useState<string>('')
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [finalAmount, setFinalAmount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [ordering, setOrdering] = useState<boolean>(false)
  const [shippingAddress, setShippingAddress] = useState<string>('')

  // 현재는 하드코딩된 사용자 ID 사용 (실제로는 인증 시스템에서 가져와야 함)
  const userId = 'test-user-1'

  useEffect(() => {
    loadDataBasedOnMode()
  }, [])

  const loadDataBasedOnMode = async () => {
    try {
      setLoading(true)
      
      // URL 파라미터 확인
      const urlParams = new URLSearchParams(window.location.search)
      const isDirect = urlParams.get('direct') === 'true'
      const productId = urlParams.get('productId')
      const quantity = parseInt(urlParams.get('quantity') || '1')

      if (isDirect && productId) {
        // 바로구매 - 특정 상품만 주문
        await loadDirectOrderData(productId, quantity)
      } else {
        // 일반 주문 - 장바구니에서 주문
        await loadCartData()
      }

      // 할인 정보 로드
      const discountResponse = await fetch('/api/discounts')
      const discountData = await discountResponse.json()
      
      if (discountData.discounts) {
        setDiscounts(discountData.discounts)
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error)
      alert('데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const loadDirectOrderData = async (productId: string, quantity: number) => {
    // 상품 정보 직접 조회
    const response = await fetch(`/api/products/${productId}`)
    const data = await response.json()
    
    if (data.product) {
      const product = data.product
      const mockCartItem: CartItem = {
        id: 'direct-order',
        quantity: quantity,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          category: product.category
        }
      }
      
      const total = product.price * quantity
      setCartItems([mockCartItem])
      setTotalAmount(total)
      setFinalAmount(total)
    }
  }

  const loadCartData = async () => {
    // 장바구니 데이터 로드
    const cartResponse = await fetch(`/api/cart?userId=${userId}`)
    const cartData = await cartResponse.json()
    
    if (cartData.items) {
      setCartItems(cartData.items)
      setTotalAmount(cartData.totalAmount)
      setFinalAmount(cartData.totalAmount)
    }
  }

  const applyDiscount = async (discountId: string) => {
    if (!discountId) {
      setDiscountAmount(0)
      setFinalAmount(totalAmount)
      return
    }

    try {
      const response = await fetch('/api/discounts/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          discountId,
          totalAmount
        })
      })

      const data = await response.json()

      if (response.ok) {
        setDiscountAmount(data.discountAmount)
        setFinalAmount(data.finalAmount)
      } else {
        alert(data.error || '할인 적용 중 오류가 발생했습니다')
        setSelectedDiscount('')
        setDiscountAmount(0)
        setFinalAmount(totalAmount)
      }
    } catch (error) {
      console.error('할인 적용 오류:', error)
      alert('할인 적용 중 오류가 발생했습니다')
    }
  }

  const handleDiscountChange = (discountId: string) => {
    setSelectedDiscount(discountId)
    applyDiscount(discountId)
  }

  const handleOrder = async () => {
    if (!shippingAddress.trim()) {
      alert('배송 주소를 입력해주세요')
      return
    }

    if (cartItems.length === 0) {
      alert('장바구니가 비어있습니다')
      return
    }

    try {
      setOrdering(true)

      // URL 파라미터에서 바로구매 여부 확인
      const urlParams = new URLSearchParams(window.location.search)
      const isDirect = urlParams.get('direct') === 'true'

      const orderData = {
        userId,
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        shippingAddress: shippingAddress.trim(),
        discountId: selectedDiscount || null,
        isDirect // 바로구매 여부 전달
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()

      if (response.ok) {
        alert('주문이 성공적으로 완료되었습니다!')
        router.push(`/orders/${data.order.id}`)
      } else {
        alert(data.error || '주문 처리 중 오류가 발생했습니다')
      }
    } catch (error) {
      console.error('주문 처리 오류:', error)
      alert('주문 처리 중 오류가 발생했습니다')
    } finally {
      setOrdering(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">주문 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">장바구니가 비어있습니다</h1>
            <p className="text-gray-600 mb-8">상품을 장바구니에 담아주세요</p>
            <a 
              href="/products" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              상품 둘러보기
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">주문서</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 주문 상품 목록 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">주문 상품</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0">
                      {item.product.imageUrl ? (
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">{item.product.category.name}</p>
                      <p className="text-sm text-gray-600">수량: {item.quantity}개</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-600">
                        개당 {formatPrice(item.product.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 배송 정보 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">배송 정보</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    배송 주소 *
                  </label>
                  <textarea
                    id="address"
                    rows={3}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="배송받을 주소를 상세히 입력해주세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 주문 요약 및 할인 적용 */}
          <div className="space-y-6">
            {/* 할인 쿠폰 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">할인 혜택</h2>
              <div className="space-y-3">
                <div>
                  <input
                    type="radio"
                    id="no-discount"
                    name="discount"
                    value=""
                    checked={selectedDiscount === ''}
                    onChange={(e) => handleDiscountChange(e.target.value)}
                    className="mr-2"
                  />
                  <label htmlFor="no-discount" className="text-sm text-gray-700">
                    할인 적용 안함
                  </label>
                </div>
                {discounts.map((discount) => (
                  <div key={discount.id}>
                    <input
                      type="radio"
                      id={discount.id}
                      name="discount"
                      value={discount.id}
                      checked={selectedDiscount === discount.id}
                      onChange={(e) => handleDiscountChange(e.target.value)}
                      className="mr-2"
                    />
                    <label htmlFor={discount.id} className="text-sm text-gray-700">
                      <div>
                        <span className="font-medium">{discount.name}</span>
                        <div className="text-xs text-gray-500 mt-1">
                          {discount.type === 'FIXED_AMOUNT' 
                            ? `${formatPrice(discount.value)} 할인`
                            : `${discount.value}% 할인`
                          }
                          {discount.minAmount && (
                            <span> (최소 {formatPrice(discount.minAmount)} 이상 주문시)</span>
                          )}
                          {discount.maxAmount && discount.type === 'PERCENTAGE' && (
                            <span> (최대 {formatPrice(discount.maxAmount)})</span>
                          )}
                        </div>
                        {discount.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {discount.description}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* 결제 요약 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">결제 요약</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">상품 금액</span>
                  <span className="font-medium">{formatPrice(totalAmount)}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>할인 금액</span>
                    <span className="font-medium">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">배송비</span>
                  <span className="font-medium">무료</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>총 결제 금액</span>
                    <span className="text-blue-600">{formatPrice(finalAmount)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleOrder}
                disabled={ordering || !shippingAddress.trim()}
                className={`w-full mt-6 py-3 px-4 rounded-md font-medium transition-colors ${
                  ordering || !shippingAddress.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {ordering ? '주문 처리 중...' : `${formatPrice(finalAmount)} 결제하기`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}