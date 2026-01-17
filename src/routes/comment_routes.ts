import { Router } from 'express';
import * as CommentController from '../controllers/comment_controller';

const router = Router();

router.get('/', CommentController.getAllComments);
router.get('/:id', CommentController.getCommentById);
router.get('/post/:postId', CommentController.getCommentsByPostId);
router.post('/', CommentController.createComment);
router.put('/:id', CommentController.updateComment);
router.delete('/:id', CommentController.deleteComment);

export default router;
