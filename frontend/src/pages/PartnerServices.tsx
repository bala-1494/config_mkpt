const PARTNERS = [
  {
    id: 'fedex',
    name: 'FedEx Fulfillment',
    category: 'Fulfillment',
    description: 'End-to-end warehousing, pick & pack, and last-mile delivery',
    icon: '🚚',
  },
  {
    id: 'ups',
    name: 'UPS Supply Chain',
    category: 'Fulfillment',
    description: 'Global shipping and logistics solutions for growing sellers',
    icon: '📮',
  },
  {
    id: 'shipbob',
    name: 'ShipBob',
    category: 'Fulfillment',
    description: '2-day shipping network with distributed fulfillment centers',
    icon: '📫',
  },
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    category: 'Marketing',
    description: 'Email and SMS marketing automation for e-commerce',
    icon: '📧',
  },
  {
    id: 'meta_ads',
    name: 'Meta Ads',
    category: 'Marketing',
    description: 'Reach customers on Facebook and Instagram with dynamic ads',
    icon: '📣',
  },
  {
    id: 'bazaarvoice',
    name: 'Bazaarvoice',
    category: 'Marketing',
    description: 'Collect and syndicate product reviews across retail channels',
    icon: '⭐',
  },
]

const CATEGORIES = ['Fulfillment', 'Marketing']

export default function PartnerServices() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Partner Services</h1>
        <p className="text-sm text-gray-500 mt-0.5">Fulfillment and marketing partners to grow your business</p>
        <span className="inline-block mt-2 text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Optional</span>
      </div>

      {CATEGORIES.map((cat) => (
        <div key={cat} className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{cat}</h2>
          <div className="space-y-3">
            {PARTNERS.filter((p) => p.category === cat).map((partner) => (
              <div key={partner.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{partner.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{partner.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{partner.description}</p>
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
        </div>
      ))}

      <p className="text-xs text-gray-400 mt-2 text-center">
        Partner integrations become available after your seller account is fully approved.
      </p>
    </div>
  )
}
