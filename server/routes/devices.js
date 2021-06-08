import express from 'express';
import validate from 'express-validation';

/* Importing Controllers */
import devicesCtrl from '../controllers/devices';

/* Importing Utilities */
import paramValidation from '../../config/param-validation';
import { authenticateUser } from '../helpers/authentication';

const router = express.Router();


// router.use(authenticateUser);

router.route('/')
.get(validate(paramValidation.getDeviceDetail), devicesCtrl.deviceDetails)
.post(validate(paramValidation.registerDevice), devicesCtrl.registerDevice)
.delete(validate(paramValidation.deleteDevice),devicesCtrl.deviceDelete);

router.route('/share')
.post(validate(paramValidation.shareDevice),devicesCtrl.deviceShare)

router.route('/changeState')
.put(devicesCtrl.changeState);

export default router;
