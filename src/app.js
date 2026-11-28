import express from 'express';
import cors from 'cors';

import carRoutes from './modules/cars/car.routes.js';
import rentalRoutes from './modules/rentals/rental.routes.js';
import reviewRoutes from './modules/reviews/review.routes.js';
import userRoutes from './modules/users/user.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import ownerRoutes from "./modules/owners/owner.routes.js";

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Lets have a test drive!');
});

// Feature routers are scaffolded now and will contain endpoints as each
// feature is implemented.
app.use('/api/cars', carRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/owners", ownerRoutes);

export default app;
