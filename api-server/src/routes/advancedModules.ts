// @ts-nocheck
// @ts-nocheck
// @ts-nocheck
import { Router } from 'express';
import { getModuleData } from '../controllers/superModuleController';
import { authenticate } from '../middleware/rbac'; // Path from scan v3

const router = Router();

router.get('/pharmacy', authenticate, getModuleData('pharmacy_orders'));
router.get('/van-bookings', authenticate, getModuleData('van_bookings'));
router.get('/school-routes', authenticate, getModuleData('school_routes'));
router.get('/parcel', authenticate, getModuleData('parcel_bookings'));

export default router;
