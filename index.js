import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';
import { jwtVerify, createRemoteJWKSet } from 'jose';


const app = express();
const port = process.env.PORT || 5001;

//middleware
app.use(express.json());
app.use(cors());


const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("You successfully connected to MongoDB!");
        return client;
    } catch (err) {
        console.dir(err);
    }
}


const connectedClient = await connectToMongoDB();
const database = connectedClient.db("driveEase");
const users = database.collection("users");


//jwt middleware
const CLIENT_URL = process.env.CLIENT_URL;

const JWKS = createRemoteJWKSet(
    new URL('/api/auth/jwks', CLIENT_URL)
);



//verifyToken
const verifyToken = async (req, res, next) => {
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

    // Find the authenticated user in MongoDB

    if (!ObjectId.isValid(payload.sub)) {
      return res.status(401).send({
        message: "Invalid user ID",
      });
    }
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
const verifyOwner = async (req, res, next) => {
  if (req.user.role !== "OWNER") {
    res.status(403).send({ message: 'Forbidden' });
    return;
  }
  next();
}

//admin verify
const verifyAdmin = async (req, res, next) => {

  console.log("Authenticated user role:", req.user.role);

  if (req.user.role !== "ADMIN") {
    res.status(403).send({ message: 'Forbidden' });
    return;
  }
  next();
}

//verifyRenter
const verifyRenter = async (req, res, next) => {
  if (req.user.role !== "RENTER") {
    res.status(403).send({ message: 'Forbidden' });
    return;
  }
  next();
}



app.get('/', (req, res) => {
    res.send('Lets have a test drive!')
})









app.listen(port, () => {
    console.log(`Driving on port ${port}`)
})