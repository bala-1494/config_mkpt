import { useState, useEffect } from 'react'
import { Box, TextField, Typography, Paper } from '@mui/material'
import { Security } from '@mui/icons-material'
import { supabase } from '../../lib/supabase'
import type { SectionKey, SectionStatusRow } from '../../types'
import SectionShell from './SectionShell'

interface Props {
  sellerId: string
  statusRow: SectionStatusRow
  onStatusChange: (section: SectionKey, updated: SectionStatusRow) => void
}

interface BizForm {
  duns_number: string
  ein: string
  tin: string
}

const validateDUNS = (v: string) => /^\d{9}$/.test(v)
const validateEIN = (v: string) => /^\d{2}-\d{7}$/.test(v)
const validateTIN = (v: string) => v.trim().length > 0

export default function BusinessDetailsSection({ sellerId, statusRow, onStatusChange }: Props) {
  const [form, setForm] = useState<BizForm>({ duns_number: '', ein: '', tin: '' })
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [attempted, setAttempted] = useState(false)

  useEffect(() => {
    supabase.from('seller_business_details').select('*').eq('seller', sellerId).maybeSingle()
      .then(({ data }) => {
        if (data) setForm({ duns_number: data.duns_number ?? '', ein: data.ein ?? '', tin: data.tin ?? '' })
      })
  }, [sellerId])

  const dunsError = attempted && !validateDUNS(form.duns_number)
  const einError = attempted && !validateEIN(form.ein)
  const tinError = attempted && !validateTIN(form.tin)

  const validate = () => validateDUNS(form.duns_number) && validateEIN(form.ein) && validateTIN(form.tin)

  const upsertData = async (newStatus: 'draft' | 'submitted') => {
    const { error } = await supabase.from('seller_business_details').upsert({
      seller: sellerId, ...form,
    }, { onConflict: 'seller' })
    if (error) return false
    const extra = newStatus === 'submitted' ? { submitted_at: new Date().toISOString() } : {}
    const { error: sErr } = await supabase.from('seller_section_status').upsert({
      seller: sellerId, section: 'business_details', status: newStatus, ...extra,
    }, { onConflict: 'seller,section' })
    return !sErr
  }

  const handleSave = async () => {
    setSaving(true)
    const ok = await upsertData('draft')
    if (ok) onStatusChange('business_details', { ...statusRow, status: 'draft' })
    setSaving(false)
  }

  const handleSubmit = async () => {
    setAttempted(true)
    if (!validate()) return
    setSubmitting(true)
    const now = new Date().toISOString()
    const ok = await upsertData('submitted')
    if (ok) onStatusChange('business_details', { ...statusRow, status: 'submitted', submitted_at: now })
    setSubmitting(false)
  }

  const handleCancelSubmission = async () => {
    setSubmitting(true)
    const { error } = await supabase.from('seller_section_status').upsert({
      seller: sellerId, section: 'business_details', status: 'draft', submitted_at: null,
    }, { onConflict: 'seller,section' })
    if (!error) onStatusChange('business_details', { ...statusRow, status: 'draft', submitted_at: null })
    setSubmitting(false)
  }

  return (
    <SectionShell
      title="Business Details"
      subtitle="Provide your official business identifiers for marketplace compliance and tax purposes."
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
          label="DUNS Number"
          placeholder="123456789"
          value={form.duns_number}
          onChange={e => setForm(f => ({ ...f, duns_number: e.target.value.replace(/\D/g, '').slice(0, 9) }))}
          error={dunsError}
          helperText={dunsError ? 'Must be exactly 9 digits' : 'Data Universal Numbering System (9 digits)'}
          fullWidth
          required
          inputProps={{ maxLength: 9, inputMode: 'numeric' }}
        />

        <TextField
          label="Employer Identification Number (EIN)"
          placeholder="12-3456789"
          value={form.ein}
          onChange={e => {
            // Auto-format XX-XXXXXXX as user types
            const raw = e.target.value.replace(/\D/g, '').slice(0, 9)
            const formatted = raw.length > 2 ? `${raw.slice(0, 2)}-${raw.slice(2)}` : raw
            setForm(f => ({ ...f, ein: formatted }))
          }}
          error={einError}
          helperText={einError ? 'Required format: XX-XXXXXXX' : 'Federal tax identification number'}
          fullWidth
          required
          inputProps={{ maxLength: 10 }}
        />

        <TextField
          label="Taxpayer Identification Number (TIN)"
          placeholder="e.g. 123-45-6789"
          value={form.tin}
          onChange={e => setForm(f => ({ ...f, tin: e.target.value }))}
          error={tinError}
          helperText={tinError ? 'Required for tax compliance' : 'General tax ID for your business entity'}
          fullWidth
          required
        />

        <Paper
          elevation={0}
          sx={{ display: 'flex', gap: 1.5, p: 2, bgcolor: '#f5f5f5', border: '1px solid', borderColor: 'grey.200', borderRadius: 2 }}
        >
          <Security sx={{ color: 'text.disabled', fontSize: 18, flexShrink: 0, mt: 0.1 }} />
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.25}>
              Why is this required?
            </Typography>
            <Typography variant="caption" color="text.secondary">
              To maintain the integrity of the marketplace, we verify the legal standing of all sellers.
              Your Tax ID and legal identifiers are kept strictly confidential and used only for compliance.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </SectionShell>
  )
}
