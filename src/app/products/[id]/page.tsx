import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import ProductActions from '@/components/ProductActions'
import { formatPrice } from '@/lib/utils'
import prisma from '@/lib/prisma'

interface ProductDetailPageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
    },
  })
  return product
}

async function getRelatedProducts(categoryId: string, currentProductId: string) {
  const products = await prisma.product.findMany({
    where: {
      categoryId,
      id: { not: currentProductId },
    },
    include: {
      category: true,
    },
    take: 4,
  })
  return products
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 뒤로가기 링크 */}
        <nav className="mb-8">
          <a 
            href="/products" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            상품 목록으로 돌아가기
          </a>
        </nav>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* 상품 이미지 */}
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg">이미지 없음</p>
                  </div>
                </div>
              )}
            </div>

            {/* 상품 정보 */}
            <div className="space-y-6">
              {/* 카테고리 및 재고 상태 */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {product.category.name}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock > 0 ? `재고 ${product.stock}개` : '품절'}
                </span>
              </div>

              {/* 상품명 */}
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>

              {/* 상품 설명 */}
              {product.description && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">상품 설명</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* 가격 */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">가격</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {formatPrice(product.price)}
                </p>
              </div>

              {/* 장바구니 추가 폼 */}
              <ProductActions product={product} />

              {/* 상품 정보 */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">상품 정보</h3>
                <dl className="space-y-2">
                  <div className="flex">
                    <dt className="w-24 text-sm font-medium text-gray-500">카테고리:</dt>
                    <dd className="text-sm text-gray-900">{product.category.name}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 text-sm font-medium text-gray-500">재고:</dt>
                    <dd className="text-sm text-gray-900">
                      {product.stock > 0 ? `${product.stock}개` : '품절'}
                    </dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 text-sm font-medium text-gray-500">등록일:</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(product.createdAt).toLocaleDateString('ko-KR')}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* 관련 상품 */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">관련 상품</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <a href={`/products/${relatedProduct.id}`}>
                    <div className="aspect-square bg-gray-200 flex items-center justify-center">
                      {relatedProduct.imageUrl ? (
                        <img 
                          src={relatedProduct.imageUrl} 
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-center">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs">이미지 없음</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-xl font-bold text-blue-600">
                        {formatPrice(relatedProduct.price)}
                      </p>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}