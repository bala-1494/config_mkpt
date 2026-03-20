import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import StatusBadge from '../components/StatusBadge'
import type { SellerDocument, BrandDoc, DocType, BrandClassification, DocStatus } from '../types'

// ── Helpers ──────────────────────────────────────────────────────────────────

function fileUrl(path: string) {
  const { data } = supabase.storage.from('documents').getPublicUrl(path)
  return data.publicUrl
}

// ── Upload button ─────────────────────────────────────────────────────────────

function UploadButton({
  onFile, disabled,
}: {
  onFile: (file: File) => void
  disabled?: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept=".pdf,image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = ''
        }}
      />
      <button
        onClick={() => ref.current?.click()}
        disabled={disabled}
        className="text-xs font-medium px-3 py-1.5 border rounded-lg transition hover:bg-gray-50 disabled:opacity-50"
        style={{ color: '#CC0000', borderColor: '#CC0000' }}
      >
        Upload
      </button>
    </>
  )
}

// ── Primary doc row ──────────────────────────────────────────────────────────

const DOC_LABELS: Record<DocType, string> = {
  w9: 'W9',
  form_8822b: 'Form 8822-B',
  address_proof: 'Address Proof',
}

function PrimaryDocRow({
  docType,
  doc,
  onUpload,
}: {
  docType: DocType
  doc: SellerDocument | undefined
  onUpload: (docType: DocType, file: File) => void
}) {
  const status: DocStatus = doc?.status ?? 'not_uploaded'
  const canUpload = !doc || status === 'not_uploaded' || status === 'rejected'

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{DOC_LABELS[docType]}</p>
        {doc?.rejection_reason && status === 'rejected' && (
          <p className="text-xs text-red-600 mt-0.5">Reason: {doc.rejection_reason}</p>
        )}
        {doc?.file && (
          <a
            href={fileUrl(doc.file)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline mt-0.5 inline-block"
          >
            View uploaded file
          </a>
        )}
      </div>
      <div className="flex items-center gap-3 ml-4">
        <StatusBadge status={status} size="sm" />
        {canUpload && (
          <UploadButton onFile={(file) => onUpload(docType, file)} />
        )}
      </div>
    </div>
  )
}

// ── Brand doc row ─────────────────────────────────────────────────────────────

function BrandDocRow({
  doc,
  onUpdate,
  onRemove,
  onUploadFile,
}: {
  doc: BrandDoc
  onUpdate: (updated: BrandDoc) => void
  onRemove: () => void
  onUploadFile: (doc: BrandDoc, file: File) => void
}) {
  const isPersisted = !!doc.id && !doc.id.startsWith('local_')
  const canUpload = !doc.auth_file || doc.status === 'not_uploaded' || doc.status === 'rejected'

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Brand Name</label>
          <input
            type="text"
            value={doc.brand_name}
            onChange={(e) => onUpdate({ ...doc, brand_name: e.target.value })}
            placeholder="Nike"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none"
            onFocus={(e) => { e.target.style.borderColor = '#CC0000'; e.target.style.boxShadow = '0 0 0 2px rgba(204,0,0,0.12)' }}
            onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = '' }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Classification</label>
          <select
            value={doc.classification}
            onChange={(e) => onUpdate({ ...doc, classification: e.target.value as BrandClassification })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none bg-white"
            onFocus={(e) => { e.target.style.borderColor = '#CC0000'; e.target.style.boxShadow = '0 0 0 2px rgba(204,0,0,0.12)' }}
            onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = '' }}
          >
            <option value="">Select...</option>
            <option value="reseller">Reseller</option>
            <option value="original_manufacturer">Original Manufacturer</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          {isPersisted && (
            <div className="flex items-center gap-2">
              <StatusBadge status={doc.status || 'not_uploaded'} size="sm" />
              {doc.auth_file && (
                <a
                  href={fileUrl(doc.auth_file)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View authorization
                </a>
              )}
              {doc.rejection_reason && doc.status === 'rejected' && (
                <span className="text-xs text-red-600">Reason: {doc.rejection_reason}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {(canUpload || !isPersisted) && (
            <UploadButton onFile={(file) => onUploadFile(doc, file)} />
          )}
          <button
            onClick={onRemove}
            className="text-xs text-gray-400 hover:text-red-500 transition"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Documentation() {
  const { user } = useAuth()
  const [primaryDocs, setPrimaryDocs] = useState<SellerDocument[]>([])
  const [brandDocs, setBrandDocs] = useState<BrandDoc[]>([])
  const [uploading, setUploading] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const showMsg = (text: string) => {
    setMsg(text)
    setTimeout(() => setMsg(''), 3000)
  }

  // Load existing docs
  useEffect(() => {
    if (!user) return
    supabase
      .from('seller_documents')
      .select('*')
      .eq('seller', user.id)
      .then(({ data }) => setPrimaryDocs((data ?? []) as SellerDocument[]))
      .catch(() => {})

    supabase
      .from('brand_docs')
      .select('*')
      .eq('seller', user.id)
      .then(({ data }) => setBrandDocs((data ?? []) as BrandDoc[]))
      .catch(() => {})
  }, [user])

  const handlePrimaryUpload = async (docType: DocType, file: File) => {
    if (!user) return
    setUploading(docType)
    try {
      const filePath = `seller_documents/${user.id}/${docType}/${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError

      const existing = primaryDocs.find((d) => d.doc_type === docType)
      const data = { seller: user.id, doc_type: docType, file: filePath, status: 'pending' as DocStatus }

      if (existing) {
        const { data: rec, error } = await supabase
          .from('seller_documents')
          .update(data)
          .eq('id', existing.id)
          .select()
          .single()
        if (error) throw error
        setPrimaryDocs((prev) => prev.map((d) => (d.id === existing.id ? rec as SellerDocument : d)))
      } else {
        const { data: rec, error } = await supabase
          .from('seller_documents')
          .insert(data)
          .select()
          .single()
        if (error) throw error
        setPrimaryDocs((prev) => [...prev, rec as SellerDocument])
      }
      showMsg('Document uploaded successfully')
    } catch {
      showMsg('Upload failed. Please try again.')
    } finally {
      setUploading(null)
    }
  }

  const addBrandDoc = () => {
    const local: BrandDoc = {
      id: `local_${crypto.randomUUID()}`,
      seller: user?.id ?? '',
      brand_name: '',
      classification: '',
      auth_file: '',
      status: 'not_uploaded',
      rejection_reason: '',
    }
    setBrandDocs((prev) => [...prev, local])
  }

  const saveBrandDoc = async (doc: BrandDoc) => {
    if (!user) return
    setSaving(true)
    try {
      const isLocal = doc.id.startsWith('local_')
      const data = {
        seller: user.id,
        brand_name: doc.brand_name,
        classification: doc.classification,
        status: doc.status || 'not_uploaded',
      }
      if (isLocal) {
        const { data: rec, error } = await supabase
          .from('brand_docs')
          .insert(data)
          .select()
          .single()
        if (error) throw error
        setBrandDocs((prev) => prev.map((d) => (d.id === doc.id ? rec as BrandDoc : d)))
      } else {
        const { data: rec, error } = await supabase
          .from('brand_docs')
          .update(data)
          .eq('id', doc.id)
          .select()
          .single()
        if (error) throw error
        setBrandDocs((prev) => prev.map((d) => (d.id === doc.id ? rec as BrandDoc : d)))
      }
      showMsg('Brand saved')
    } catch {
      showMsg('Failed to save brand')
    } finally {
      setSaving(false)
    }
  }

  const removeBrandDoc = async (doc: BrandDoc) => {
    if (doc.id.startsWith('local_')) {
      setBrandDocs((prev) => prev.filter((d) => d.id !== doc.id))
      return
    }
    try {
      const { error } = await supabase.from('brand_docs').delete().eq('id', doc.id)
      if (error) throw error
      setBrandDocs((prev) => prev.filter((d) => d.id !== doc.id))
    } catch {
      showMsg('Failed to remove brand')
    }
  }

  const handleBrandFileUpload = async (doc: BrandDoc, file: File) => {
    if (!user) return
    setUploading(doc.id)
    try {
      // Save/persist the brand first if it's local
      let targetId = doc.id
      if (doc.id.startsWith('local_')) {
        const { data: created, error } = await supabase
          .from('brand_docs')
          .insert({
            seller: user.id,
            brand_name: doc.brand_name,
            classification: doc.classification,
            status: 'not_uploaded',
          })
          .select()
          .single()
        if (error) throw error
        targetId = (created as BrandDoc).id
        setBrandDocs((prev) => prev.map((d) => (d.id === doc.id ? created as BrandDoc : d)))
      }

      const filePath = `brand_docs/${user.id}/${targetId}/${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: rec, error } = await supabase
        .from('brand_docs')
        .update({ auth_file: filePath, status: 'pending' })
        .eq('id', targetId)
        .select()
        .single()
      if (error) throw error
      setBrandDocs((prev) => prev.map((d) => (d.id === targetId ? rec as BrandDoc : d)))
      showMsg('Authorization document uploaded')
    } catch {
      showMsg('Upload failed')
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Documentation</h1>
        <p className="text-sm text-gray-500 mt-0.5">Upload required business licenses and tax forms</p>
      </div>

      {/* Primary documents */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Primary Documents</h2>
          <p className="text-xs text-gray-500 mt-0.5">Required for seller verification</p>
        </div>
        <div className="px-5">
          {(['w9', 'form_8822b', 'address_proof'] as DocType[]).map((docType) => (
            <div key={docType} className={uploading === docType ? 'opacity-60 pointer-events-none' : ''}>
              <PrimaryDocRow
                docType={docType}
                doc={primaryDocs.find((d) => d.doc_type === docType)}
                onUpload={handlePrimaryUpload}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Brand documentation */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Brand Documentation</h2>
            <p className="text-xs text-gray-500 mt-0.5">Authorization letters for brands you carry</p>
          </div>
          <button
            onClick={addBrandDoc}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border transition"
            style={{ color: '#CC0000', borderColor: '#CC0000' }}
          >
            + Add Brand
          </button>
        </div>
        <div className="p-5 space-y-3">
          {brandDocs.length === 0 ? (
            <p className="text-sm text-gray-400">No brand documentation added yet.</p>
          ) : (
            brandDocs.map((doc) => (
              <div key={doc.id} className={uploading === doc.id ? 'opacity-60 pointer-events-none' : ''}>
                <BrandDocRow
                  doc={doc}
                  onUpdate={(updated) => setBrandDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))}
                  onRemove={() => removeBrandDoc(doc)}
                  onUploadFile={handleBrandFileUpload}
                />
                {doc.brand_name && !doc.id.startsWith('local_') === false && (
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => saveBrandDoc(doc)}
                      disabled={saving}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg text-white transition hover:opacity-90 disabled:opacity-60"
                      style={{ backgroundColor: '#CC0000' }}
                    >
                      Save Brand
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
          {msg && (
            <p className={`text-xs mt-2 ${msg.includes('fail') || msg.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
              {msg}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
