import jwt from 'jsonwebtoken';
import passport from 'passport';
import crypto from 'crypto';
const passphrase = 're-dev';

import config from '../../config/env';
import AppError from './AppError';


export const generateJWT = async (user) => {
  const { _id, fName, lName } = user;

  const jwtObject = { _id,fName, lName };

  return await jwt.sign(jwtObject, config.jwtSecret, {
    expiresIn: '7d',
  });
};

export const authenticateUser = async (req, res, next) => {
  try {
    const user = res.locals.loggedInUser;
    if (!user) {
      return res.status(401).json({
        error: "LOGIN_REQUIRED",
        message: "You need to be logged in to access this route",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  }
};


