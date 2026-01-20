import { Router } from 'express';
import * as CommentController from '../controllers/comment_controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', CommentController.getAllComments);
router.get('/:id', CommentController.getCommentById);
router.get('/post/:postId', CommentController.getCommentsByPostId);
router.post('/', authenticate, CommentController.createComment);
router.put('/:id', authenticate, CommentController.updateComment);
router.delete('/:id', authenticate, CommentController.deleteComment);

export default router;
