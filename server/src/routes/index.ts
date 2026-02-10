import { Router } from 'express'
import campingPlacesRouter from './campingPlaces.routes'
import campingItemsRouter from './campingItems.routes'
import bookingsRouter from './bookings.routes'
import analyticsRouter from './analytics.routes'

const router = Router()
router.use('/camping-places', campingPlacesRouter)
router.use('/camping-items', campingItemsRouter)
router.use('/bookings', bookingsRouter)
router.use('/analytics', analyticsRouter)

export default router
