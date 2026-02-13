import type { Meta, StoryObj } from '@storybook/react-vite'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/store/authSlice'
import LoginPage from '@/features/auth/LoginPage'

const baseStore = configureStore({ reducer: { auth: authReducer } })

const meta = {
  title: 'Features/Auth/LoginPage',
  component: LoginPage,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => <Provider store={baseStore}><Story /></Provider>,
  ],
} satisfies Meta<typeof LoginPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
}

export const WithError: Story = {
  decorators: [
    () =>
    {
      const store = configureStore({
        reducer: { auth: authReducer },
        preloadedState:
        {
          auth:
          {
            employee: null,
            token: null,
            status: 'failed' as const,
            error: 'Ungültige E-Mail oder Passwort',
          },
        },
      })
      return (
        <Provider store={store}>
          <MemoryRouter>
            <LoginPage />
          </MemoryRouter>
        </Provider>
      )
    },
  ],
  parameters: { docs: { description: { story: 'Login-Formular mit angezeigter Fehlermeldung.' } } },
}

export const Loading: Story = {
  decorators: [
    () =>
    {
      const store = configureStore({
        reducer: { auth: authReducer },
        preloadedState:
        {
          auth:
          {
            employee: null,
            token: null,
            status: 'loading' as const,
            error: null,
          },
        },
      })
      return (
        <Provider store={store}>
          <MemoryRouter>
            <LoginPage />
          </MemoryRouter>
        </Provider>
      )
    },
  ],
  parameters: { docs: { description: { story: 'Anmelden-Button im Ladezustand.' } } },
}
