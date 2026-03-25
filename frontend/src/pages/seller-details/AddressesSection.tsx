import { useState, useEffect } from 'react'
import {
  Box, TextField, Typography, Button, Paper, IconButton, Divider,
} from '@mui/material'
import { Add, Delete } from '@mui/icons-material'
import { supabase } from '../../lib/supabase'
import type { SectionKey, SectionStatusRow, WarehouseEntry } from '../../types'
import SectionShell from './SectionShell'

interface Props {
  sellerId: string
  statusRow: SectionStatusRow
  onStatusChange: (section: SectionKey, updated: SectionStatusRow) => void
}

interface AddressForm {
  street_address: string
  city: string
  state: string
  zip_code: string
}

const emptyAddress = (): AddressForm => ({
  street_address: '', city: '', state: '', zip_code: '',
})

const emptyWarehouse = (): WarehouseEntry => ({
  id: crypto.randomUUID(),
  warehouse_identifier: '',
  street_address: '',
  city: '',
  state: '',
  zip_code: '',
  contact_person: '',
})

const validateAddress = (a: AddressForm, attempted: boolean) => ({
  street_address: attempted && !a.street_address.trim(),
  city: attempted && !a.city.trim(),
  state: attempted && (!/^[A-Za-z]{2}$/.test(a.state)),
  zip_code: attempted && (!/^\d{5}$/.test(a.zip_code)),
})

export default function AddressesSection({ sellerId, statusRow, onStatusChange }: Props) {
  const [business, setBusiness] = useState<AddressForm>(emptyAddress())
  const [warehouses, setWarehouses] = useState<WarehouseEntry[]>([emptyWarehouse()])
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [attempted, setAttempted] = useState(false)

  // Load existing data
  useEffect(() => {
    supabase
      .from('seller_addresses')
      .select('*')
      .eq('seller', sellerId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setBusiness({
            street_address: data.street_address ?? '',
            city: data.city ?? '',
            state: data.state ?? '',
            zip_code: data.zip_code ?? '',
          })
          if (Array.isArray(data.warehouses) && data.warehouses.length > 0) {
            setWarehouses(data.warehouses)
          }
        }
      })
  }, [sellerId])

  const bizErrors = validateAddress(business, attempted)

  const validate = () => {
    const stateOk = /^[A-Za-z]{2}$/.test(business.state)
    const zipOk = /^\d{5}$/.test(business.zip_code)
    return business.street_address.trim() && business.city.trim() && stateOk && zipOk
  }

  const upsertData = async (newStatus: 'draft' | 'submitted') => {
    const { error } = await supabase.from('seller_addresses').upsert({
      seller: sellerId,
      ...business,
      state: business.state.toUpperCase(),
      warehouses,
    }, { onConflict: 'seller' })
    if (error) return false

    const extra = newStatus === 'submitted'
      ? { submitted_at: new Date().toISOString() }
      : {}
    const { error: sErr } = await supabase.from('seller_section_status').upsert({
      seller: sellerId,
      section: 'addresses',
      status: newStatus,
      ...extra,
    }, { onConflict: 'seller,section' })
    return !sErr
  }

  const handleSave = async () => {
    setSaving(true)
    const ok = await upsertData('draft')
    if (ok) onStatusChange('addresses', { ...statusRow, status: 'draft' })
    setSaving(false)
  }

  const handleSubmit = async () => {
    setAttempted(true)
    if (!validate()) return
    setSubmitting(true)
    const now = new Date().toISOString()
    const ok = await upsertData('submitted')
    if (ok) onStatusChange('addresses', { ...statusRow, status: 'submitted', submitted_at: now })
    setSubmitting(false)
  }

  const handleCancelSubmission = async () => {
    setSubmitting(true)
    const { error } = await supabase.from('seller_section_status').upsert({
      seller: sellerId, section: 'addresses', status: 'draft', submitted_at: null,
    }, { onConflict: 'seller,section' })
    if (!error) onStatusChange('addresses', { ...statusRow, status: 'draft', submitted_at: null })
    setSubmitting(false)
  }

  const updateWarehouse = (id: string, field: keyof WarehouseEntry, value: string) => {
    setWarehouses(ws => ws.map(w => w.id === id ? { ...w, [field]: value } : w))
  }

  return (
    <SectionShell
      title="Addresses & Warehouses"
      subtitle="Verification of your physical logistics network. Provide your primary business address and warehouse locations."
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
      {/* Business Address */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'grey.200', borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.6, fontSize: '0.7rem', color: 'text.secondary', mb: 2 }}>
          Primary Business Address
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Street Address"
            value={business.street_address}
            onChange={e => setBusiness(b => ({ ...b, street_address: e.target.value }))}
            error={bizErrors.street_address}
            helperText={bizErrors.street_address ? 'Required' : ''}
            fullWidth
            required
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="City"
              value={business.city}
              onChange={e => setBusiness(b => ({ ...b, city: e.target.value }))}
              error={bizErrors.city}
              helperText={bizErrors.city ? 'Required' : ''}
              fullWidth
              required
            />
            <TextField
              label="State"
              placeholder="CA"
              value={business.state}
              onChange={e => setBusiness(b => ({ ...b, state: e.target.value.toUpperCase().slice(0, 2) }))}
              error={bizErrors.state}
              helperText={bizErrors.state ? '2-letter code required (e.g. CA)' : ''}
              sx={{ width: 120 }}
              required
              inputProps={{ maxLength: 2 }}
            />
            <TextField
              label="ZIP Code"
              placeholder="00000"
              value={business.zip_code}
              onChange={e => setBusiness(b => ({ ...b, zip_code: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
              error={bizErrors.zip_code}
              helperText={bizErrors.zip_code ? '5-digit ZIP required' : ''}
              sx={{ width: 160 }}
              required
              inputProps={{ maxLength: 5 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Warehouses */}
      {warehouses.map((wh, idx) => (
        <Paper key={wh.id} elevation={0} sx={{ p: 3, mb: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.6, fontSize: '0.7rem', color: 'text.secondary' }}>
              {idx === 0 ? 'Main Warehouse Details' : `Warehouse ${idx + 1}`}
            </Typography>
            {idx > 0 && (
              <IconButton size="small" onClick={() => setWarehouses(ws => ws.filter(w => w.id !== wh.id))} sx={{ color: 'error.main' }}>
                <Delete fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Warehouse Identifier"
              placeholder="WH-WEST-01"
              value={wh.warehouse_identifier}
              onChange={e => updateWarehouse(wh.id, 'warehouse_identifier', e.target.value)}
              fullWidth
            />
            <TextField
              label="Street Address"
              value={wh.street_address}
              onChange={e => updateWarehouse(wh.id, 'street_address', e.target.value)}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="City"
                value={wh.city}
                onChange={e => updateWarehouse(wh.id, 'city', e.target.value)}
                fullWidth
              />
              <TextField
                label="State"
                placeholder="CA"
                value={wh.state}
                onChange={e => updateWarehouse(wh.id, 'state', e.target.value.toUpperCase().slice(0, 2))}
                sx={{ width: 120 }}
                inputProps={{ maxLength: 2 }}
              />
              <TextField
                label="ZIP Code"
                value={wh.zip_code}
                onChange={e => updateWarehouse(wh.id, 'zip_code', e.target.value.replace(/\D/g, '').slice(0, 5))}
                sx={{ width: 160 }}
                inputProps={{ maxLength: 5 }}
              />
            </Box>
            <TextField
              label="Warehouse Contact Person"
              value={wh.contact_person}
              onChange={e => updateWarehouse(wh.id, 'contact_person', e.target.value)}
              fullWidth
            />
          </Box>
        </Paper>
      ))}

      <Divider sx={{ my: 2 }} />
      <Button
        startIcon={<Add />}
        variant="outlined"
        size="small"
        onClick={() => setWarehouses(ws => [...ws, emptyWarehouse()])}
        sx={{ borderColor: 'grey.400', color: 'text.secondary' }}
      >
        Add Warehouse
      </Button>
    </SectionShell>
  )
}
