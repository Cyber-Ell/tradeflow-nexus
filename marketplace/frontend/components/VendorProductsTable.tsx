'use client'

import type { ReactNode } from 'react'

interface ProductTier {
  minQuantity: number
  unitPrice: number
}

interface VendorProductRow {
  id: string
  name: string
  price: number
  quantity: number
  moq: number
  imageUrl?: string
  size?: string
  length?: string
  colors?: string[]
  specifications?: Record<string, string>
  createdAt: string
  priceTiers?: ProductTier[]
}

interface VendorProductsTableProps<T extends VendorProductRow> {
  products: T[]
  renderActions: (product: T) => ReactNode
}

export default function VendorProductsTable<T extends VendorProductRow>({
  products,
  renderActions,
}: VendorProductsTableProps<T>) {
  return (
    <table className="w-full">
      <thead className="bg-neutral-100 border-b border-neutral-200">
        <tr>
          <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Product</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Base Price</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">MOQ</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Quantity</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Added</th>
          <th className="px-6 py-3 text-left text-sm font-medium text-neutral-700">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-200">
        {products.map((product) => (
          <tr key={product.id} className="hover:bg-neutral-50">
            <td className="px-6 py-4 text-sm text-neutral-900">
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 overflow-hidden rounded-xl bg-neutral-100">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div>
                  <div>{product.name}</div>
                  {(product.size || product.length || (product.colors && product.colors.length > 0)) && (
                    <div className="mt-1 text-xs text-neutral-500">
                      {[product.size ? `Size: ${product.size}` : null, product.length ? `Length: ${product.length}` : null, product.colors?.length ? `Colors: ${product.colors.join(', ')}` : null].filter(Boolean).join(' | ')}
                    </div>
                  )}
                </div>
              </div>
              {product.priceTiers && product.priceTiers.length > 0 && (
                <div className="mt-1 text-xs text-neutral-500">
                  {product.priceTiers.map((tier) => `${tier.minQuantity}+ @ NGN ${tier.unitPrice.toLocaleString()}`).join(' | ')}
                </div>
              )}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mt-1 text-xs text-neutral-500">
                  {Object.entries(product.specifications).map(([key, value]) => `${key}: ${value}`).join(' | ')}
                </div>
              )}
            </td>
            <td className="px-6 py-4 text-sm text-neutral-900">NGN {product.price.toLocaleString()}</td>
            <td className="px-6 py-4 text-sm text-neutral-900">{product.moq}</td>
            <td className="px-6 py-4 text-sm text-neutral-900">{product.quantity}</td>
            <td className="px-6 py-4 text-sm text-neutral-600">{new Date(product.createdAt).toLocaleDateString()}</td>
            <td className="px-6 py-4">{renderActions(product)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
