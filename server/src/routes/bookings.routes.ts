import { Router } from 'express';
import * as ctrl from '../controllers/bookings.controller';

const router = Router();
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/status', ctrl.changeStatus);
router.get('/:id/status-changes', ctrl.getStatusChanges);
router.get('/:id/items', ctrl.getBookingItems);
router.post('/:id/items', ctrl.addBookingItem);
router.delete('/:id/items/:itemId', ctrl.removeBookingItem);

export default router;
