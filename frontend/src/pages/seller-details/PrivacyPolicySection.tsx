import { useState, useEffect } from 'react'
import { Box, TextField, Typography, Paper } from '@mui/material'
import { InfoOutlined } from '@mui/icons-material'
import { supabase } from '../../lib/supabase'
import type { SectionKey, SectionStatusRow } from '../../types'
import SectionShell from './SectionShell'

interface Props {
  sellerId: string
  statusRow: SectionStatusRow
  onStatusChange: (section: SectionKey, updated: SectionStatusRow) => void
}

const MIN_CHARS = 100

export default function PrivacyPolicySection({ sellerId, statusRow, onStatusChange }: Props) {
  const [policyTitle, setPolicyTitle] = useState('')
  const [policyContent, setPolicyContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [attempted, setAttempted] = useState(false)

  useEffect(() => {
    supabase.from('seller_privacy_policy').select('*').eq('seller', sellerId).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setPolicyTitle(data.policy_title ?? '')
          setPolicyContent(data.policy_content ?? '')
        }
      })
  }, [sellerId])

  const contentError = attempted && policyContent.trim().length < MIN_CHARS

  const validate = () => policyContent.trim().length >= MIN_CHARS

  const upsertData = async (newStatus: 'draft' | 'submitted') => {
    const { error } = await supabase.from('seller_privacy_policy').upsert({
      seller: sellerId,
      policy_title: policyTitle,
      policy_content: policyContent,
    }, { onConflict: 'seller' })
    if (error) return false
    const extra = newStatus === 'submitted' ? { submitted_at: new Date().toISOString() } : {}
    const { error: sErr } = await supabase.from('seller_section_status').upsert({
      seller: sellerId, section: 'privacy_policy', status: newStatus, ...extra,
    }, { onConflict: 'seller,section' })
    return !sErr
  }

  const handleSave = async () => {
    setSaving(true)
    const ok = await upsertData('draft')
    if (ok) onStatusChange('privacy_policy', { ...statusRow, status: 'draft' })
    setSaving(false)
  }

  const handleSubmit = async () => {
    setAttempted(true)
    if (!validate()) return
    setSubmitting(true)
    const now = new Date().toISOString()
    const ok = await upsertData('submitted')
    if (ok) onStatusChange('privacy_policy', { ...statusRow, status: 'submitted', submitted_at: now })
    setSubmitting(false)
  }

  const handleCancelSubmission = async () => {
    setSubmitting(true)
    const { error } = await supabase.from('seller_section_status').upsert({
      seller: sellerId, section: 'privacy_policy', status: 'draft', submitted_at: null,
    }, { onConflict: 'seller,section' })
    if (!error) onStatusChange('privacy_policy', { ...statusRow, status: 'draft', submitted_at: null })
    setSubmitting(false)
  }

  return (
    <SectionShell
      title="Privacy Policy"
      subtitle="Provide a store privacy policy visible to your customers on the marketplace."
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
          label="Policy Title"
          placeholder="e.g. Standard Marketplace Privacy Protocol v2.1"
          value={policyTitle}
          onChange={e => setPolicyTitle(e.target.value)}
          fullWidth
        />

        <Box>
          <TextField
            label="Privacy Policy Content"
            multiline
            minRows={10}
            value={policyContent}
            onChange={e => setPolicyContent(e.target.value)}
            fullWidth
            required
            error={contentError}
            helperText={
              contentError
                ? `Minimum ${MIN_CHARS} characters required (currently ${policyContent.trim().length})`
                : `${policyContent.trim().length} characters`
            }
            placeholder="At [Your Store Name], we prioritize user privacy and data security. We collect the following information…"
          />
        </Box>

        <Paper
          elevation={0}
          sx={{ display: 'flex', gap: 1.5, p: 2, bgcolor: '#f5f7ff', border: '1px solid #c5d0f0', borderRadius: 2 }}
        >
          <InfoOutlined sx={{ color: '#3366cc', fontSize: 18, flexShrink: 0, mt: 0.1 }} />
          <Box>
            <Typography variant="caption" fontWeight={700} color="#3366cc" display="block" mb={0.25}>
              Need help with legal wording?
            </Typography>
            <Typography variant="caption" color="text.secondary">
              View our editorial guide on compliance requirements to ensure your policy meets regional standards.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </SectionShell>
  )
}
