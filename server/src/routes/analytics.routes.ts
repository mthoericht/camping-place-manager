import { Router } from 'express'
import * as ctrl from '../controllers/analytics.controller'

const router = Router()
router.get('/', ctrl.getAnalytics)

export default router
