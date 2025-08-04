import { Suspense } from 'react'
import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import prisma from '@/lib/prisma'

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; search?: string }>
}

async function getProducts(categoryId?: string, searchTerm?: string) {
  const products = await prisma.product.findMany({
    where: {
      ...(categoryId && { categoryId }),
      ...(searchTerm && {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ]
      })
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  return products
}

async function getCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  })
  return categories
}

function ProductsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-200"></div>
          <div className="p-4">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

async function ProductsList({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const { category, search } = params
  
  const [products, categories] = await Promise.all([
    getProducts(category, search),
    getCategories()
  ])

  const selectedCategory = category 
    ? categories.find(cat => cat.id === category)
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedCategory ? selectedCategory.name : '전체 상품'}
          </h1>
          <p className="text-gray-600">
            {selectedCategory 
              ? selectedCategory.description || '카테고리 상품을 둘러보세요'
              : '다양한 상품을 만나보세요'
            }
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 사이드바 - 카테고리 필터 */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/products"
                    className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      !category 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    전체 상품
                  </a>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <a
                      href={`/products?category=${cat.id}`}
                      className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        category === cat.id 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {cat.name}
                      <span className="ml-2 text-xs text-gray-500">
                        ({cat._count.products})
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* 검색 폼 */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">상품 검색</h3>
              <form method="get" className="space-y-4">
                {category && (
                  <input type="hidden" name="category" value={category} />
                )}
                <div>
                  <input
                    type="text"
                    name="search"
                    placeholder="상품명 또는 설명으로 검색"
                    defaultValue={search || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  검색
                </button>
              </form>
              {search && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700">
                    '<strong>{search}</strong>' 검색 결과
                  </p>
                  <a 
                    href={category ? `/products?category=${category}` : '/products'}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    검색 초기화
                  </a>
                </div>
              )}
            </div>
          </aside>

          {/* 메인 콘텐츠 - 상품 그리드 */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                총 <strong>{products.length}</strong>개의 상품
              </p>
              
              {/* 정렬 옵션 (향후 구현 가능) */}
              <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="newest">최신순</option>
                <option value="price_low">가격 낮은 순</option>
                <option value="price_high">가격 높은 순</option>
                <option value="name">이름순</option>
              </select>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0012 15c-2.34 0-4.291-1.007-5.291-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  조건에 맞는 상품이 없습니다
                </h3>
                <p className="text-gray-600 mb-4">
                  {search 
                    ? '다른 검색어로 시도해보세요' 
                    : '다른 카테고리를 선택해보세요'
                  }
                </p>
                <a 
                  href="/products" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  전체 상품 보기
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage(props: ProductsPageProps) {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsList {...props} />
    </Suspense>
  )
}