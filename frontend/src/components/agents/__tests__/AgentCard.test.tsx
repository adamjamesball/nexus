import { render, screen, fireEvent } from '@testing-library/react'
import { AgentCard } from '../AgentCard'
import { SustainabilityAgent } from '@/types/agents'
import { FileText } from 'lucide-react'

const mockAgent: SustainabilityAgent = {
  id: 'test-agent',
  name: 'Test Agent',
  description: 'A test agent for sustainability analysis',
  icon: FileText,
  capabilities: [
    'Test capability 1',
    'Test capability 2',
    'Test capability 3'
  ],
  status: 'available',
  category: 'analysis',
  color: {
    light: 'bg-blue-100 text-blue-700 border-blue-200',
    dark: 'bg-blue-950 text-blue-300 border-blue-800',
    accent: 'blue'
  },
  domains: ['Test Domain 1', 'Test Domain 2', 'Test Domain 3', 'Test Domain 4'],
  frameworks: ['Framework 1', 'Framework 2', 'Framework 3']
}

describe('AgentCard', () => {
  it('renders agent information correctly', () => {
    render(<AgentCard agent={mockAgent} />)
    
    expect(screen.getByText('Test Agent')).toBeInTheDocument()
    expect(screen.getByText('A test agent for sustainability analysis')).toBeInTheDocument()
  })

  it('shows status badge when showStatus is true', () => {
    render(<AgentCard agent={mockAgent} showStatus={true} />)
    
    expect(screen.getByText('available')).toBeInTheDocument()
  })

  it('hides status badge when showStatus is false', () => {
    render(<AgentCard agent={mockAgent} showStatus={false} />)
    
    expect(screen.queryByText('available')).not.toBeInTheDocument()
  })

  it('shows limited domains with overflow indicator', () => {
    render(<AgentCard agent={mockAgent} />)
    
    // Should show first 3 domains
    expect(screen.getByText('Test Domain 1')).toBeInTheDocument()
    expect(screen.getByText('Test Domain 2')).toBeInTheDocument()
    expect(screen.getByText('Test Domain 3')).toBeInTheDocument()
    
    // Should show overflow indicator
    expect(screen.getByText('+1 more')).toBeInTheDocument()
  })

  it('shows limited capabilities with overflow indicator', () => {
    render(<AgentCard agent={mockAgent} />)
    
    // Should show first 2 capabilities
    expect(screen.getByText('Test capability 1')).toBeInTheDocument()
    expect(screen.getByText('Test capability 2')).toBeInTheDocument()
    
    // Should show overflow indicator
    expect(screen.getByText('+1 more capabilities')).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', () => {
    const mockOnClick = jest.fn()
    render(<AgentCard agent={mockAgent} onClick={mockOnClick} />)
    
    const card = screen.getByRole('button', { name: /explore agent/i }).closest('[data-testid]') || 
                 document.querySelector('[class*="cursor-pointer"]')
    
    if (card) {
      fireEvent.click(card)
      expect(mockOnClick).toHaveBeenCalledWith(mockAgent)
    }
  })

  it('shows explore button when onClick is provided', () => {
    const mockOnClick = jest.fn()
    render(<AgentCard agent={mockAgent} onClick={mockOnClick} />)
    
    expect(screen.getByRole('button', { name: /explore agent/i })).toBeInTheDocument()
  })

  it('hides explore button when onClick is not provided', () => {
    render(<AgentCard agent={mockAgent} />)
    
    expect(screen.queryByRole('button', { name: /explore agent/i })).not.toBeInTheDocument()
  })

  it('renders in compact mode correctly', () => {
    render(<AgentCard agent={mockAgent} compact={true} />)
    
    // Should show name but hide description in compact mode
    expect(screen.getByText('Test Agent')).toBeInTheDocument()
    expect(screen.queryByText('A test agent for sustainability analysis')).not.toBeInTheDocument()
  })

  it('shows correct status for different agent states', () => {
    const processingAgent = { ...mockAgent, status: 'processing' as const }
    const { rerender } = render(<AgentCard agent={processingAgent} showStatus={true} />)
    
    expect(screen.getByText('processing')).toBeInTheDocument()
    
    const offlineAgent = { ...mockAgent, status: 'offline' as const }
    rerender(<AgentCard agent={offlineAgent} showStatus={true} />)
    
    expect(screen.getByText('offline')).toBeInTheDocument()
  })

  it('displays frameworks with overflow handling', () => {
    render(<AgentCard agent={mockAgent} />)
    
    // Should show first 2 frameworks
    expect(screen.getByText('Framework 1')).toBeInTheDocument()
    expect(screen.getByText('Framework 2')).toBeInTheDocument()
    
    // Should show overflow indicator
    expect(screen.getByText('+1')).toBeInTheDocument()
  })
})