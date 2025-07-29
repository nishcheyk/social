import { Router } from 'express';
import userRoutes from './user/user.route';
// import similarly your post, comment, like routes when implemented

const router = Router();

router.use('/users', userRoutes);
// router.use('/posts', postRoutes);
// router.use('/comments', commentRoutes);
// router.use('/likes', likeRoutes);

export default router;
