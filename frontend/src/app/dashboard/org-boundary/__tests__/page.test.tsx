import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import OrgBoundaryPage from '../page'

// Mock apiClient to avoid real network
jest.mock('@/lib/api', () => ({
  apiClient: {
    createSession: jest.fn().mockResolvedValue({ session_id: 'test-session-frontend' }),
    connectWebSocket: jest.fn().mockReturnValue({ close: jest.fn() }),
    uploadFile: jest.fn(),
    startProcessing: jest.fn(),
    getResults: jest.fn(),
    listExports: jest.fn().mockResolvedValue({ files: [] }),
    getExportUrl: jest.fn((id: string, name: string) => `/api/v2/sessions/${id}/exports/${name}`)
  }
}))

// Mock zustand store to provide deterministic state
jest.mock('@/lib/store', () => {
  const actual = jest.requireActual('@/lib/store')
  const useNexusStore = jest.fn().mockImplementation(() => ({
    currentSession: { id: 'local-session', status: 'uploading', files: [], agents: [], startTime: new Date().toISOString() },
    uploadedFiles: [],
    isProcessing: false,
    createSession: jest.fn(),
    startProcessing: jest.fn(),
    completeProcessing: jest.fn(),
    setProcessingError: jest.fn(),
  }))
  return { useNexusStore }
})

describe('OrgBoundaryPage', () => {
  it('renders without any modal/pop-up and shows primary controls', async () => {
    render(<OrgBoundaryPage />)

    // Title
    expect(screen.getByText('Org Boundary & Structure')).toBeInTheDocument()

    // Upload section present
    expect(screen.getByText('Upload Site/Entity Lists (Excel/CSV)')).toBeInTheDocument()

    // Start button should be rendered (disabled since no files yet)
    const startBtn = screen.getByRole('button', { name: /start/i })
    expect(startBtn).toBeInTheDocument()
    expect(startBtn).toBeDisabled()

    // Ensure no dialog overlay/content is present initially
    await waitFor(() => {
      const overlays = document.querySelectorAll('[data-slot="dialog-overlay"], [data-slot="dialog-content"]')
      expect(overlays.length).toBe(0)
    })
  })
})
