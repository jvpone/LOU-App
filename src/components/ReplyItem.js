import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import DataManager from '../lib/DataManager';

const CURRENT_USER_ID = 'user_demo_123';

export default function ReplyItem({ reply }) {
  const [score, setScore] = useState(reply.score || 0);
  const [userVote, setUserVote] = useState(null);

  useEffect(() => {
    const loadVote = async () => {
      const vote = await DataManager.getUserReplyVote(reply.id, CURRENT_USER_ID);
      setUserVote(vote);
    };
    loadVote();
  }, [reply.id]);

  const handleVote = async (voteType) => {
    try {
      const result = await DataManager.voteReply(
        reply.id,
        CURRENT_USER_ID,
        voteType
      );
      setScore(result.score);
      setUserVote(result.userVote);
    } catch (error) {
      console.error('Error voting reply:', error);
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
            {reply.autor_username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.username}>{reply.autor_username}</Text>
          <Text style={styles.date}>{formatRelativeDate(reply.created_at)}</Text>
        </View>
      </View>

      <Text style={styles.content}>{reply.contenido}</Text>

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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#252525',
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffd2fb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#0f0f0f',
    fontFamily: 'Montserrat-Bold',
    fontSize: 11,
  },
  headerInfo: {
    flex: 1,
  },
  username: {
    color: '#ffffff',
    fontFamily: 'Montserrat-Bold',
    fontSize: 12,
  },
  date: {
    color: '#888888',
    fontFamily: 'Montserrat',
    fontSize: 10,
    marginTop: 1,
  },
  content: {
    color: '#e0e0e0',
    fontFamily: 'Montserrat',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voteButton: {
    padding: 4,
    borderRadius: 3,
    backgroundColor: '#1a1a1a',
  },
  voteButtonActive: {
    backgroundColor: '#E5b0cb',
  },
  voteIcon: {
    color: '#888888',
    fontSize: 12,
  },
  voteIconActive: {
    color: '#0f0f0f',
  },
  score: {
    color: '#E5b0cb',
    fontFamily: 'Montserrat-Bold',
    fontSize: 12,
    minWidth: 25,
    textAlign: 'center',
  },
});
