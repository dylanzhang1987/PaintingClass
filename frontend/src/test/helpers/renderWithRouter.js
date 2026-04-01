import React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

/**
 * Render a component wrapped in BrowserRouter
 * @param {ReactNode} component - Component to render
 * @param {Object} options - Additional render options
 * @returns {Object} Render result
 */
export const renderWithRouter = (component, options = {}) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>,
    options
  )
}
