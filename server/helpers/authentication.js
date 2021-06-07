import jwt from 'jsonwebtoken';
import passport from 'passport';
import crypto from 'crypto';
const passphrase = 're-dev';

import config from '../../config/env';
import AppError from './AppError';

// const publicKey = fs.readFileSync(path.resolve('config/public.pem'), 'utf8');
// const privateKey = fs.readFileSync(path.resolve('config/private.pem'), 'utf8');


export const generateJWT = async (user) => {
  const { _id, fName, lName } = user;

  const jwtObject = { _id,fName, lName };

  return await jwt.sign(jwtObject, config.jwtSecret, {
    expiresIn: '7d',
  });
};

export const authenticateUser = async (req, res, next) => {
  passport.authenticate('jwt', config.passportOptions, (error, userDtls, info) => {
    if (!userDtls && !error && !info) {
      const error = new AppError('UNAUTHORIZED', 401);
      return next(error);
    }

    if (error || info) {
      return next(error || info);
    }

    if (userDtls) {
      req.user = userDtls;
      return next();
    }
  })(req, res, next);
};

export const encryptString = async (string) => {
  const buffer = new Buffer.from(string);
  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString('base64');
};

export const decryptString = async (encodedString) => {
  try {
    const buffer = new Buffer.from(encodedString, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey.toString(),
        passphrase: passphrase,
      },
      buffer
    );
    return { success: true, decrypted: decrypted.toString('utf8') };
  } catch (e) {
    return { success: false };
  }
};

// const { writeFileSync } = require('fs');
// const { generateKeyPairSync } = require('crypto');
//
// function generateKeys() {
//   const { publicKey, privateKey } = generateKeyPairSync('rsa', {
//     modulusLength: 1024,
//     namedCurve: 'secp256k1',
//     publicKeyEncoding: {
//       type: 'spki',
//       format: 'pem',
//     },
//     privateKeyEncoding: {
//       type: 'pkcs8',
//       format: 'pem',
//       cipher: 'aes-128-cbc',
//       passphrase: passphrase,
//     },
//   });
//
//   writeFileSync('private.pem', privateKey);
//   writeFileSync('public.pem', publicKey);
// }
//
// generateKeys();
