import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import { formatPrice } from '@/lib/utils'
import prisma from '@/lib/prisma'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

async function getOrder(id: string) {
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
  return order
}

const statusMessages = {
  PENDING: { text: '주문 대기', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { text: '주문 확인', color: 'bg-blue-100 text-blue-800' },
  SHIPPED: { text: '배송 중', color: 'bg-purple-100 text-purple-800' },
  DELIVERED: { text: '배송 완료', color: 'bg-green-100 text-green-800' },
  CANCELLED: { text: '주문 취소', color: 'bg-red-100 text-red-800' }
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  const statusInfo = statusMessages[order.status as keyof typeof statusMessages]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 주문 성공 메시지 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-green-800">주문이 완료되었습니다!</h1>
              <p className="text-green-700 mt-1">주문번호: {order.id}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 주문 상세 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 주문 상태 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">주문 상태</h2>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
                <span className="text-sm text-gray-600">
                  주문일시: {new Date(order.createdAt).toLocaleString('ko-KR')}
                </span>
              </div>
            </div>

            {/* 주문 상품 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">주문 상품</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
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
                      <p className="text-sm text-gray-600">주문 당시 가격: {formatPrice(item.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 배송 정보 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">배송 정보</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">받는 분:</span>
                  <span className="ml-2 text-gray-900">{order.user.name}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">연락처:</span>
                  <span className="ml-2 text-gray-900">{order.user.email}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">배송 주소:</span>
                  <span className="ml-2 text-gray-900">{order.shippingAddress}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 결제 정보 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">결제 정보</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">상품 금액</span>
                  <span className="font-medium">{formatPrice(order.totalAmount)}</span>
                </div>
                
                {order.discountAmount > 0 && order.discount && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-red-600">
                      <span>할인 금액</span>
                      <span className="font-medium">-{formatPrice(order.discountAmount)}</span>
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <div className="font-medium">{order.discount.name}</div>
                      {order.discount.description && (
                        <div className="mt-1">{order.discount.description}</div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">배송비</span>
                  <span className="font-medium">무료</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>총 결제 금액</span>
                    <span className="text-blue-600">{formatPrice(order.finalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="space-y-3">
              <a
                href="/products"
                className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                계속 쇼핑하기
              </a>
              
              {order.status === 'PENDING' && (
                <button
                  className="block w-full bg-red-600 text-white text-center py-3 px-4 rounded-md font-medium hover:bg-red-700 transition-colors"
                  onClick={() => {
                    if (confirm('정말 주문을 취소하시겠습니까?')) {
                      // 주문 취소 로직 (향후 구현)
                      alert('주문 취소 기능은 향후 구현될 예정입니다.')
                    }
                  }}
                >
                  주문 취소
                </button>
              )}
            </div>

            {/* 주문 관련 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">주문 안내</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 주문 확인 후 1-2일 내 배송 시작</li>
                <li>• 배송 조회는 마이페이지에서 확인</li>
                <li>• 문의사항은 고객센터로 연락</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}