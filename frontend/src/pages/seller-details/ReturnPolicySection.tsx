import { useState, useEffect } from 'react'
import {
  Box, TextField, Select, MenuItem, FormControl, InputLabel,
  FormHelperText, InputAdornment,
} from '@mui/material'
import { supabase } from '../../lib/supabase'
import type { SectionKey, SectionStatusRow } from '../../types'
import SectionShell from './SectionShell'

interface Props {
  sellerId: string
  statusRow: SectionStatusRow
  onStatusChange: (section: SectionKey, updated: SectionStatusRow) => void
}

const RETURN_WINDOWS = [
  { value: '7_days', label: '7 Days' },
  { value: '14_days', label: '14 Days' },
  { value: '30_days', label: '30 Days' },
  { value: '60_days', label: '60 Days' },
  { value: '90_days', label: '90 Days' },
]

export default function ReturnPolicySection({ sellerId, statusRow, onStatusChange }: Props) {
  const [returnWindow, setReturnWindow] = useState('')
  const [restockingFee, setRestockingFee] = useState('0')
  const [additionalTerms, setAdditionalTerms] = useState('')
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [attempted, setAttempted] = useState(false)

  useEffect(() => {
    supabase.from('seller_return_policy').select('*').eq('seller', sellerId).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setReturnWindow(data.return_window ?? '')
          setRestockingFee(String(data.restocking_fee ?? '0'))
          setAdditionalTerms(data.additional_terms ?? '')
        }
      })
  }, [sellerId])

  const feeNum = parseFloat(restockingFee) || 0
  const feeError = attempted && (isNaN(feeNum) || feeNum < 0 || feeNum > 100)
  const windowError = attempted && !returnWindow

  const validate = () => {
    const fee = parseFloat(restockingFee) || 0
    return returnWindow && fee >= 0 && fee <= 100
  }

  const upsertData = async (newStatus: 'draft' | 'submitted') => {
    const { error } = await supabase.from('seller_return_policy').upsert({
      seller: sellerId,
      return_window: returnWindow,
      restocking_fee: parseFloat(restockingFee) || 0,
      additional_terms: additionalTerms,
    }, { onConflict: 'seller' })
    if (error) return false
    const extra = newStatus === 'submitted' ? { submitted_at: new Date().toISOString() } : {}
    const { error: sErr } = await supabase.from('seller_section_status').upsert({
      seller: sellerId, section: 'return_policy', status: newStatus, ...extra,
    }, { onConflict: 'seller,section' })
    return !sErr
  }

  const handleSave = async () => {
    setSaving(true)
    const ok = await upsertData('draft')
    if (ok) onStatusChange('return_policy', { ...statusRow, status: 'draft' })
    setSaving(false)
  }

  const handleSubmit = async () => {
    setAttempted(true)
    if (!validate()) return
    setSubmitting(true)
    const now = new Date().toISOString()
    const ok = await upsertData('submitted')
    if (ok) onStatusChange('return_policy', { ...statusRow, status: 'submitted', submitted_at: now })
    setSubmitting(false)
  }

  const handleCancelSubmission = async () => {
    setSubmitting(true)
    const { error } = await supabase.from('seller_section_status').upsert({
      seller: sellerId, section: 'return_policy', status: 'draft', submitted_at: null,
    }, { onConflict: 'seller,section' })
    if (!error) onStatusChange('return_policy', { ...statusRow, status: 'draft', submitted_at: null })
    setSubmitting(false)
  }

  return (
    <SectionShell
      title="Return Policy Configuration"
      subtitle="Define your return terms, window, and any additional conditions visible to buyers."
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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl fullWidth required error={windowError}>
            <InputLabel>Return Window</InputLabel>
            <Select
              label="Return Window"
              value={returnWindow}
              onChange={e => setReturnWindow(e.target.value)}
            >
              {RETURN_WINDOWS.map(w => (
                <MenuItem key={w.value} value={w.value}>{w.label}</MenuItem>
              ))}
            </Select>
            {windowError && <FormHelperText>Please select a return window</FormHelperText>}
          </FormControl>

          <TextField
            label="Restocking Fee"
            value={restockingFee}
            onChange={e => setRestockingFee(e.target.value.replace(/[^0-9.]/g, ''))}
            error={feeError}
            helperText={feeError ? 'Must be 0–100' : 'Enter 0 for no fee'}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            sx={{ width: 180 }}
            inputProps={{ inputMode: 'decimal' }}
          />
        </Box>

        <TextField
          label="Additional Return Terms"
          multiline
          minRows={4}
          value={additionalTerms}
          onChange={e => setAdditionalTerms(e.target.value)}
          fullWidth
          placeholder="e.g. Items must be in original packaging. Final sale items are non-refundable."
          helperText="Optional — describe any specific return conditions or exceptions."
        />
      </Box>
    </SectionShell>
  )
}
