import { Router } from 'express'
import * as ctrl from '../controllers/campingPlaces.controller'

const router = Router()
router.get('/', ctrl.getAll)
router.get('/:id', ctrl.getById)
router.post('/', ctrl.create)
router.patch('/:id', ctrl.update)
router.delete('/:id', ctrl.remove)

export default router
