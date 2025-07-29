import { Router } from 'express';
import React from 'react';
import userRoutes from './user/user.route';
// import similarly your post, comment, like routes when implemented

const router = Router();

router.use('/users', userRoutes);

export default router;
