import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import DataManager from '../lib/DataManager';
import ReplyInput from './ReplyInput';
import ReplyItem from './ReplyItem';

const CURRENT_USER_ID = 'user_demo_123';

export default function CommentItem({ comment }) {
  const [score, setScore] = useState(comment.score || 0);
  const [userVote, setUserVote] = useState(null);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);

  useEffect(() => {
    const loadVote = async () => {
      const vote = await DataManager.getUserCommentVote(comment.id, CURRENT_USER_ID);
      setUserVote(vote);
    };
    loadVote();
  }, [comment.id]);

  useEffect(() => {
    const loadReplies = async () => {
      const loadedReplies = await DataManager.getRepliesByComment(comment.id);
      setReplies(loadedReplies);
    };
    loadReplies();
  }, [comment.id]);

  const handleVote = async (voteType) => {
    try {
      const result = await DataManager.voteComment(
        comment.id,
        CURRENT_USER_ID,
        voteType
      );
      setScore(result.score);
      setUserVote(result.userVote);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleSendReply = async (contenido) => {
    try {
      const newReply = await DataManager.addReply(
        comment.id,
        comment.evento_id,
        contenido,
        'tu_usuario'
      );
      setReplies(prev => [...prev, newReply]);
      setShowReplyInput(false);
      setShowReplies(true);
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Hace unos minutos';
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {comment.autor_username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.username}>{comment.autor_username}</Text>
          <Text style={styles.date}>{formatRelativeDate(comment.created_at)}</Text>
        </View>
      </View>

      <Text style={styles.content}>{comment.contenido}</Text>

      <View style={styles.actions}>
        <Pressable
          style={[styles.voteButton, userVote === 'up' && styles.voteButtonActive]}
          onPress={() => handleVote('up')}
        >
          <Text style={[styles.voteIcon, userVote === 'up' && styles.voteIconActive]}>
            ▲
          </Text>
        </Pressable>

        <Text style={styles.score}>{score}</Text>

        <Pressable
          style={[styles.voteButton, userVote === 'down' && styles.voteButtonActive]}
          onPress={() => handleVote('down')}
        >
          <Text style={[styles.voteIcon, userVote === 'down' && styles.voteIconActive]}>
            ▼
          </Text>
        </Pressable>

        <Pressable
          style={styles.replyButton}
          onPress={() => setShowReplyInput(!showReplyInput)}
        >
          <Text style={styles.replyButtonText}>
            {showReplyInput ? 'Cancelar' : 'Responder'}
          </Text>
        </Pressable>
      </View>

      {showReplyInput && (
        <ReplyInput
          onSubmit={handleSendReply}
          onCancel={() => setShowReplyInput(false)}
        />
      )}

      {replies.length > 0 && (
        <Pressable
          style={styles.showRepliesButton}
          onPress={() => setShowReplies(!showReplies)}
        >
          <Text style={styles.showRepliesText}>
            {showReplies ? 'Ocultar' : 'Ver'} {replies.length} {replies.length === 1 ? 'respuesta' : 'respuestas'}
          </Text>
        </Pressable>
      )}

      {showReplies && (
        <View style={styles.repliesContainer}>
          {replies.map((reply) => (
            <ReplyItem key={reply.id} reply={reply} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5b0cb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#0f0f0f',
    fontFamily: 'Montserrat-Bold',
    fontSize: 14,
  },
  headerInfo: {
    flex: 1,
  },
  username: {
    color: '#ffffff',
    fontFamily: 'Montserrat-Bold',
    fontSize: 13,
  },
  date: {
    color: '#888888',
    fontFamily: 'Montserrat',
    fontSize: 11,
    marginTop: 2,
  },
  content: {
    color: '#e0e0e0',
    fontFamily: 'Montserrat',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voteButton: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: '#2a2a2a',
  },
  voteButtonActive: {
    backgroundColor: '#E5b0cb',
  },
  voteIcon: {
    color: '#888888',
    fontSize: 14,
  },
  voteIconActive: {
    color: '#0f0f0f',
  },
  score: {
    color: '#E5b0cb',
    fontFamily: 'Montserrat-Bold',
    fontSize: 14,
    minWidth: 30,
    textAlign: 'center',
  },
  replyButton: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#2a2a2a',
  },
  replyButtonText: {
    fontFamily: 'Montserrat',
    fontSize: 12,
    color: '#E5b0cb',
  },
  showRepliesButton: {
    marginLeft: 20,
    marginTop: 8,
    paddingVertical: 4,
  },
  showRepliesText: {
    fontFamily: 'Montserrat',
    fontSize: 12,
    color: '#E5b0cb',
  },
  repliesContainer: {
    marginLeft: 20,
    marginTop: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#2a2a2a',
    paddingLeft: 12,
  },
});
