import { useState, useEffect, useRef } from 'react'
import { Box, TextField, Typography, Paper, Button, Chip } from '@mui/material'
import { Upload, Image as ImageIcon } from '@mui/icons-material'
import { supabase } from '../../lib/supabase'
import type { SectionKey, SectionStatusRow } from '../../types'
import SectionShell from './SectionShell'

interface Props {
  sellerId: string
  statusRow: SectionStatusRow
  onStatusChange: (section: SectionKey, updated: SectionStatusRow) => void
}

interface BrandingForm {
  logo_url: string
  banner_url: string
  visual_identity_statement: string
}

const MAX_LOGO_MB = 5
const MAX_BANNER_MB = 10
const ALLOWED_TYPES = ['image/png', 'image/jpeg']

function validateImageFile(file: File, maxMB: number, _ratioLabel: string): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return 'Only PNG or JPG files are allowed.'
  if (file.size > maxMB * 1024 * 1024) return `File size must be under ${maxMB}MB.`
  return null
}

interface UploadZoneProps {
  label: string
  hint: string
  accept: string
  url: string
  onChange: (url: string) => void
  sellerId: string
  folder: string
  maxMB: number
  disabled?: boolean
}

function UploadZone({ label, hint, accept, url, onChange, sellerId, folder, maxMB, disabled }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    const validErr = validateImageFile(file, maxMB, hint)
    if (validErr) { setError(validErr); return }
    setError(null)
    setUploading(true)
    const path = `${sellerId}/${folder}/${Date.now()}_${file.name}`
    const { data, error: upErr } = await supabase.storage
      .from('seller-assets')
      .upload(path, file, { upsert: true })
    if (upErr) {
      setError(upErr.message)
    } else {
      const { data: urlData } = supabase.storage.from('seller-assets').getPublicUrl(data.path)
      onChange(urlData.publicUrl)
    }
    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (disabled) return
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <Box>
      <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
        {label}
      </Typography>
      <Paper
        elevation={0}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => !disabled && inputRef.current?.click()}
        sx={{
          border: '2px dashed',
          borderColor: error ? 'error.main' : 'grey.300',
          borderRadius: 2,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: url ? 'auto' : 120,
          cursor: disabled ? 'default' : 'pointer',
          bgcolor: '#fafafa',
          transition: 'border-color 0.2s',
          '&:hover': { borderColor: disabled ? 'grey.300' : 'primary.main' },
          overflow: 'hidden',
        }}
      >
        {url ? (
          <Box sx={{ width: '100%', position: 'relative' }}>
            <img src={url} alt={label} style={{ width: '100%', maxHeight: 180, objectFit: 'contain', borderRadius: 6 }} />
            {!disabled && (
              <Button
                size="small"
                variant="outlined"
                sx={{ mt: 1, borderColor: 'grey.400', color: 'text.secondary' }}
                onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
              >
                Replace
              </Button>
            )}
          </Box>
        ) : (
          <>
            {uploading ? (
              <Typography variant="body2" color="text.secondary">Uploading…</Typography>
            ) : (
              <>
                <Upload sx={{ color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Drag & drop or <span style={{ color: '#CC0000', fontWeight: 600 }}>click to upload</span>
                </Typography>
                <Typography variant="caption" color="text.disabled" mt={0.5}>{hint}</Typography>
              </>
            )}
          </>
        )}
      </Paper>
      {error && <Typography variant="caption" color="error" display="block" mt={0.5}>{error}</Typography>}
      <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
    </Box>
  )
}

export default function BrandingSection({ sellerId, statusRow, onStatusChange }: Props) {
  const [form, setForm] = useState<BrandingForm>({ logo_url: '', banner_url: '', visual_identity_statement: '' })
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.from('seller_branding').select('*').eq('seller', sellerId).maybeSingle()
      .then(({ data }) => {
        if (data) setForm({ logo_url: data.logo_url ?? '', banner_url: data.banner_url ?? '', visual_identity_statement: data.visual_identity_statement ?? '' })
      })
  }, [sellerId])

  const upsertData = async (newStatus: 'draft' | 'submitted') => {
    const { error } = await supabase.from('seller_branding').upsert({ seller: sellerId, ...form }, { onConflict: 'seller' })
    if (error) return false
    const extra = newStatus === 'submitted' ? { submitted_at: new Date().toISOString() } : {}
    const { error: sErr } = await supabase.from('seller_section_status').upsert({
      seller: sellerId, section: 'branding', status: newStatus, ...extra,
    }, { onConflict: 'seller,section' })
    return !sErr
  }

  const handleSave = async () => {
    setSaving(true)
    const ok = await upsertData('draft')
    if (ok) onStatusChange('branding', { ...statusRow, status: 'draft' })
    setSaving(false)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const now = new Date().toISOString()
    const ok = await upsertData('submitted')
    if (ok) onStatusChange('branding', { ...statusRow, status: 'submitted', submitted_at: now })
    setSubmitting(false)
  }

  const handleCancelSubmission = async () => {
    setSubmitting(true)
    const { error } = await supabase.from('seller_section_status').upsert({
      seller: sellerId, section: 'branding', status: 'draft', submitted_at: null,
    }, { onConflict: 'seller,section' })
    if (!error) onStatusChange('branding', { ...statusRow, status: 'draft', submitted_at: null })
    setSubmitting(false)
  }

  const isLocked = statusRow.status === 'submitted' || statusRow.status === 'approved'

  return (
    <SectionShell
      title="Branding Assets"
      subtitle="Your brand identity and visual language for the marketplace."
      status={statusRow.status}
      rejectionReason={statusRow.rejection_reason}
      submittedAt={statusRow.submitted_at}
      reviewedAt={statusRow.reviewed_at}
      reviewedBy={statusRow.reviewed_by}
      approvalId={statusRow.approval_id}
      saving={saving}
      submitting={submitting}
      onSave={handleSave}
      onSubmit={handleSubmit}
      onCancelSubmission={handleCancelSubmission}
    >
      {/* Banner (full-width) */}
      <Box sx={{ mb: 3, position: 'relative' }}>
        {form.banner_url ? (
          <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', mb: 3 }}>
            <img src={form.banner_url} alt="Hero Banner" style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />
            <Chip label="HERO BANNER" size="small" sx={{ position: 'absolute', bottom: 12, left: 12, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', fontWeight: 700, fontSize: '0.65rem' }} />
            {!isLocked && (
              <Button size="small" variant="outlined" sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)', borderColor: 'grey.400' }}
                onClick={() => setForm(f => ({ ...f, banner_url: '' }))}>Remove</Button>
            )}
          </Box>
        ) : (
          <UploadZone
            label="Store Banner"
            hint="PNG or JPG • Max 10MB • 16:9 aspect ratio recommended"
            accept="image/png,image/jpeg"
            url={form.banner_url}
            onChange={url => setForm(f => ({ ...f, banner_url: url }))}
            sellerId={sellerId}
            folder="banners"
            maxMB={MAX_BANNER_MB}
            disabled={isLocked}
          />
        )}
      </Box>

      {/* Visual Identity Statement */}
      <TextField
        label="Visual Identity Statement"
        multiline
        minRows={4}
        value={form.visual_identity_statement}
        onChange={e => setForm(f => ({ ...f, visual_identity_statement: e.target.value }))}
        fullWidth
        sx={{ mb: 3 }}
        placeholder="Describe your brand's visual identity and editorial vision…"
      />

      {/* Logo + Palette row */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Primary Logo
            </Typography>
            <ImageIcon sx={{ fontSize: 14, color: 'success.main' }} />
          </Box>
          <UploadZone
            label=""
            hint="PNG or JPG • Max 5MB • 1:1 aspect ratio recommended"
            accept="image/png,image/jpeg"
            url={form.logo_url}
            onChange={url => setForm(f => ({ ...f, logo_url: url }))}
            sellerId={sellerId}
            folder="logos"
            maxMB={MAX_LOGO_MB}
            disabled={isLocked}
          />
          {form.logo_url && (
            <Typography variant="caption" color="text.disabled" display="block" mt={1}>
              FORMAT: PNG/JPG
            </Typography>
          )}
        </Box>
      </Box>
    </SectionShell>
  )
}
