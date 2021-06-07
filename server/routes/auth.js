import express from 'express';
import validate from 'express-validation';

/* Importing Controllers */
import userCtrl from '../controllers/user';

/* Importing Utilities */
import paramValidation from '../../config/param-validation';
import { authenticateUser } from '../helpers/authentication';

const router = express.Router();

/** POST /api/auth/login - Returns token if correct email and password is provided */

router.route('/login').post(validate(paramValidation.login), userCtrl.login);

router
  .route('/signup')
  .post(validate(paramValidation.createUser), userCtrl.create);

/**
 * Middleware for protected routes.
 */
router.use(authenticateUser);

/* Verify JWT Token */
// router.route('/verify-token').get(authCtrl.verifyJWT);

/* Logout User */
// router.route('/logout').get(authCtrl.logout);

export default router;
