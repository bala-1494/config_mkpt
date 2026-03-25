import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import type { SellerProfile, SellerLead, SellerDetails, Address, Warehouse } from '../../types'
import StatusBadge from '../../components/StatusBadge'

// ── Tabs ────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'basic', label: 'Basic Information' },
  { id: 'addresses', label: 'Addresses & Warehouses' },
  { id: 'branding', label: 'Branding' },
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'returns', label: 'Return Policy' },
  { id: 'business', label: 'Business Details' },
] as const

type TabId = typeof TABS[number]['id']

// ── Empty defaults ───────────────────────────────────────────────────────────

const emptyAddress = (): Address => ({ street: '', city: '', state: '', zip: '', country: '' })
const emptyWarehouse = (): Warehouse => ({ id: crypto.randomUUID(), name: '', street: '', city: '', state: '', zip: '' })

const emptyProfile = (): Partial<SellerProfile> => ({
  business_name: '', ein: '', contact_number: '', admin_name: '',
  business_type: '', website: '',
  business_address: emptyAddress(),
  warehouses: [],
  brands: [],
  privacy_policy: '',
  return_window_days: null,
  restocking_fee_percent: null,
  return_description: '',
  duns_number: '', tin: '',
  profile_status: 'yet_to_submit',
  stripe_connected: false,
})

// ── Field component ──────────────────────────────────────────────────────────

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = (readonly: boolean) =>
  `w-full px-3 py-2 text-sm border rounded-lg transition ${
    readonly
      ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-default'
      : 'bg-white border-gray-300 focus:outline-none'
  }`

function Input({
  value, onChange, placeholder, readonly, type = 'text',
}: {
  value: string | number | null
  onChange?: (v: string) => void
  placeholder?: string
  readonly?: boolean
  type?: string
}) {
  return (
    <input
      type={type}
      value={value ?? ''}
      readOnly={readonly}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={!readonly ? placeholder : undefined}
      className={inputCls(!!readonly)}
      onFocus={!readonly ? (e) => { e.target.style.borderColor = '#CC0000'; e.target.style.boxShadow = '0 0 0 2px rgba(204,0,0,0.12)' } : undefined}
      onBlur={!readonly ? (e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = '' } : undefined}
    />
  )
}

function Textarea({
  value, onChange, placeholder, readonly, rows = 4,
}: {
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  readonly?: boolean
  rows?: number
}) {
  return (
    <textarea
      value={value}
      readOnly={readonly}
      rows={rows}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={!readonly ? placeholder : undefined}
      className={`${inputCls(!!readonly)} resize-none`}
      onFocus={!readonly ? (e) => { e.target.style.borderColor = '#CC0000'; e.target.style.boxShadow = '0 0 0 2px rgba(204,0,0,0.12)' } : undefined}
      onBlur={!readonly ? (e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = '' } : undefined}
    />
  )
}

// ── Address block ────────────────────────────────────────────────────────────

function AddressBlock({
  value, onChange, readonly,
}: {
  value: Address
  onChange?: (addr: Address) => void
  readonly?: boolean
}) {
  const set = (k: keyof Address) => (v: string) => onChange?.({ ...value, [k]: v })
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2">
        <Field label="Street">
          <Input value={value.street} onChange={set('street')} placeholder="123 Main St" readonly={readonly} />
        </Field>
      </div>
      <Field label="City"><Input value={value.city} onChange={set('city')} placeholder="New York" readonly={readonly} /></Field>
      <Field label="State"><Input value={value.state} onChange={set('state')} placeholder="NY" readonly={readonly} /></Field>
      <Field label="ZIP"><Input value={value.zip} onChange={set('zip')} placeholder="10001" readonly={readonly} /></Field>
      <Field label="Country"><Input value={value.country} onChange={set('country')} placeholder="US" readonly={readonly} /></Field>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('basic')
  const [profile, setProfile] = useState<Partial<SellerProfile>>(emptyProfile())
  const [leadId, setLeadId] = useState<string | null>(null)
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const isApproved = profile.profile_status === 'approved'
  const readonly = isApproved

  // Load profile from both tables
  useEffect(() => {
    if (!user) return
    const fetchProfile = async () => {
      const [leadRes, detailsRes] = await Promise.all([
        supabase.from('seller_leads').select('id, business_name, ein, admin_name, business_type, website').eq('seller', user.id).maybeSingle(),
        supabase.from('seller_details').select('*').eq('seller', user.id).maybeSingle(),
      ])
      const lead = leadRes.data as (Pick<SellerLead, 'business_name' | 'ein' | 'admin_name' | 'business_type' | 'website'> & { id: string }) | null
      const details = detailsRes.data as SellerDetails | null
      setLeadId(lead?.id ?? null)
      setDetailsId(details?.id ?? null)
      setProfile({
        ...emptyProfile(),
        ...(lead ? { business_name: lead.business_name, ein: lead.ein, admin_name: lead.admin_name, business_type: lead.business_type, website: lead.website } : {}),
        ...(details ?? {}),
      })
    }
    void fetchProfile()
  }, [user])

  const save = useCallback(async () => {
    if (!user || readonly) return
    setSaving(true)
    setSaveMsg('')
    try {
      // Update identity fields in seller_leads (row was created at signup)
      if (leadId) {
        const { error: leadError } = await supabase
          .from('seller_leads')
          .update({
            business_name: profile.business_name ?? '',
            ein: profile.ein ?? '',
            admin_name: profile.admin_name ?? '',
            business_type: profile.business_type ?? '',
            website: profile.website ?? '',
          })
          .eq('id', leadId)
        if (leadError) throw leadError
      }

      // Upsert extended attributes in seller_details
      const detailsData: Record<string, unknown> = {
        seller: user.id,
        contact_number: profile.contact_number ?? '',
        business_address: profile.business_address ?? null,
        warehouses: profile.warehouses ?? [],
        brands: profile.brands ?? [],
        privacy_policy: profile.privacy_policy ?? '',
        return_window_days: profile.return_window_days ?? null,
        restocking_fee_percent: profile.restocking_fee_percent ?? null,
        return_description: profile.return_description ?? '',
        duns_number: profile.duns_number ?? '',
        tin: profile.tin ?? '',
        profile_status: profile.profile_status === 'yet_to_submit' ? 'in_progress' : (profile.profile_status ?? 'in_progress'),
        stripe_connected: profile.stripe_connected ?? false,
      }

      if (detailsId) {
        const { data: rec, error } = await supabase
          .from('seller_details')
          .update(detailsData)
          .eq('id', detailsId)
          .select()
          .single()
        if (error) throw error
        if (rec) {
          setDetailsId(rec.id)
          setProfile((p) => ({ ...p, ...(rec as SellerDetails) }))
        }
      } else {
        const { data: rec, error } = await supabase
          .from('seller_details')
          .insert(detailsData)
          .select()
          .single()
        if (error) throw error
        if (rec) {
          setDetailsId(rec.id)
          setProfile((p) => ({ ...p, ...(rec as SellerDetails) }))
        }
      }

      setSaveMsg('Saved successfully')
      setTimeout(() => setSaveMsg(''), 3000)
    } catch {
      setSaveMsg('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [user, profile, leadId, detailsId, readonly])

  const set = (key: keyof SellerProfile) => (value: unknown) =>
    setProfile((p) => ({ ...p, [key]: value }))

  // ── Tab content ────────────────────────────────────────────────────────────

  const tabContent: Record<TabId, React.ReactNode> = {
    basic: (
      <div className="grid grid-cols-2 gap-4">
        <Field label="Business Name" required>
          <Input value={profile.business_name ?? ''} onChange={set('business_name')} placeholder="Acme Corp" readonly={readonly} />
        </Field>
        <Field label="EIN">
          <Input value={profile.ein ?? ''} onChange={set('ein')} placeholder="12-3456789" readonly={readonly} />
        </Field>
        <Field label="Admin Name" required>
          <Input value={profile.admin_name ?? ''} onChange={set('admin_name')} placeholder="John Doe" readonly={readonly} />
        </Field>
        <Field label="Contact Number">
          <Input value={profile.contact_number ?? ''} onChange={set('contact_number')} placeholder="+1 555 000 0000" readonly={readonly} />
        </Field>
        <Field label="Business Type">
          {readonly ? (
            <Input value={profile.business_type ?? ''} readonly />
          ) : (
            <select
              value={profile.business_type ?? ''}
              onChange={(e) => set('business_type')(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none bg-white"
              onFocus={(e) => { e.target.style.borderColor = '#CC0000'; e.target.style.boxShadow = '0 0 0 2px rgba(204,0,0,0.12)' }}
              onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = '' }}
            >
              <option value="">Select type</option>
              <option value="LLC">LLC</option>
              <option value="Corporation">Corporation</option>
              <option value="Sole Proprietorship">Sole Proprietorship</option>
              <option value="Partnership">Partnership</option>
              <option value="Non-profit">Non-profit</option>
            </select>
          )}
        </Field>
        <Field label="Website">
          <Input value={profile.website ?? ''} onChange={set('website')} placeholder="https://acme.com" readonly={readonly} />
        </Field>
      </div>
    ),

    addresses: (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Business Address</h3>
          <AddressBlock
            value={profile.business_address ?? emptyAddress()}
            onChange={set('business_address')}
            readonly={readonly}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Warehouses</h3>
            {!readonly && (
              <button
                onClick={() => set('warehouses')([...(profile.warehouses ?? []), emptyWarehouse()])}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border transition"
                style={{ color: '#CC0000', borderColor: '#CC0000' }}
              >
                + Add Warehouse
              </button>
            )}
          </div>
          {(profile.warehouses ?? []).length === 0 ? (
            <p className="text-sm text-gray-400">No warehouses added yet.</p>
          ) : (
            <div className="space-y-4">
              {(profile.warehouses ?? []).map((wh, i) => (
                <div key={wh.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-600">Warehouse {i + 1}</span>
                    {!readonly && (
                      <button
                        onClick={() =>
                          set('warehouses')((profile.warehouses ?? []).filter((_, idx) => idx !== i))
                        }
                        className="text-xs text-red-500 hover:text-red-700 transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Field label="Warehouse Name">
                        <Input
                          value={wh.name}
                          onChange={(v) => {
                            const updated = [...(profile.warehouses ?? [])]
                            updated[i] = { ...wh, name: v }
                            set('warehouses')(updated)
                          }}
                          placeholder="East Coast Warehouse"
                          readonly={readonly}
                        />
                      </Field>
                    </div>
                    <div className="col-span-2">
                      <Field label="Street">
                        <Input value={wh.street} onChange={(v) => { const u = [...(profile.warehouses ?? [])]; u[i] = { ...wh, street: v }; set('warehouses')(u) }} placeholder="456 Warehouse Blvd" readonly={readonly} />
                      </Field>
                    </div>
                    <Field label="City"><Input value={wh.city} onChange={(v) => { const u = [...(profile.warehouses ?? [])]; u[i] = { ...wh, city: v }; set('warehouses')(u) }} placeholder="Newark" readonly={readonly} /></Field>
                    <Field label="State"><Input value={wh.state} onChange={(v) => { const u = [...(profile.warehouses ?? [])]; u[i] = { ...wh, state: v }; set('warehouses')(u) }} placeholder="NJ" readonly={readonly} /></Field>
                    <Field label="ZIP"><Input value={wh.zip} onChange={(v) => { const u = [...(profile.warehouses ?? [])]; u[i] = { ...wh, zip: v }; set('warehouses')(u) }} placeholder="07101" readonly={readonly} /></Field>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),

    branding: (
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Brands Carried</h3>
            <p className="text-xs text-gray-500 mt-0.5">Add all brands you sell under your store</p>
          </div>
          {!readonly && (
            <button
              onClick={() => set('brands')([...(profile.brands ?? []), ''])}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border transition"
              style={{ color: '#CC0000', borderColor: '#CC0000' }}
            >
              + Add Brand
            </button>
          )}
        </div>
        {(profile.brands ?? []).length === 0 ? (
          <p className="text-sm text-gray-400">No brands added yet.</p>
        ) : (
          <div className="space-y-2">
            {(profile.brands ?? []).map((brand, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={brand}
                  onChange={(v) => {
                    const updated = [...(profile.brands ?? [])]
                    updated[i] = v
                    set('brands')(updated)
                  }}
                  placeholder="Brand name"
                  readonly={readonly}
                />
                {!readonly && (
                  <button
                    onClick={() => set('brands')((profile.brands ?? []).filter((_, idx) => idx !== i))}
                    className="text-gray-400 hover:text-red-500 transition shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    ),

    privacy: (
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Privacy Policy</h3>
          <p className="text-xs text-gray-500 mb-3">Provide your store's privacy policy that will be displayed to customers</p>
        </div>
        <Field label="Policy Text" required>
          <Textarea
            value={profile.privacy_policy ?? ''}
            onChange={set('privacy_policy')}
            placeholder="Enter your store's privacy policy..."
            readonly={readonly}
            rows={10}
          />
        </Field>
      </div>
    ),

    returns: (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Return Policy</h3>
          <p className="text-xs text-gray-500 mb-4">Define your store's return terms</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Return Window (days)" required>
            <Input
              type="number"
              value={profile.return_window_days ?? ''}
              onChange={(v) => set('return_window_days')(v ? Number(v) : null)}
              placeholder="30"
              readonly={readonly}
            />
          </Field>
          <Field label="Restocking Fee (%)">
            <Input
              type="number"
              value={profile.restocking_fee_percent ?? ''}
              onChange={(v) => set('restocking_fee_percent')(v ? Number(v) : null)}
              placeholder="0"
              readonly={readonly}
            />
          </Field>
        </div>
        <Field label="Return Description">
          <Textarea
            value={profile.return_description ?? ''}
            onChange={set('return_description')}
            placeholder="Describe your return process, conditions, and exclusions..."
            readonly={readonly}
            rows={6}
          />
        </Field>
      </div>
    ),

    business: (
      <div className="grid grid-cols-2 gap-4">
        <Field label="DUNS Number">
          <Input value={profile.duns_number ?? ''} onChange={set('duns_number')} placeholder="123456789" readonly={readonly} />
        </Field>
        <Field label="TIN (Tax Identification Number)">
          <Input value={profile.tin ?? ''} onChange={set('tin')} placeholder="XX-XXXXXXX" readonly={readonly} />
        </Field>
      </div>
    ),
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Profile Details</h1>
          <p className="text-sm text-gray-500 mt-0.5">Business info and store policies</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={profile.profile_status ?? 'yet_to_submit'} />
          {isApproved && (
            <span className="text-xs text-gray-400">View only — profile approved</span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {/* Tab bar */}
        <div className="border-b border-gray-200 px-4">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-600 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={activeTab === tab.id ? { borderBottomColor: '#CC0000', color: '#CC0000' } : {}}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab body */}
        <div className="p-6">
          {tabContent[activeTab]}
        </div>

        {/* Footer actions */}
        {!readonly && (
          <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {saveMsg && (
                <span className={`text-xs ${saveMsg.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                  {saveMsg}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {activeTab !== TABS[0].id && (
                <button
                  onClick={() => {
                    const idx = TABS.findIndex((t) => t.id === activeTab)
                    setActiveTab(TABS[idx - 1].id)
                  }}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Previous
                </button>
              )}
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 text-sm text-white rounded-lg transition hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: '#CC0000' }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              {activeTab !== TABS[TABS.length - 1].id && (
                <button
                  onClick={async () => {
                    await save()
                    const idx = TABS.findIndex((t) => t.id === activeTab)
                    setActiveTab(TABS[idx + 1].id)
                  }}
                  disabled={saving}
                  className="px-4 py-2 text-sm text-white rounded-lg transition hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#CC0000' }}
                >
                  Save & Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
