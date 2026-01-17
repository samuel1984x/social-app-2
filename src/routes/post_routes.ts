import { Router } from 'express';
import * as PostController from '../controllers/post';

const router = Router();

router.post('/', PostController.addPost);
router.get('/', PostController.getPosts);
router.get('/:id', PostController.getPostById);
router.put('/:id', PostController.updatePost);

export default router;
