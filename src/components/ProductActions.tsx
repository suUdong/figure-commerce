'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: {
    name: string
  }
}

interface ProductActionsProps {
  product: Product
}

export default function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  // 현재는 하드코딩된 사용자 ID 사용 (실제로는 인증 시스템에서 가져와야 함)
  const userId = 'test-user-1'

  const handleAddToCart = async () => {
    if (product.stock === 0) return

    try {
      setLoading(true)
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          productId: product.id,
          quantity
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('장바구니에 추가되었습니다!')
      } else {
        alert(data.error || '장바구니 추가 중 오류가 발생했습니다')
      }
    } catch (error) {
      console.error('장바구니 추가 오류:', error)
      alert('장바구니 추가 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleDirectOrder = () => {
    if (product.stock === 0) return

    // URL 파라미터로 상품 정보 전달하여 주문서 페이지로 이동
    const params = new URLSearchParams({
      direct: 'true',
      productId: product.id,
      quantity: quantity.toString()
    })

    router.push(`/checkout?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
          수량:
        </label>
        <select 
          id="quantity" 
          name="quantity"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={product.stock === 0}
        >
          {[...Array(Math.min(product.stock, 10))].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>

      <div className="flex space-x-4">
        <button 
          onClick={handleAddToCart}
          disabled={product.stock === 0 || loading}
          className={`flex-1 px-6 py-3 rounded-md font-medium transition-colors ${
            product.stock > 0 && !loading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6-5V7a2 2 0 00-2-2H9a2 2 0 00-2 2v1" />
          </svg>
          {loading ? '처리 중...' : (product.stock > 0 ? '장바구니 담기' : '품절')}
        </button>
        
        <button 
          onClick={handleDirectOrder}
          disabled={product.stock === 0 || loading}
          className={`flex-1 px-6 py-3 rounded-md font-medium border-2 transition-colors ${
            product.stock > 0 && !loading
              ? 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
              : 'border-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          바로 구매
        </button>
      </div>
    </div>
  )
}