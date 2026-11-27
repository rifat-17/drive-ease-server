import 'dotenv/config';
import { ObjectId } from 'mongodb';
import { jwtVerify, createRemoteJWKSet } from 'jose';

import { getCollection } from '../config/db.js';

const CLIENT_URL = process.env.CLIENT_URL;

const JWKS = createRemoteJWKSet(
  new URL('/api/auth/jwks', CLIENT_URL)
);

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send({
        message: 'Unauthorized access',
      });
    }

    const token = authHeader.split(' ')[1];

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: CLIENT_URL,
      audience: CLIENT_URL,
    });

    if (!payload.sub) {
      return res.status(401).send({
        message: 'Invalid token',
      });
    }

    if (!ObjectId.isValid(payload.sub)) {
      return res.status(401).send({
        message: 'Invalid user ID',
      });
    }

    const users = getCollection('users');

    const user = await users.findOne({
      _id: new ObjectId(payload.sub),
    });

    if (!user) {
      return res.status(401).send({
        message: 'User not found',
      });
    }

    if (user.isBlocked) {
      return res.status(403).send({
        message: 'Your account has been blocked',
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);

    return res.status(401).send({
      message: 'Invalid or expired token',
    });
  }
};

//owner verify
export const verifyOwner = async (req, res, next) => {
  if (req.user.role !== 'OWNER') {
    res.status(403).send({ message: 'Forbidden' });
    return;
  }

  next();
};


//admin veirfy
export const verifyAdmin = async (req, res, next) => {
  console.log('Authenticated user role:', req.user.role);

  if (req.user.role !== 'ADMIN') {
    res.status(403).send({ message: 'Forbidden' });
    return;
  }

  next();
};


//renter verify
export const verifyRenter = async (req, res, next) => {
  if (req.user.role !== 'RENTER') {
    res.status(403).send({ message: 'Forbidden' });
    return;
  }

  next();
};
