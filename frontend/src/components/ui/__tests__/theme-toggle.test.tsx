import { render, screen, fireEvent } from '@testing-library/react'
import { useTheme } from 'next-themes'
import { ThemeToggle } from '../theme-toggle'

// Mock next-themes
jest.mock('next-themes')
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>

describe('ThemeToggle', () => {
  const mockSetTheme = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders theme toggle button', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
      systemTheme: 'light',
      forcedTheme: undefined,
    })

    render(<ThemeToggle />)
    
    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toBeInTheDocument()
  })

  it('shows sun icon in light mode', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
      systemTheme: 'light',
      forcedTheme: undefined,
    })

    render(<ThemeToggle />)
    
    // Sun icon should be visible in light mode
    const sunIcon = screen.getByTestId('sun-icon')
    expect(sunIcon).toHaveClass('scale-100')
  })

  it('switches to dark theme when clicked in light mode', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
      systemTheme: 'light',
      forcedTheme: undefined,
    })

    render(<ThemeToggle />)
    
    const button = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(button)
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('switches to light theme when clicked in dark mode', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      themes: ['light', 'dark'],
      systemTheme: 'dark',
      forcedTheme: undefined,
    })

    render(<ThemeToggle />)
    
    const button = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(button)
    
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('has proper accessibility attributes', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      themes: ['light', 'dark'],
      systemTheme: 'light',
      forcedTheme: undefined,
    })

    render(<ThemeToggle />)
    
    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toHaveAttribute('aria-label')
    
    const srText = screen.getByText('Toggle theme')
    expect(srText).toHaveClass('sr-only')
  })
})