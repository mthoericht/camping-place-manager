import { Router } from 'express';
import { clearTestDb } from '../test/clearTestDb';
import * as authService from '../services/auth.service';

const router = Router();

router.post('/clear-db', async (_req, res, next) =>
{
  try
  {
    await clearTestDb();
    res.status(204).end();
  }
  catch (e) { next(e); }
});

router.post('/login', async (req, res, next) =>
{
  try
  {
    const email = (req.body?.email as string) ?? 'test@test.de';
    const password = (req.body?.password as string) ?? 'test1234';
    let token: string;
    try
    {
      ;({ token } = await authService.signup({ email, fullName: 'Test User', password }));
    }
    catch
    {
      ;({ token } = await authService.login({ email, password }));
    }
    res.json({ token });
  }
  catch (e) { next(e); }
});

export default router;
