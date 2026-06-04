import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import mockEvents from '../../data/mockEvents';
import EventDetail from '../../screens/EventDetail';

export default function EventRoute() {
  const { id } = useLocalSearchParams();
  const eventId = parseInt(id, 10);
  const event = mockEvents.find(e => e.id === eventId);

  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Evento no encontrado</Text>
      </View>
    );
  }

  return <EventDetail event={event} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Montserrat',
    fontSize: 16,
    color: '#E5b0cb',
  },
});
