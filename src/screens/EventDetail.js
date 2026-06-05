import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Share,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import DataManager from '../lib/DataManager';
import PollCard from '../components/PollCard';
import CommentItem from '../components/CommentItem';

const CURRENT_USER_ID = 'user_demo_123';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
};

export default function EventDetail({ event }) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [sending, setSending] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const commentsRef = useRef(null);

  const handleGoBack = () => {
    router.back();
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedComments, userLiked, count] = await Promise.all([
          DataManager.getCommentsByEvent(event.id),
          DataManager.hasUserLiked(event.id, CURRENT_USER_ID),
          DataManager.getLikeCount(event.id)
        ]);
        setComments(loadedComments);
        setLiked(userLiked);
        setLikeCount(count);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, [event.id]);

  const handleLike = async () => {
    if (!liked) {
      try {
        const result = await DataManager.toggleLike(event.id, CURRENT_USER_ID);
        setLiked(result.liked);
        setLikeCount(result.likeCount);
      } catch (error) {
        Alert.alert('', 'No se pudo completar la acción. Intenta nuevamente.');
      }
    } else {
      try {
        const result = await DataManager.toggleLike(event.id, CURRENT_USER_ID);
        setLiked(result.liked);
        setLikeCount(result.likeCount);
      } catch (error) {
        Alert.alert('', 'No se pudo completar la acción. Intenta nuevamente.');
      }
    }
  };

  const handleCommentPress = () => {
    commentsRef.current?.scrollTo({ y: 400, animated: true });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Mira este evento: ${event.titulo} en ${event.comuna}`,
      });
    } catch (error) {
      // User cancelled
    }
  };

  const handleSendComment = async () => {
    const trimmedComment = comment.trim();
    if (!trimmedComment) return;

    setSending(true);

    try {
      const newComment = await DataManager.addComment(
        event.id,
        trimmedComment,
        'tu_usuario'
      );
      setComments(prev => [newComment, ...prev]);
      setComment('');
    } catch (error) {
      Alert.alert('', 'No se pudo completar la acción. Intenta nuevamente.');
    } finally {
      setSending(false);
    }
  };

  const isSubmitDisabled = !comment.trim() || sending;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView ref={commentsRef} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: event.imagen_url }}
            style={styles.image}
            resizeMode="cover"
          />
          <Pressable style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{event.titulo}</Text>
            <View style={[styles.badge, event.acceso === 'gratis' ? styles.badgeGratis : styles.badgePago]}>
              <Text style={styles.badgeText}>
                {event.acceso === 'gratis' ? 'GRATIS' : 'PAGO'}
              </Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Fecha</Text>
              <Text style={styles.infoValue}>{formatDate(event.fecha_inicio)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Hora</Text>
              <Text style={styles.infoValue}>{formatTime(event.fecha_inicio)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Lugar</Text>
              <Text style={styles.infoValue}>{event.lugar}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Comuna</Text>
              <Text style={styles.infoValue}>{event.comuna}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Género</Text>
              <Text style={styles.infoValue}>{event.genero}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={[styles.actionButton, liked && styles.actionButtonActive]}
              onPress={handleLike}
            >
              <Text style={styles.actionIcon}>{liked ? '♥' : '♡'}</Text>
              <Text style={[styles.actionText, liked && styles.actionTextActive]}>
                {likeCount}
              </Text>
            </Pressable>

            <Pressable style={styles.actionButton} onPress={handleCommentPress}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>{comments.length}</Text>
            </Pressable>

            <Pressable style={styles.actionButton} onPress={handleShare}>
              <Text style={styles.actionIcon}>↗</Text>
              <Text style={styles.actionText}>Compartir</Text>
            </Pressable>
          </View>

          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>ComunidLOU</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Escribe tu comentario..."
                placeholderTextColor="#666"
                maxLength={500}
                value={comment}
                onChangeText={setComment}
                multiline
              />
              <Pressable
                style={[styles.sendButton, isSubmitDisabled && styles.sendButtonDisabled]}
                onPress={handleSendComment}
                disabled={isSubmitDisabled}
              >
                <Text style={styles.sendButtonText}>Enviar</Text>
              </Pressable>
            </View>
            <Text style={styles.charCounter}>
              {500 - comment.length}/500
            </Text>

            <View style={styles.commentsList}>
              {comments.map((commentItem) => (
                <View key={commentItem.id}>
                  <CommentItem comment={commentItem} />

                  {commentItem.id === 'c1a2b3c4-1111-2222-3333-444455556666' && (
                    <PollCard
                      pregunta="¿Qué género debería predominar en los próximos eventos?"
                      opciones={[
                        { texto: 'Rock', votos: 24 },
                        { texto: 'Pop', votos: 18 },
                        { texto: 'Electrónica', votos: 31 },
                        { texto: 'Jazz', votos: 12 },
                      ]}
                      encuestaId="poll_staff_1"
                    />
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#1a1a1a',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    backgroundColor: 'rgba(15, 15, 15, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  backButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 14,
    color: '#ffffff',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Lovelo',
    fontSize: 24,
    color: '#ffffff',
    flex: 1,
    marginRight: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  badgeGratis: {
    backgroundColor: '#E5b0cb',
  },
  badgePago: {
    backgroundColor: '#ffd2fb',
  },
  badgeText: {
    fontFamily: 'Montserrat',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f0f0f',
  },
  infoGrid: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoItem: {
    marginBottom: 12,
  },
  infoLabel: {
    fontFamily: 'Montserrat',
    fontSize: 11,
    color: '#888888',
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: 'Montserrat',
    fontSize: 15,
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  actionButton: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  actionButtonActive: {
    opacity: 1,
  },
  actionIcon: {
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 4,
  },
  actionText: {
    fontFamily: 'Montserrat',
    fontSize: 12,
    color: '#ffffff',
  },
  actionTextActive: {
    color: '#E5b0cb',
  },
  commentsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: 'Lovelo',
    fontSize: 20,
    color: '#E5b0cb',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'Montserrat',
    fontSize: 14,
    color: '#ffffff',
    maxHeight: 100,
    paddingRight: 12,
  },
  sendButton: {
    backgroundColor: '#E5b0cb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 13,
    color: '#0f0f0f',
  },
  charCounter: {
    fontFamily: 'Montserrat',
    fontSize: 12,
    color: '#E5b0cb',
    textAlign: 'right',
    marginBottom: 16,
  },
  commentsList: {
    gap: 16,
  },
});
