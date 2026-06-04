import { useState, useRef } from 'react';
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
import mockComments from '../data/mockComments';
import PollCard from '../components/PollCard';

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

export default function EventDetail({ event }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 10);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(
    mockComments.filter(c => c.evento_id === event.id).sort((a, b) => b.score - a.score)
  );
  const [sending, setSending] = useState(false);
  const commentsRef = useRef(null);

  const handleLike = () => {
    Alert.alert('', 'Debes iniciar sesión para interactuar.');
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

  const handleSendComment = () => {
    const trimmedComment = comment.trim();
    if (!trimmedComment) return;

    setSending(true);

    setTimeout(() => {
      const shouldFail = Math.random() < 0.1;

      if (shouldFail) {
        Alert.alert('', 'No se pudo completar la acción. Intenta nuevamente.');
        setSending(false);
        return;
      }

      const newComment = {
        id: `c${Date.now()}`,
        evento_id: event.id,
        autor_id: 'current_user',
        autor_username: 'tu_usuario',
        autor_avatar: null,
        contenido: trimmedComment,
        score: 0,
        created_at: new Date().toISOString(),
      };

      setComments(prev => [newComment, ...prev]);
      setComment('');
      setSending(false);
    }, 800);
  };

  const isSubmitDisabled = !comment.trim() || sending;

  const eventComments = comments.filter(c => c.evento_id === event.id);
  const commentWithPoll = eventComments.find(c => c.id === 'c1a2b3c4-1111-2222-3333-444455556666');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView ref={commentsRef} contentContainerStyle={styles.scrollContent}>
        <Image
          source={{ uri: event.imagen_url }}
          style={styles.image}
          resizeMode="cover"
        />

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
                {likeCount + (liked ? 1 : 0)}
              </Text>
            </Pressable>

            <Pressable style={styles.actionButton} onPress={handleCommentPress}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>{eventComments.length}</Text>
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
              {eventComments.map((item) => (
                <View key={item.id} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {item.autor_username.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.commentMeta}>
                      <Text style={styles.username}>{item.autor_username}</Text>
                      <Text style={styles.relativeDate}>{formatRelativeDate(item.created_at)}</Text>
                    </View>
                    <View style={styles.scoreContainer}>
                      <Text style={styles.scoreIcon}>★</Text>
                      <Text style={styles.scoreText}>{item.score}</Text>
                    </View>
                  </View>
                  <Text style={styles.commentContent}>{item.contenido}</Text>

                  {item.id === 'c1a2b3c4-1111-2222-3333-444455556666' && (
                    <PollCard
                      pregunta="¿Qué género debería predominar en los próximos eventos?"
                      opciones={[
                        { texto: 'Rock', votos: 24 },
                        { texto: 'Pop', votos: 18 },
                        { texto: 'Electrónica', votos: 31 },
                        { texto: 'Jazz', votos: 12 },
                      ]}
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
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#1a1a1a',
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
  commentItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 14,
    color: '#E5b0cb',
  },
  commentMeta: {
    flex: 1,
  },
  username: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 13,
    color: '#ffffff',
  },
  relativeDate: {
    fontFamily: 'Montserrat',
    fontSize: 11,
    color: '#888888',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreIcon: {
    fontSize: 14,
    color: '#ffd2fb',
    marginRight: 4,
  },
  scoreText: {
    fontFamily: 'Montserrat',
    fontSize: 13,
    color: '#ffd2fb',
  },
  commentContent: {
    fontFamily: 'Montserrat',
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
});
