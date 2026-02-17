import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import { HttpError, errorHandler } from '../../../server/src/middleware/error.middleware';

const mockReq = () => ({}) as unknown as Request;
const mockRes = () =>
{
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
  return res as unknown as Response;
};
const mockNext = vi.fn();

describe('HttpError', () =>
{
  it('sets statusCode and message', () =>
  {
    const err = new HttpError(400, 'Bad request');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Bad request');
    expect(err).toBeInstanceOf(Error);
  });
});

describe('errorHandler', () =>
{
  beforeEach(() =>
  {
    vi.clearAllMocks();
  });

  it('returns statusCode and message for HttpError', () =>
  {
    const res = mockRes();
    errorHandler(new HttpError(404, 'Not found'), mockReq(), res, mockNext);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
  });

  it('returns 500 for generic Error', () =>
  {
    const res = mockRes();
    errorHandler(new Error('Something broke'), mockReq(), res, mockNext);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Something broke' });
  });

  it('returns "Internal Server Error" when error has no message', () =>
  {
    const res = mockRes();
    errorHandler(new Error(), mockReq(), res, mockNext);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  });
});
