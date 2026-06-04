import { View, Text, StyleSheet } from 'react-native';

export default function EmptyState() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>No hay eventos agendados para esta selección</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  text: {
    fontFamily: 'Montserrat',
    fontSize: 16,
    color: '#E5b0cb',
    textAlign: 'center',
  },
});
