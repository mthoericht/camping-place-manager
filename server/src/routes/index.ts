import { Router } from 'express'
import authRouter from './auth.routes'
import campingPlacesRouter from './campingPlaces.routes'
import campingItemsRouter from './campingItems.routes'
import bookingsRouter from './bookings.routes'
import analyticsRouter from './analytics.routes'
import { requireAuth } from '../middleware/auth.middleware'

const router = Router()
router.use('/auth', authRouter)
router.use('/camping-places', requireAuth, campingPlacesRouter)
router.use('/camping-items', requireAuth, campingItemsRouter)
router.use('/bookings', requireAuth, bookingsRouter)
router.use('/analytics', requireAuth, analyticsRouter)

export default router
