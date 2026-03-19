const INTEGRATIONS = [
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Sync your Shopify storefront inventory and orders',
    icon: '🛍️',
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    description: 'Connect your WooCommerce store for seamless order management',
    icon: '🛒',
  },
  {
    id: 'amazon',
    name: 'Amazon Seller Central',
    description: 'Import and sync listings from your Amazon seller account',
    icon: '📦',
  },
  {
    id: 'google_merchant',
    name: 'Google Merchant Center',
    description: 'Push your catalog to Google Shopping automatically',
    icon: '🔍',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync invoices, payments, and financial data',
    icon: '📊',
  },
]

export default function Integrations() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Integrations</h1>
        <p className="text-sm text-gray-500 mt-0.5">Connect third-party platforms to your seller account</p>
        <span className="inline-block mt-2 text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Optional</span>
      </div>

      <div className="space-y-3">
        {INTEGRATIONS.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              </div>
            </div>
            <button
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 bg-gray-50 cursor-not-allowed"
              disabled
            >
              Coming Soon
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        More integrations will be available once your seller account is approved.
      </p>
    </div>
  )
}
