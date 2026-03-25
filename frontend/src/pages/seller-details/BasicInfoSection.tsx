import { useState, useEffect } from 'react'
import { Box, TextField, Select, MenuItem, FormControl, InputLabel, FormHelperText } from '@mui/material'
import { supabase } from '../../lib/supabase'
import type { SectionKey, SectionStatusRow, SellerLead } from '../../types'
import SectionShell from './SectionShell'

interface Props {
  sellerId: string
  statusRow: SectionStatusRow
  leadData: SellerLead | null
  onStatusChange: (section: SectionKey, updated: SectionStatusRow) => void
}

interface FormState {
  business_name: string
  ein: string
  business_type: string
  phone_number: string
  website: string
}

const BUSINESS_TYPES = [
  { value: 'sole_prop', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'corporation', label: 'Corporation' },
]

export default function BasicInfoSection({ sellerId, statusRow, leadData, onStatusChange }: Props) {
  const [form, setForm] = useState<FormState>({
    business_name: '',
    ein: '',
    business_type: '',
    phone_number: '',
    website: '',
  })
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [attempted, setAttempted] = useState(false)

  // Pre-fill from leadData
  useEffect(() => {
    if (leadData) {
      setForm({
        business_name: leadData.business_name ?? '',
        ein: leadData.ein ?? '',
        business_type: leadData.business_type ?? '',
        phone_number: leadData.phone_number ?? '',
        website: leadData.website ?? '',
      })
    }
  }, [leadData])

  const err = (field: keyof FormState) =>
    attempted && !form[field].trim()

  const validate = () => {
    return form.business_name.trim() && form.ein.trim() && form.business_type.trim()
  }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('seller_leads').update({
      business_name: form.business_name,
      ein: form.ein,
      business_type: form.business_type,
      phone_number: form.phone_number,
      website: form.website,
    }).eq('seller', sellerId)

    if (!error) {
      const { error: sErr } = await supabase.from('seller_section_status').upsert({
        seller: sellerId,
        section: 'basic_info',
        status: 'draft',
      }, { onConflict: 'seller,section' })
      if (!sErr) {
        onStatusChange('basic_info', { ...statusRow, status: 'draft' })
      }
    }
    setSaving(false)
  }

  const handleSubmit = async () => {
    setAttempted(true)
    if (!validate()) return
    setSubmitting(true)

    const { error } = await supabase.from('seller_leads').update({
      business_name: form.business_name,
      ein: form.ein,
      business_type: form.business_type,
      phone_number: form.phone_number,
      website: form.website,
    }).eq('seller', sellerId)

    if (!error) {
      const now = new Date().toISOString()
      const { error: sErr } = await supabase.from('seller_section_status').upsert({
        seller: sellerId,
        section: 'basic_info',
        status: 'submitted',
        submitted_at: now,
      }, { onConflict: 'seller,section' })
      if (!sErr) {
        onStatusChange('basic_info', { ...statusRow, status: 'submitted', submitted_at: now })
      }
    }
    setSubmitting(false)
  }

  const handleCancelSubmission = async () => {
    setSubmitting(true)
    const { error } = await supabase.from('seller_section_status').upsert({
      seller: sellerId,
      section: 'basic_info',
      status: 'draft',
      submitted_at: null,
    }, { onConflict: 'seller,section' })
    if (!error) {
      onStatusChange('basic_info', { ...statusRow, status: 'draft', submitted_at: null })
    }
    setSubmitting(false)
  }

  return (
    <SectionShell
      title="Basic Information"
      subtitle="Enter your legal business details to begin the verification process. This information will be used for contracts and tax purposes."
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          label="Legal Business Name"
          placeholder="e.g. Acme Editorial Group LLC"
          value={form.business_name}
          onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
          error={err('business_name')}
          helperText={err('business_name') ? 'Required' : ''}
          fullWidth
          required
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Tax ID / EIN"
            placeholder="00-0000000"
            value={form.ein}
            onChange={e => setForm(f => ({ ...f, ein: e.target.value }))}
            error={err('ein')}
            helperText={err('ein') ? 'Required' : ''}
            fullWidth
            required
          />

          <FormControl fullWidth required error={err('business_type')}>
            <InputLabel>Business Type</InputLabel>
            <Select
              label="Business Type"
              value={form.business_type}
              onChange={e => setForm(f => ({ ...f, business_type: e.target.value }))}
            >
              {BUSINESS_TYPES.map(t => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </Select>
            {err('business_type') && <FormHelperText>Required</FormHelperText>}
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            value={form.phone_number}
            onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Website"
            placeholder="https://www.yourdomain.com"
            value={form.website}
            onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
            fullWidth
          />
        </Box>
      </Box>
    </SectionShell>
  )
}
