import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import prisma from '@/lib/prisma'

async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    take: 8,
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

export default async function Home() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories()
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            FigureShop에 오신 것을 환영합니다
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            최고의 품질, 최저의 가격으로 만나보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/products" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              상품 둘러보기
            </a>
            <a 
              href="/categories" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              카테고리 보기
            </a>
          </div>
        </div>
      </section>

      {/* 카테고리 섹션 */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            카테고리
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`/categories/${category.id}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 text-center"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {category.description || '다양한 상품을 만나보세요'}
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {category._count.products}개 상품
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 추천 상품 섹션 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              추천 상품
            </h2>
            <a 
              href="/products" 
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              전체 보기
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">FigureShop</h3>
              <p className="text-gray-300">
                최고의 품질과 서비스를 제공하는 온라인 쇼핑몰입니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">고객 서비스</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">주문 조회</a></li>
                <li><a href="#" className="hover:text-white">배송 정보</a></li>
                <li><a href="#" className="hover:text-white">반품/교환</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">회사 정보</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">회사 소개</a></li>
                <li><a href="#" className="hover:text-white">채용 정보</a></li>
                <li><a href="#" className="hover:text-white">이용약관</a></li>
                <li><a href="#" className="hover:text-white">개인정보처리방침</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">연락처</h4>
              <ul className="space-y-2 text-gray-300">
                <li>고객센터: 1588-1234</li>
                <li>이메일: support@figureshop.com</li>
                <li>운영시간: 09:00 - 18:00</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 FigureShop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
