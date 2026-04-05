'use client'

import type { ReactNode } from 'react'

interface ProductTier {
  minQuantity: number
  unitPrice: number
}

interface CatalogProduct {
  id: string
  name: string
  price: number
  moq: number
  imageUrl?: string
  size?: string
  length?: string
  colors?: string[]
  specifications?: Record<string, string>
  vendor?: string
  verificationStatus?: 'pending' | 'approved' | 'rejected' | null
  priceTiers?: ProductTier[]
}

interface ProductCatalogGridProps<T extends CatalogProduct> {
  products: T[]
  renderFooter: (product: T) => ReactNode
}

export default function ProductCatalogGrid<T extends CatalogProduct>({
  products,
  renderFooter,
}: ProductCatalogGridProps<T>) {
  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
      {products.map((product) => (
        <div
          key={product.id}
          className="overflow-hidden rounded-[28px] border border-white/60 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition hover:shadow-lg"
        >
          <div className="h-40 bg-neutral-200">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="p-4">
            <div className="mb-2 flex items-start justify-between gap-3">
              <h3 className="font-semibold text-neutral-900">{product.name}</h3>
              <span className={`badge ${product.verificationStatus === 'approved' ? 'badge-success' : 'badge-primary'}`}>
                {product.verificationStatus === 'approved' ? 'verified' : 'unverified'}
              </span>
            </div>
            <p className="mb-1 text-sm text-neutral-600">By {product.vendor || 'Vendor'}</p>
            <p className="mb-3 text-sm text-neutral-600">MOQ: {product.moq} units</p>
            {(product.size || product.length || (product.colors && product.colors.length > 0)) && (
              <div className="mb-3 flex flex-wrap gap-2 text-xs text-neutral-600">
                {product.size && <span className="rounded-full bg-neutral-100 px-3 py-1">Size: {product.size}</span>}
                {product.length && <span className="rounded-full bg-neutral-100 px-3 py-1">Length: {product.length}</span>}
                {product.colors?.map((color) => (
                  <span key={`${product.id}-${color}`} className="rounded-full bg-neutral-100 px-3 py-1">
                    {color}
                  </span>
                ))}
              </div>
            )}
            <div className="mb-3">
              <p className="text-lg font-bold text-primary-600">NGN {product.price.toLocaleString()}</p>
              <p className="text-xs text-neutral-500">Base unit price</p>
            </div>
            <div className="rounded-lg bg-neutral-100 p-3 text-sm text-neutral-700">
              <p className="mb-2 font-medium">Bulk tiers</p>
              {product.priceTiers && product.priceTiers.length > 0 ? (
                <div className="space-y-1">
                  {product.priceTiers.map((tier) => (
                    <p key={`${product.id}-${tier.minQuantity}`}>
                      {tier.minQuantity}+ units: NGN {tier.unitPrice.toLocaleString()}
                    </p>
                  ))}
                </div>
              ) : (
                <p>No bulk discount tiers configured.</p>
              )}
            </div>
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mt-3 rounded-lg border border-neutral-200 bg-white p-3 text-sm text-neutral-700">
                <p className="mb-2 font-medium">Specifications</p>
                <div className="space-y-1">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <p key={`${product.id}-${key}`}>
                      <span className="font-medium">{key}:</span> {value}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {renderFooter(product)}
          </div>
        </div>
      ))}
    </div>
  )
}
