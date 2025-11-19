import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './SocialPage.css';

const tabs = [
  { id: 'chat', label: 'Chats' },
  { id: 'feed', label: 'Feed' },
  { id: 'groups', label: 'Groups' },
  { id: 'notifications', label: 'Notifications' }
];

const SocialPage = () => {
  const { user, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('chat');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [postContent, setPostContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [creatingPost, setCreatingPost] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groupForm, setGroupForm] = useState({ name: '', description: '' });
  const [groupJoinCode, setGroupJoinCode] = useState('');
  const [groupFeedback, setGroupFeedback] = useState('');
  const [communitySearch, setCommunitySearch] = useState('');
  const [communityResults, setCommunityResults] = useState([]);
  const [communityForm, setCommunityForm] = useState({ name: '', description: '' });
  const [challengeForm, setChallengeForm] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner',
    deadline: '',
    reward: ''
  });
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [joiningGroup, setJoiningGroup] = useState(false);
  const [creatingCommunity, setCreatingCommunity] = useState(false);
  const [creatingChallenge, setCreatingChallenge] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabs.some((tab) => tab.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchSummary();
    fetchNotifications();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetchCommunities(communitySearch, controller.signal);
    }, 400);
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [communitySearch]);

  const friendStatusMap = useMemo(() => {
    const map = new Map();
    summary?.friends?.forEach((friend) => map.set(friend._id, 'friend'));
    summary?.pendingRequests?.forEach((request) => {
      if (request.requester?._id) {
        map.set(request.requester._id, 'incoming');
      }
    });
    summary?.outgoingRequests?.forEach((request) => {
      if (request.recipient?._id) {
        map.set(request.recipient._id, 'pending');
      }
    });
    return map;
  }, [summary]);

  const formatDateTime = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleString();
  };

  const getChatTitle = (conversation) => {
    if (!conversation) return '';
    if (conversation.type === 'direct') {
      const others = conversation.members?.filter((member) => member._id !== user?._id);
      if (others?.length) {
        return others.map((member) => member.name || member.username).join(', ');
      }
    }
    return conversation.name || 'Conversation';
  };

  const getChatSubtitle = (conversation) => {
    if (!conversation) return '';
    if (conversation.type === 'direct') {
      const other = conversation.members?.find((member) => member._id !== user?._id);
      if (other) {
        return other.username ? `@${other.username}` : other.name;
      }
    }
    return `${conversation.members?.length || 0} members`;
  };

  const getRelationshipStatus = (person) => {
    if (!person) return null;
    return person.relationshipStatus || friendStatusMap.get(person._id) || null;
  };

  const updatePostState = (updatedPost) => {
    setSummary((prev) => ({
      ...prev,
      posts: prev.posts.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    }));
  };

  const fetchCommunities = async (query = '', signal) => {
    try {
      const { data } = await api.get('/social/communities', {
        params: { query },
        signal
      });
      setCommunityResults(data);
    } catch (error) {
      if (error.name !== 'CanceledError') {
        console.error('Failed to load communities', error);
      }
    }
  };

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/social/summary');
      setSummary(data);
      setFriendRequests(data.pendingRequests || []);
      if (data.chats?.length) {
        if (selectedConversation) {
          const existing = data.chats.find((chat) => chat._id === selectedConversation._id);
          if (existing) {
            setSelectedConversation(existing);
          } else {
            setSelectedConversation(data.chats[0]);
            fetchMessages(data.chats[0]._id);
          }
        } else {
          setSelectedConversation(data.chats[0]);
          fetchMessages(data.chats[0]._id);
        }
      } else {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching social summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/social/notifications');
      setNotifications(data);
      window.dispatchEvent(new Event('social:notifications'));
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const { data } = await api.get(`/social/conversations/${conversationId}/messages`);
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages', error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation._id);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;
    try {
      setSendingMessage(true);
      const { data } = await api.post(`/social/conversations/${selectedConversation._id}/messages`, {
        content: messageInput.trim()
      });
      setMessages((prev) => [...prev, data]);
      setMessageInput('');
      fetchSummary();
    } catch (error) {
      console.error('Failed to send message', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      const { data } = await api.put(`/social/posts/${postId}/like`);
      updatePostState(data);
    } catch (error) {
      console.error('Failed to toggle like', error);
    }
  };

  const handleAddComment = async (postId) => {
    const content = commentInputs[postId];
    if (!content || !content.trim()) return;
    try {
      const { data } = await api.post(`/social/posts/${postId}/comments`, { content });
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      updatePostState(data);
    } catch (error) {
      console.error('Failed to add comment', error);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    try {
      setCreatingPost(true);
      await api.post('/social/posts', { content: postContent.trim() });
      setPostContent('');
      fetchSummary();
    } catch (error) {
      console.error('Failed to create post', error);
    } finally {
      setCreatingPost(false);
    }
  };

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    );
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupForm.name.trim() || selectedFriends.length === 0) {
      setGroupFeedback('Select a name and at least one friend');
      return;
    }
    try {
      setCreatingGroup(true);
      setGroupFeedback('');
      await api.post('/social/conversations', {
        name: groupForm.name.trim(),
        description: groupForm.description,
        type: 'group',
        memberIds: selectedFriends
      });
      setGroupForm({ name: '', description: '' });
      setSelectedFriends([]);
      setGroupFeedback('Group created successfully');
      fetchSummary();
    } catch (error) {
      setGroupFeedback(error.response?.data?.message || 'Failed to create group');
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!groupJoinCode.trim()) {
      setGroupFeedback('Enter a valid group code');
      return;
    }
    try {
      setJoiningGroup(true);
      await api.post('/social/groups/join', { joinCode: groupJoinCode.trim().toUpperCase() });
      setGroupJoinCode('');
      setGroupFeedback('Joined group successfully');
      fetchSummary();
    } catch (error) {
      setGroupFeedback(error.response?.data?.message || 'Unable to join group');
    } finally {
      setJoiningGroup(false);
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!communityForm.name.trim()) {
      setGroupFeedback('Community name is required');
      return;
    }
    try {
      setCreatingCommunity(true);
      await api.post('/social/communities', communityForm);
      setCommunityForm({ name: '', description: '' });
      setGroupFeedback('Community created');
      fetchSummary();
      fetchCommunities('');
    } catch (error) {
      setGroupFeedback(error.response?.data?.message || 'Unable to create community');
    } finally {
      setCreatingCommunity(false);
    }
  };

  const handleJoinCommunity = async (communityId) => {
    try {
      await api.post(`/social/communities/${communityId}/join`);
      setGroupFeedback('Joined community');
      fetchSummary();
    } catch (error) {
      setGroupFeedback(error.response?.data?.message || 'Unable to join community');
    }
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    if (!challengeForm.title.trim()) return;
    try {
      setCreatingChallenge(true);
      await api.post('/social/challenges', challengeForm);
      setChallengeForm({
        title: '',
        description: '',
        difficulty: 'Beginner',
        deadline: '',
        reward: ''
      });
      fetchSummary();
    } catch (error) {
      console.error('Failed to create challenge', error);
    } finally {
      setCreatingChallenge(false);
    }
  };

  const handleCompleteChallenge = async (challengeId) => {
    try {
      await api.post(`/social/challenges/${challengeId}/participate`);
      fetchSummary();
      alert('Challenge marked as completed! Check the leaderboard.');
    } catch (error) {
      console.error('Failed to complete challenge', error);
      alert(error.response?.data?.message || 'Failed to complete challenge');
    }
  };

  const handleSearch = async (value) => {
    setSearchQuery(value);
    if (!value || value.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const { data } = await api.get('/social/search', {
        params: { query: value }
      });
      setSearchResults(data);
    } catch (error) {
      console.error('Failed to search users', error);
    }
  };

  const handleFriendRequest = async (recipientId) => {
    try {
      await api.post('/social/friend-request', { recipientId });
      setSearchResults((prev) =>
        prev.map((userResult) =>
          userResult._id === recipientId
            ? { ...userResult, relationshipStatus: 'pending' }
            : userResult
        )
      );
      fetchSummary();
    } catch (error) {
      console.error('Failed to send friend request', error);
    }
  };

  const handleRespondRequest = async (requestId, action) => {
    try {
      await api.put(`/social/friend-request/${requestId}/respond`, { action });
      fetchSummary();
    } catch (error) {
      console.error('Failed to respond to friend request', error);
    }
  };

  const handleMarkNotification = async (notificationId) => {
    try {
      await api.put(`/social/notifications/${notificationId}/read`);
      fetchNotifications();
      fetchSummary();
    } catch (error) {
      console.error('Failed to update notification', error);
    }
  };

  const friendsRanking = useMemo(() => {
    if (!summary?.friends) return [];
    return summary.friends.slice(0, 5);
  }, [summary]);

  if (loading) {
    return (
      <div className="social-page">
        <div className="card">
          <p>Loading your social hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="social-page">
      <header className="social-header">
        <div>
          <p className="eyebrow-text">Community Hub</p>
          <h1>Stay Connected</h1>
          <p className="subtitle">Chat with friends, join communities, and rise on the leaderboard.</p>
        </div>
        <div className="tab-bar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchParams({ tab: tab.id });
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'chat' && (
        <div className="chat-layout">
          <aside className="chat-sidebar card">
            <div className="chat-search">
              <input
                type="text"
                placeholder="Search by username or phone..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            {searchResults.length > 0 && (
              <div className="search-results">
                <p className="section-label">People</p>
                {searchResults.map((user) => (
                  <div key={user._id} className="search-result">
                    <div className="user-meta">
                      <span>{user.name}</span>
                      <small>@{user.username || 'unknown'}</small>
                    </div>
                    {(() => {
                      const status = getRelationshipStatus(user);
                      if (!status) {
                        return (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleFriendRequest(user._id)}
                          >
                            Add
                          </button>
                        );
                      }
                      const label = status === 'friend'
                        ? 'Friends'
                        : status === 'pending'
                          ? 'Pending'
                          : 'Respond';
                      return <span className={`status-pill status-${status}`}>{label}</span>;
                    })()}
                  </div>
                ))}
              </div>
            )}
            <p className="section-label">Chats</p>
            <div className="chat-list">
              {summary?.chats?.length ? summary.chats.map((chat) => (
                <button
                  key={chat._id}
                  className={`chat-list-item ${selectedConversation?._id === chat._id ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(chat)}
                >
                  <div>
                    <h4>{getChatTitle(chat)}</h4>
                    <small>{getChatSubtitle(chat)}</small>
                    {chat.lastMessage && (
                      <p>{chat.lastMessage.sender?.name}: {chat.lastMessage.content?.slice(0, 48)}</p>
                    )}
                  </div>
                </button>
              )) : (
                <p className="empty-state">No chats yet. Add friends to get started.</p>
              )}
            </div>
          </aside>
          <section className="chat-window card">
            {selectedConversation ? (
              <>
                <div className="chat-window-header">
                  <div>
                    <h3>{getChatTitle(selectedConversation)}</h3>
                    <p>{getChatSubtitle(selectedConversation)}</p>
                  </div>
                  {selectedConversation.type === 'group' && selectedConversation.joinCode && (
                    <div className="join-code">
                      <span>Group Code</span>
                      <strong>{selectedConversation.joinCode}</strong>
                    </div>
                  )}
                </div>
                <div className="chat-messages">
                  {messages.map((message) => (
                    <div key={message._id} className="chat-message">
                      <div className="chat-message-meta">
                        <div>
                          <strong>{message.sender?.name}</strong>
                          {message.sender?.username && <small>@{message.sender.username}</small>}
                        </div>
                        <span>{formatDateTime(message.createdAt)}</span>
                      </div>
                      <p>{message.content}</p>
                    </div>
                  ))}
                </div>
                <div className="chat-input">
                  <input
                    type="text"
                    placeholder="Type a message"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={sendingMessage}
                    onClick={handleSendMessage}
                  >
                    {sendingMessage ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p>Select a conversation to start chatting.</p>
              </div>
            )}
          </section>
          <aside className="chat-sidebar card">
            <p className="section-label">Pending Requests</p>
            {friendRequests.length ? friendRequests.map((request) => (
              <div key={request._id} className="request-card">
                <div className="user-meta">
                  <strong>{request.requester.name}</strong>
                  <small>@{request.requester.username}</small>
                </div>
                <div className="request-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleRespondRequest(request._id, 'accept')}>
                    Accept
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleRespondRequest(request._id, 'decline')}>
                    Decline
                  </button>
                </div>
              </div>
            )) : (
              <p className="empty-state">No pending requests</p>
            )}
          </aside>
        </div>
      )}

      {activeTab === 'feed' && (
        <div className="feed-layout">
          <div className="feed-column">
            <section className="card post-composer">
              <textarea
                placeholder="Share your progress, challenge friends, or ask for accountability..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleCreatePost} disabled={creatingPost}>
                {creatingPost ? 'Posting...' : 'Post Update'}
              </button>

              {isAdmin && (
                <form className="challenge-form" onSubmit={handleCreateChallenge}>
                  <h4>Post New Challenge</h4>
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Challenge title"
                      value={challengeForm.title}
                      onChange={(e) => setChallengeForm((prev) => ({ ...prev, title: e.target.value }))}
                      required
                    />
                    <select
                      value={challengeForm.difficulty}
                      onChange={(e) => setChallengeForm((prev) => ({ ...prev, difficulty: e.target.value }))}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Describe the challenge..."
                    value={challengeForm.description}
                    onChange={(e) => setChallengeForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                  <div className="form-row">
                    <input
                      type="date"
                      value={challengeForm.deadline}
                      onChange={(e) => setChallengeForm((prev) => ({ ...prev, deadline: e.target.value }))}
                    />
                    <input
                      type="text"
                      placeholder="Reward (optional)"
                      value={challengeForm.reward}
                      onChange={(e) => setChallengeForm((prev) => ({ ...prev, reward: e.target.value }))}
                    />
                  </div>
                  <button className="btn btn-secondary" type="submit" disabled={creatingChallenge}>
                    {creatingChallenge ? 'Posting...' : 'Publish Challenge'}
                  </button>
                </form>
              )}
            </section>

            <section className="card feed-list">
              <h3>Latest Posts</h3>
              {summary?.posts?.length ? summary.posts.map((post) => {
                const liked = (post.likes || []).some((likeId) => likeId === user?._id);
                return (
                  <article key={post._id} className="feed-item">
                    <header>
                      <div className="author-block">
                        <strong>{post.user?.name}</strong>
                        <small>@{post.user?.username}</small>
                      </div>
                      <small>{formatDateTime(post.createdAt)}</small>
                    </header>
                    <p>{post.content}</p>
                    <div className="feed-item-meta">
                      <button
                        className={`ghost-button ${liked ? 'active' : ''}`}
                        onClick={() => handleToggleLike(post._id)}
                      >
                        {liked ? 'Liked' : 'Like'} ({post.likes?.length || 0})
                      </button>
                      {post.challengeId && <span className="badge">Challenge</span>}
                    </div>
                    <div className="feed-comments">
                      {(post.comments || []).slice(-3).map((comment) => (
                        <div key={comment._id || comment.createdAt} className="comment">
                          <div>
                            <strong>{comment.user?.name}</strong>
                            <small>@{comment.user?.username}</small>
                          </div>
                          <p>{comment.content}</p>
                          <span>{formatDateTime(comment.createdAt)}</span>
                        </div>
                      ))}
                      <div className="comment-form">
                        <input
                          type="text"
                          placeholder="Write a comment"
                          value={commentInputs[post._id] || ''}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({ ...prev, [post._id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(post._id);
                            }
                          }}
                        />
                        <button className="btn btn-primary btn-sm" type="button" onClick={() => handleAddComment(post._id)}>
                          Comment
                        </button>
                      </div>
                    </div>
                  </article>
                );
              }) : (
                <p className="empty-state">Be the first to share something today.</p>
              )}
            </section>
          </div>

          <div className="feed-column">
            <aside className="card ranking-card">
              <h3>Friends Leaderboard</h3>
              {friendsRanking.length ? friendsRanking.map((friend, index) => (
                <div key={friend._id} className="ranking-row">
                  <span className="rank">{index + 1}</span>
                  <div>
                    <strong>{friend.name}</strong>
                    <small>@{friend.username}</small>
                  </div>
                </div>
              )) : (
                <p className="empty-state">Make friends to unlock the leaderboard.</p>
              )}
            </aside>

            <aside className="card challenge-board">
              <h3>Active Challenges</h3>
              {summary?.challenges?.length ? summary.challenges.map((challenge) => {
                const userParticipant = challenge.participants?.find(
                  (p) => (p.user?._id || p.user)?.toString() === user?._id?.toString()
                );
                const isCompleted = userParticipant?.completed || false;
                return (
                  <div key={challenge._id} className="challenge-row">
                    <div>
                      <strong>{challenge.title}</strong>
                      <p>{challenge.description}</p>
                      <div className="challenge-meta-info">
                        <span className="badge">{challenge.difficulty}</span>
                        {challenge.deadline && (
                          <small>Ends {new Date(challenge.deadline).toLocaleDateString()}</small>
                        )}
                      </div>
                    </div>
                    <button
                      className={`btn btn-sm ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => handleCompleteChallenge(challenge._id)}
                      disabled={isCompleted}
                    >
                      {isCompleted ? 'Completed ✓' : 'Mark Complete'}
                    </button>
                  </div>
                );
              }) : (
                <p className="empty-state">No challenges yet</p>
              )}
            </aside>
          </div>
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="groups-layout">
          <div className="group-actions">
            <section className="card">
              <h3>Create Group Chat</h3>
              <form onSubmit={handleCreateGroup}>
                <div className="form-group-inline">
                  <input
                    type="text"
                    placeholder="Group name"
                    value={groupForm.name}
                    onChange={(e) => setGroupForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Purpose (optional)"
                    value={groupForm.description}
                    onChange={(e) => setGroupForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="friend-selector">
                  {summary?.friends?.length ? summary.friends.map((friend) => (
                    <label key={friend._id}>
                      <input
                        type="checkbox"
                        checked={selectedFriends.includes(friend._id)}
                        onChange={() => toggleFriendSelection(friend._id)}
                      />
                      <span>{friend.name}</span>
                      <small>@{friend.username}</small>
                    </label>
                  )) : (
                    <p className="empty-state">Add friends to start a group chat.</p>
                  )}
                </div>
                <button className="btn btn-primary" type="submit" disabled={creatingGroup}>
                  {creatingGroup ? 'Creating...' : 'Create Group'}
                </button>
              </form>
            </section>

            <section className="card">
              <h3>Join Group via Code</h3>
              <form onSubmit={handleJoinGroup}>
                <input
                  type="text"
                  placeholder="Enter group code"
                  value={groupJoinCode}
                  onChange={(e) => setGroupJoinCode(e.target.value)}
                />
                <button className="btn btn-secondary" type="submit" disabled={joiningGroup}>
                  {joiningGroup ? 'Joining...' : 'Join Group'}
                </button>
              </form>
            </section>

            <section className="card">
              <div className="communities-header">
                <h3>Communities</h3>
                <input
                  type="search"
                  placeholder="Search communities"
                  value={communitySearch}
                  onChange={(e) => setCommunitySearch(e.target.value)}
                />
              </div>
              <div className="community-results">
                {communityResults.length ? communityResults.map((community) => (
                  <div key={community._id} className="community-card">
                    <div>
                      <strong>{community.name}</strong>
                      <p>{community.description || 'No description provided'}</p>
                      <small>{community.members?.length || 0} members</small>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={summary?.groups?.some((group) => group._id === community._id)}
                      onClick={() => handleJoinCommunity(community._id)}
                    >
                      {summary?.groups?.some((group) => group._id === community._id) ? 'Joined' : 'Join'}
                    </button>
                  </div>
                )) : (
                  <p className="empty-state">No communities found</p>
                )}
              </div>

              {isAdmin && (
                <form className="community-form" onSubmit={handleCreateCommunity}>
                  <h4>Create Community (Gym Owners)</h4>
                  <input
                    type="text"
                    placeholder="Community name"
                    value={communityForm.name}
                    onChange={(e) => setCommunityForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                  <textarea
                    placeholder="Describe the community"
                    value={communityForm.description}
                    onChange={(e) => setCommunityForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                  <button className="btn btn-primary" type="submit" disabled={creatingCommunity}>
                    {creatingCommunity ? 'Creating...' : 'Create Community'}
                  </button>
                </form>
              )}
            </section>

            {groupFeedback && <div className="info-banner">{groupFeedback}</div>}
          </div>

          <div className="group-list">
            <section className="card">
              <h3>Your Groups & Communities</h3>
              {summary?.groups?.length ? summary.groups.map((group) => (
                <div key={group._id} className="group-card">
                  <div>
                    <h4>{group.name || 'Community'}</h4>
                    <p>{group.description || `${group.members?.length || 0} members`}</p>
                    {group.joinCode && (
                      <small className="join-code-inline">Code: {group.joinCode}</small>
                    )}
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleSelectConversation(group)}>
                    Open
                  </button>
                </div>
              )) : (
                <p className="empty-state">No groups yet. Join or create one to get started.</p>
              )}
            </section>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="notifications-layout card">
          <h3>All Notifications</h3>
          {notifications.length ? notifications.map((notification) => (
            <div key={notification._id} className={`notification-item ${notification.read ? 'read' : ''}`}>
              <div className="notification-content">
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
              </div>
              <div className="notification-meta">
                <span>{formatDateTime(notification.createdAt)}</span>
                {!notification.read && (
                  <button className="btn btn-secondary btn-sm" onClick={() => handleMarkNotification(notification._id)}>
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          )) : (
            <p className="empty-state">You're all caught up 🎉</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialPage;


