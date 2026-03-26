import React from 'react'

/**
 * SectionShell — shared wrapper rendered around every seller-details section.
 *
 * Renders the status banner (submitted / approved / rejected) and exposes the
 * action-button row (Save Changes + Submit for Approval, or Cancel Submission).
 */
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Alert,
} from '@mui/material'
import {
  Lock,
  CheckCircle,
  ErrorOutline,
  InfoOutlined,
} from '@mui/icons-material'
import type { SectionStatus } from '../../types'

interface SectionShellProps {
  title: string
  subtitle: string
  status: SectionStatus
  rejectionReason?: string | null
  submittedAt?: string | null
  reviewedAt?: string | null
  reviewedBy?: string | null
  approvalId?: string | null
  saving: boolean
  submitting: boolean
  onSave: () => void
  onSubmit: () => void
  onCancelSubmission: () => void
  children: React.ReactNode
}

export default function SectionShell({
  title,
  subtitle,
  status,
  rejectionReason,
  submittedAt,
  reviewedAt,
  reviewedBy,
  approvalId,
  saving,
  submitting,
  onSave,
  onSubmit,
  onCancelSubmission,
  children,
}: SectionShellProps) {
  const isLocked = status === 'submitted' || status === 'approved'

  const formatDate = (iso?: string | null) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  }

  return (
    <Box>
      {/* ── Status banners ── */}
      {status === 'approved' && (
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 1.5,
            mb: 3,
            bgcolor: '#f0faf4',
            border: '1px solid #b7dfca',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle sx={{ color: '#2e7d32', fontSize: 20 }} />
            <Typography variant="body2" fontWeight={600} color="#2e7d32">
              Status: Approved
              {reviewedAt ? ` — Verified on ${formatDate(reviewedAt)}` : ''}
            </Typography>
          </Box>
          <CheckCircle sx={{ color: '#2e7d32', fontSize: 22, opacity: 0.6 }} />
        </Paper>
      )}

      {status === 'submitted' && (
        <>
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2.5,
              py: 1.25,
              mb: 1,
              bgcolor: '#e8f0fe',
              border: '1px solid #aec6f6',
              borderRadius: 2,
            }}
          >
            <InfoOutlined sx={{ color: '#3366cc', fontSize: 18 }} />
            <Typography variant="body2" fontWeight={700} color="#3366cc" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Status: Submitted (Pending)
            </Typography>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2.5,
              py: 1.25,
              mb: 3,
              bgcolor: '#fff3e0',
              border: '1px solid #ffcc80',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Lock sx={{ color: '#e65100', fontSize: 18 }} />
              <Typography variant="body2" color="#bf360c">
                Status: Pending Review — This section is currently locked for editing.
              </Typography>
            </Box>
            <Chip label="LOCKED" size="small" sx={{ bgcolor: '#e65100', color: '#fff', fontWeight: 700, fontSize: '0.65rem' }} />
          </Paper>
        </>
      )}

      {status === 'rejected' && (
        <Alert
          severity="error"
          icon={<ErrorOutline />}
          sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}
        >
          <Typography variant="body2" fontWeight={700} mb={0.5}>
            Rejection Reason: {rejectionReason || 'Your submission was rejected.'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please review the feedback above, make the necessary corrections, and resubmit for approval.
          </Typography>
        </Alert>
      )}

      {/* ── Two-column layout: form + right sidebar ── */}
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {/* Main form area */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Section heading */}
          <Typography variant="h5" fontWeight={800} mb={0.5}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {subtitle}
          </Typography>

          {/* Section content (form fields) */}
          <Box sx={{ opacity: isLocked ? 0.75 : 1, pointerEvents: isLocked ? 'none' : 'auto' }}>
            {children}
          </Box>

          {/* ── Action buttons ── */}
          {status !== 'approved' && (
            <Box sx={{ display: 'flex', gap: 2, mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'grey.200' }}>
              {status === 'submitted' ? (
                <Button
                  variant="outlined"
                  onClick={onCancelSubmission}
                  disabled={submitting}
                  sx={{ borderColor: 'grey.400', color: 'text.secondary' }}
                >
                  Cancel Submission
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    onClick={onSave}
                    disabled={saving || submitting}
                    sx={{ borderColor: 'grey.400', color: 'text.secondary' }}
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={onSubmit}
                    disabled={saving || submitting}
                  >
                    {submitting ? 'Submitting…' : status === 'rejected' ? 'Edit & Resubmit' : 'Submit for Approval'}
                  </Button>
                </>
              )}
            </Box>
          )}
        </Box>

        {/* Right sidebar — shown only for approved or submitted sections */}
        {(status === 'approved' || status === 'submitted') && (
          <Box sx={{ width: 220, flexShrink: 0 }}>
            {status === 'approved' && (
              <>
                <Paper
                  elevation={0}
                  sx={{ p: 2.5, mb: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 2 }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="#CC0000"
                    sx={{ textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', mb: 1.5 }}
                  >
                    Verification Details
                  </Typography>

                  {reviewedBy && (
                    <Box mb={1.5}>
                      <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: 0.5, display: 'block' }}>
                        Verified By
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {reviewedBy}
                      </Typography>
                    </Box>
                  )}

                  {approvalId && (
                    <Box mb={1.5}>
                      <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: 0.5, display: 'block' }}>
                        Approval ID
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                        {approvalId}
                      </Typography>
                    </Box>
                  )}

                  {reviewedAt && (
                    <Box>
                      <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: 0.5, display: 'block' }}>
                        Last Modified
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatDate(reviewedAt)}
                      </Typography>
                    </Box>
                  )}
                </Paper>

                <Paper
                  elevation={0}
                  sx={{ p: 2.5, bgcolor: '#fff8e1', border: '1px solid #ffe082', borderRadius: 2 }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="#f57f17"
                    sx={{ textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', mb: 1 }}
                  >
                    Helpful Tip
                  </Typography>
                  <Typography variant="caption" color="text.secondary" lineHeight={1.6} display="block" mb={1.5}>
                    Your information is locked because this section is in <strong>APPROVED</strong> status. To update, please submit a modification request.
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ fontSize: '0.75rem', borderColor: 'grey.400' }}
                    endIcon={<span style={{ fontSize: 12 }}>↗</span>}
                  >
                    Request Edit Access
                  </Button>
                </Paper>
              </>
            )}

            {status === 'submitted' && submittedAt && (
              <Paper
                elevation={0}
                sx={{ p: 2.5, border: '1px solid', borderColor: 'grey.200', borderRadius: 2 }}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.disabled"
                  sx={{ textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', mb: 1.5 }}
                >
                  Submission Info
                </Typography>
                <Box mb={1.5}>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}>
                    Submitted On
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatDate(submittedAt)}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" lineHeight={1.6} display="block">
                  Our curation team will review your submission within 2–3 business days.
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}
