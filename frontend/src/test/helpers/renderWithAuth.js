import React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext.jsx'

/**
 * Render a component with AuthContext
 * @param {ReactNode} component - Component to render
 * @param {Object} user - Mock user data (defaults to admin user)
 * @param {string} token - Mock auth token (defaults to 'mock-token')
 * @param {Object} options - Additional render options
 * @returns {Object} Render result
 */
export const renderWithAuth = (component, user = null, token = 'mock-token', options = {}) => {
  const mockUser = user || {
    id: 1,
    full_name: 'Test Admin',
    role: 'super_admin',
    username: 'admin',
    email: 'admin@example.com'
  }

  const wrapper = ({ children }) => (
    <BrowserRouter>
      <AuthProvider initialUser={mockUser} initialToken={token}>
        {children}
      </AuthProvider>
    </BrowserRouter>
  )

  return render(component, { wrapper, ...options })
}
