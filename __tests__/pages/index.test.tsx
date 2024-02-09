import { render, screen, waitFor } from '@testing-library/react'

import App from 'pages/index'

describe('App', () => {
  it('matches the snapshot', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen).toMatchSnapshot()
    })
  })
})
