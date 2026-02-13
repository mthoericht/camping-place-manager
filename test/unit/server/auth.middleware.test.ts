import { describe, it, expect, vi, beforeEach } from 'vitest'
import { requireAuth } from '../../../server/src/middleware/auth.middleware'
import * as authService from '../../../server/src/services/auth.service'

vi.mock('../../../server/src/services/auth.service', () => ({
  verifyToken: vi.fn(),
}))

const mockReq = (headers: Record<string, string> = {}) =>
  ({ headers }) as unknown as Parameters<typeof requireAuth>[0]
const mockRes = () => ({}) as unknown as Parameters<typeof requireAuth>[1]
const mockNext = vi.fn()

describe('requireAuth', () =>
{
  beforeEach(() =>
  {
    vi.clearAllMocks()
  })

  it('calls next with 401 HttpError when no Authorization header', () =>
  {
    requireAuth(mockReq(), mockRes(), mockNext)
    expect(mockNext).toHaveBeenCalledTimes(1)
    expect(mockNext.mock.calls[0][0]).toMatchObject({ statusCode: 401 })
  })

  it('calls next with 401 HttpError when Authorization header does not start with Bearer', () =>
  {
    requireAuth(mockReq({ authorization: 'Basic abc' }), mockRes(), mockNext)
    expect(mockNext).toHaveBeenCalledTimes(1)
    expect(mockNext.mock.calls[0][0]).toMatchObject({ statusCode: 401 })
  })

  it('sets req.employeeId and calls next() on valid token', () =>
  {
    vi.mocked(authService.verifyToken).mockReturnValue({ id: 42, email: 'test@test.de' })
    const req = mockReq({ authorization: 'Bearer valid-token' })
    requireAuth(req, mockRes(), mockNext)
    expect(authService.verifyToken).toHaveBeenCalledWith('valid-token')
    expect(req.employeeId).toBe(42)
    expect(mockNext).toHaveBeenCalledWith()
  })

  it('calls next with error when verifyToken throws', () =>
  {
    const error = new Error('Token expired')
    vi.mocked(authService.verifyToken).mockImplementation(() => { throw error })
    requireAuth(mockReq({ authorization: 'Bearer bad-token' }), mockRes(), mockNext)
    expect(mockNext).toHaveBeenCalledWith(error)
  })
})
