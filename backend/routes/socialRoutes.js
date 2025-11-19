import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getSocialSummary,
  searchUsers,
  sendFriendRequest,
  respondFriendRequest,
  createConversation,
  getConversationMessages,
  sendMessage,
  createPost,
  toggleLikePost,
  addCommentToPost,
  getNotifications,
  getChallenges,
  createChallenge,
  markNotificationRead,
  createCommunity,
  joinCommunity,
  joinGroupByCode,
  listCommunities,
  participateInChallenge,
  getChallengeLeaderboard
} from '../controllers/socialController.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getSocialSummary);
router.get('/search', searchUsers);

router.post('/friend-request', sendFriendRequest);
router.put('/friend-request/:id/respond', respondFriendRequest);

router.post('/conversations', createConversation);
router.get('/conversations/:id/messages', getConversationMessages);
router.post('/conversations/:id/messages', sendMessage);

router.post('/posts', createPost);
router.put('/posts/:id/like', toggleLikePost);
router.post('/posts/:id/comments', addCommentToPost);

router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

router.get('/challenges', getChallenges);
router.post('/challenges', createChallenge);
router.post('/challenges/:challengeId/participate', participateInChallenge);
router.get('/challenges/:challengeId/leaderboard', getChallengeLeaderboard);

router.post('/communities', createCommunity);
router.post('/communities/:id/join', joinCommunity);
router.get('/communities', listCommunities);

router.post('/groups/join', joinGroupByCode);

export default router;


