import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  stock: number
  category: {
    name: string
  }
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square bg-gray-200 flex items-center justify-center">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400 text-center">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">이미지 없음</p>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {product.category.name}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              product.stock > 0 
                ? 'text-green-600 bg-green-100' 
                : 'text-red-600 bg-red-100'
            }`}>
              {product.stock > 0 ? `재고 ${product.stock}개` : '품절'}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-blue-600">
              {formatPrice(product.price)}
            </span>
            
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                product.stock > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={product.stock === 0}
            >
              {product.stock > 0 ? '장바구니 담기' : '품절'}
            </button>
          </div>
        </div>
      </Link>
    </div>
  )
}