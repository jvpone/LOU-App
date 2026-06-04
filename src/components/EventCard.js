import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString('es-CL', { month: 'short' });
  const time = date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  return { day, month, time };
};

export default function EventCard({ event }) {
  const router = useRouter();
  const { day, month, time } = formatDate(event.fecha_inicio);

  const handlePress = () => {
    router.push({ pathname: '/evento/[id]', params: { id: event.id } });
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <Image
        source={{ uri: event.imagen_url }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>{event.titulo}</Text>
          <View style={[styles.badge, event.acceso === 'gratis' ? styles.badgeGratis : styles.badgePago]}>
            <Text style={styles.badgeText}>{event.acceso === 'gratis' ? 'GRATIS' : 'PAGO'}</Text>
          </View>
        </View>
        <View style={styles.details}>
          <View style={styles.dateContainer}>
            <Text style={styles.day}>{day}</Text>
            <Text style={styles.month}>{month}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.time}>{time}</Text>
            <Text style={styles.location}>{event.lugar}</Text>
            <Text style={styles.comuna}>{event.comuna}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#2a2a2a',
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Lovelo',
    fontSize: 16,
    color: '#ffffff',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f0f0f',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 40,
  },
  day: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 24,
    color: '#E5b0cb',
  },
  month: {
    fontFamily: 'Montserrat',
    fontSize: 12,
    color: '#ffd2fb',
    textTransform: 'uppercase',
  },
  info: {
    flex: 1,
  },
  time: {
    fontFamily: 'Montserrat',
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 2,
  },
  location: {
    fontFamily: 'Montserrat',
    fontSize: 12,
    color: '#E5b0cb',
    marginBottom: 2,
  },
  comuna: {
    fontFamily: 'Montserrat',
    fontSize: 11,
    color: '#888888',
  },
});
