import mongoose from 'mongoose';
import FriendRequest from '../models/FriendRequest.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import SocialPost from '../models/SocialPost.js';
import Notification from '../models/Notification.js';
import Challenge from '../models/Challenge.js';
import User from '../models/User.js';

const formatUserPreview = (user) => ({
  _id: user._id,
  name: user.name,
  username: user.username,
  phone: user.phone,
  profilePhoto: user.profilePhoto,
  role: user.role
});

const buildFriendList = (userId, friendDocs) => {
  return friendDocs.map((request) => {
    const friend = request.requester._id.toString() === userId.toString()
      ? request.recipient
      : request.requester;
    return {
      _id: friend._id,
      name: friend.name,
      username: friend.username,
      phone: friend.phone,
      profilePhoto: friend.profilePhoto
    };
  });
};

const attachLastMessages = async (conversations) => {
  if (!conversations.length) {
    return [];
  }

  const convoIds = conversations.map((c) => c._id);
  const recentMessages = await Message.find({
    conversation: { $in: convoIds }
  })
    .sort({ createdAt: -1 })
    .limit(convoIds.length * 5)
    .populate('sender', 'name username profilePhoto');

  const messageMap = new Map();
  for (const message of recentMessages) {
    const key = message.conversation.toString();
    if (!messageMap.has(key)) {
      messageMap.set(key, message);
    }
  }

  return conversations.map((conversation) => ({
    ...conversation,
    lastMessage: messageMap.get(conversation._id.toString()) || null
  }));
};

const createJoinCode = async () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  let exists = null;
  do {
    code = Array.from({ length: 6 })
      .map(() => alphabet[Math.floor(Math.random() * alphabet.length)])
      .join('');
    exists = await Conversation.findOne({ joinCode: code });
  } while (exists);
  return code;
};

export const getSocialSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      friendDocs,
      pendingRequests,
      outgoingRequests,
      conversationDocs,
      posts,
      challenges,
      notifications
    ] = await Promise.all([
      FriendRequest.find({
        status: 'accepted',
        $or: [
          { requester: userId },
          { recipient: userId }
        ]
      }).populate('requester recipient', 'name username phone profilePhoto'),
      FriendRequest.find({
        status: 'pending',
        recipient: userId
      }).populate('requester', 'name username phone profilePhoto'),
      FriendRequest.find({
        status: 'pending',
        requester: userId
      }).populate('recipient', 'name username phone profilePhoto'),
      Conversation.find({
        members: userId
      })
        .populate('members', 'name username profilePhoto role')
        .sort({ updatedAt: -1 })
        .lean(),
      SocialPost.find({
        $or: [
          { visibility: 'public' },
          { user: userId }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('user', 'name username profilePhoto')
        .populate('comments.user', 'name username profilePhoto'),
      Challenge.find({})
        .populate('participants.user', 'name username profilePhoto')
        .sort({ createdAt: -1 })
        .limit(5),
      Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(15)
    ]);

    const friends = buildFriendList(userId, friendDocs);
    const pending = pendingRequests.map((request) => ({
      _id: request._id,
      requester: formatUserPreview(request.requester),
      status: request.status,
      createdAt: request.createdAt
    }));

    const outgoing = outgoingRequests.map((request) => ({
      _id: request._id,
      recipient: formatUserPreview(request.recipient),
      status: request.status,
      createdAt: request.createdAt
    }));

    const conversationsWithMessages = await attachLastMessages(conversationDocs);
    const chats = conversationsWithMessages.filter((c) => c.type === 'direct');
    const groups = conversationsWithMessages.filter((c) => c.type !== 'direct');

    const unreadNotificationCount = notifications.filter((n) => !n.read).length;

    res.json({
      friends,
      pendingRequests: pending,
      outgoingRequests: outgoing,
      chats,
      groups,
      posts,
      challenges,
      notifications,
      unreadNotificationCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim().length < 2) {
      return res.json([]);
    }

    const regex = new RegExp(query.trim(), 'i');
    const results = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { username: regex },
        { phone: regex },
        { name: regex }
      ]
    }).select('name username phone profilePhoto role');

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;

    if (!recipientId || recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Invalid recipient' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existing = await FriendRequest.findOne({
      $or: [
        { requester: req.user._id, recipient: recipientId },
        { requester: recipientId, recipient: req.user._id }
      ]
    });

    if (existing) {
      return res.status(400).json({ message: 'A request already exists between these users' });
    }

    const request = await FriendRequest.create({
      requester: req.user._id,
      recipient: recipientId
    });

    await Notification.create({
      user: recipientId,
      type: 'friend',
      title: 'New Friend Request',
      message: `${req.user.name} sent you a friend request`,
      payload: { friendRequestId: request._id }
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const respondFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const request = await FriendRequest.findOne({
      _id: id,
      recipient: req.user._id
    });

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    request.status = action === 'accept' ? 'accepted' : 'declined';
    await request.save();

    if (action === 'accept') {
      const existingConversation = await Conversation.findOne({
        type: 'direct',
        members: { $all: [request.requester, req.user._id], $size: 2 }
      });

      if (!existingConversation) {
        await Conversation.create({
          type: 'direct',
          members: [request.requester, req.user._id]
        });
      }

      await Notification.create({
        user: request.requester,
        type: 'friend',
        title: 'Friend Request Accepted',
        message: `${req.user.name} accepted your friend request`,
        payload: { friendRequestId: request._id }
      });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createConversation = async (req, res) => {
  try {
    const { memberIds, name, type, description } = req.body;
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ message: 'Members are required' });
    }

    const uniqueMemberIds = [...new Set([...memberIds, req.user._id.toString()])].map((id) => new mongoose.Types.ObjectId(id));

    let conversation;

    if (type === 'direct' || uniqueMemberIds.length === 2) {
      conversation = await Conversation.findOne({
        type: 'direct',
        members: { $all: uniqueMemberIds, $size: 2 }
      });
      if (conversation) {
        return res.json(conversation);
      }
    }

    let conversationType = type || (uniqueMemberIds.length > 2 ? 'group' : 'direct');
    if (conversationType === 'group' && (!name || name.trim().length < 3)) {
      return res.status(400).json({ message: 'Group name must be at least 3 characters' });
    }

    let joinCode = null;
    if (conversationType === 'group') {
      joinCode = await createJoinCode();
    }

    conversation = await Conversation.create({
      name,
      type: conversationType,
      createdBy: req.user._id,
      members: uniqueMemberIds,
      description,
      joinCode
    });

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);

    if (!conversation || !conversation.members.some((memberId) => memberId.equals(req.user._id))) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversation: id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'name username profilePhoto');

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const conversation = await Conversation.findById(id);
    if (!conversation || !conversation.members.some((memberId) => memberId.equals(req.user._id))) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const message = await Message.create({
      conversation: id,
      sender: req.user._id,
      content: content.trim()
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    const populatedMessage = await message.populate('sender', 'name username profilePhoto');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content, mediaUrls, challengeId, visibility } = req.body;

    if (!content && (!mediaUrls || !mediaUrls.length)) {
      return res.status(400).json({ message: 'Post cannot be empty' });
    }

    const post = await SocialPost.create({
      user: req.user._id,
      content,
      mediaUrls: mediaUrls || [],
      challengeId,
      visibility: visibility || 'public'
    });

    const populated = await post.populate('user', 'name username profilePhoto');
    await populated.populate('comments.user', 'name username profilePhoto');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({})
      .populate('participants.user', 'name username profilePhoto')
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit || 10, 10));
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await SocialPost.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userIdString = req.user._id.toString();
    const hasLiked = post.likes.some((likeId) => likeId.toString() === userIdString);

    if (hasLiked) {
      post.likes = post.likes.filter((likeId) => likeId.toString() !== userIdString);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    const updatedPost = await SocialPost.findById(id)
      .populate('user', 'name username profilePhoto')
      .populate('comments.user', 'name username profilePhoto');

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addCommentToPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    const post = await SocialPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      user: req.user._id,
      content: content.trim()
    });

    await post.save();

    const updatedPost = await SocialPost.findById(id)
      .populate('user', 'name username profilePhoto')
      .populate('comments.user', 'name username profilePhoto');

    res.status(201).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.unreadOnly === 'true') {
      filter.read = false;
    }
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit || 50, 10));
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      _id: id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCommunity = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only gym owners/admins can create communities' });
    }

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Community name is required' });
    }

    const community = await Conversation.create({
      name,
      description,
      type: 'community',
      createdBy: req.user._id,
      gymOwner: req.user._id,
      members: [req.user._id]
    });

    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinGroupByCode = async (req, res) => {
  try {
    const { joinCode } = req.body;
    if (!joinCode) {
      return res.status(400).json({ message: 'Join code is required' });
    }

    const conversation = await Conversation.findOne({
      joinCode: joinCode.trim().toUpperCase(),
      type: 'group'
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!conversation.members.some((memberId) => memberId.equals(req.user._id))) {
      conversation.members.push(req.user._id);
      await conversation.save();
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const community = await Conversation.findById(id);

    if (!community || community.type !== 'community') {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.members.some((memberId) => memberId.equals(req.user._id))) {
      community.members.push(req.user._id);
      await community.save();
    }

    res.json(community);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listCommunities = async (req, res) => {
  try {
    const { query } = req.query;
    const filter = { type: 'community' };
    if (query) {
      filter.name = { $regex: query, $options: 'i' };
    }

    const communities = await Conversation.find(filter)
      .sort({ createdAt: -1 })
      .select('name description members joinCode createdBy');

    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createChallenge = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create challenges' });
    }

    const { title, description, difficulty, deadline, reward } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const challenge = await Challenge.create({
      title,
      description,
      createdBy: req.user._id,
      difficulty: difficulty || 'Beginner',
      deadline,
      reward
    });

    res.status(201).json(challenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const participateInChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const participantIndex = challenge.participants.findIndex(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (participantIndex === -1) {
      challenge.participants.push({
        user: req.user._id,
        progress: 100,
        completed: true,
        completedAt: new Date()
      });
    } else {
      challenge.participants[participantIndex].progress = 100;
      challenge.participants[participantIndex].completed = true;
      if (!challenge.participants[participantIndex].completedAt) {
        challenge.participants[participantIndex].completedAt = new Date();
      }
    }

    await challenge.save();
    await challenge.populate('participants.user', 'name username profilePhoto');
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChallengeLeaderboard = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const challenge = await Challenge.findById(challengeId)
      .populate('participants.user', 'name username profilePhoto');

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const completed = challenge.participants
      .filter((p) => p.completed && p.completedAt)
      .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt))
      .map((p, index) => ({
        rank: index + 1,
        user: p.user,
        completedAt: p.completedAt
      }));

    res.json({ challenge: { title: challenge.title, _id: challenge._id }, leaderboard: completed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

