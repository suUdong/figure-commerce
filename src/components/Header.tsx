'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Header() {
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // 현재는 하드코딩된 사용자 ID 사용 (실제로는 인증 시스템에서 가져와야 함)
  const userId = 'cmdy6ozgb0000qis4qjrb6z7z'

  const fetchCartCount = async () => {
    try {
      const response = await fetch(`/api/cart?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setCartCount(data.totalItems || 0)
      }
    } catch (error) {
      console.error('장바구니 수량 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCartCount()
    
    // 10초마다 장바구니 수량 새로고침 (실제로는 상태관리나 이벤트로 처리하는 것이 좋음)
    const interval = setInterval(fetchCartCount, 10000)
    
    return () => clearInterval(interval)
  }, [])

  // 전역 이벤트로 장바구니 업데이트 감지
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartCount()
    }

    window.addEventListener('cart-updated', handleCartUpdate)
    return () => window.removeEventListener('cart-updated', handleCartUpdate)
  }, [])
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              FigureShop
            </Link>
          </div>

          {/* 네비게이션 메뉴 */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              홈
            </Link>
            <Link 
              href="/products" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              상품
            </Link>
            <Link 
              href="/categories" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              카테고리
            </Link>
          </nav>

          {/* 우측 액션 버튼들 */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/checkout" 
              className="relative text-gray-700 hover:text-blue-600 p-2 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6-5V7a2 2 0 00-2-2H9a2 2 0 00-2 2v1" />
              </svg>
              {/* 장바구니 아이템 수 배지 */}
              {!loading && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
              {loading && (
                <span className="absolute -top-1 -right-1 bg-gray-300 text-gray-600 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                </span>
              )}
            </Link>
            <Link 
              href="/profile" 
              className="text-gray-700 hover:text-blue-600 p-2 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}