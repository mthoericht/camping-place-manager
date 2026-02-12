import { Router } from 'express'
import authRouter from './auth.routes'
import campingPlacesRouter from './campingPlaces.routes'
import campingItemsRouter from './campingItems.routes'
import bookingsRouter from './bookings.routes'
import analyticsRouter from './analytics.routes'
import testRouter from './test.routes'
import { requireAuth } from '../middleware/auth.middleware'

const router = Router()
if (process.env.DATABASE_URL?.includes('test.db'))
  router.use('/test', testRouter)
router.use('/auth', authRouter)
router.use('/camping-places', requireAuth, campingPlacesRouter)
router.use('/camping-items', requireAuth, campingItemsRouter)
router.use('/bookings', requireAuth, bookingsRouter)
router.use('/analytics', requireAuth, analyticsRouter)

export default router
