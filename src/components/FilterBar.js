import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';

const COMUNAS = ['Todas', 'Concepción', 'Hualpén', 'Talcahuano', 'Chiguayante', 'San Pedro de la Paz', 'Penco', 'Tomé'];
const TEMPORALES = ['Todos', 'Este fin de semana', 'Próxima semana', 'Próximos 15 días'];
const ACCESOS = ['Todos', 'Gratis', 'Pago'];
const GENEROS = ['Todos', 'Rock', 'Pop', 'Electrónica', 'Jazz', 'Otro'];

function getDateRange(temporalFilter) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (temporalFilter === 'Este fin de semana') {
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    const friday = new Date(today);
    friday.setDate(today.getDate() + daysUntilFriday);
    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 2);
    sunday.setHours(23, 59, 59, 999);
    return { start: friday, end: sunday };
  }

  if (temporalFilter === 'Próxima semana') {
    const dayOfWeek = today.getDay();
    const daysUntilMonday = (1 - dayOfWeek + 7) % 7 || 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);
    nextSunday.setHours(23, 59, 59, 999);
    return { start: nextMonday, end: nextSunday };
  }

  if (temporalFilter === 'Próximos 15 días') {
    const end = new Date(today);
    end.setDate(today.getDate() + 15);
    end.setHours(23, 59, 59, 999);
    return { start: today, end };
  }

  return null;
}

function Dropdown({ label, options, value, onChange }) {
  const [visible, setVisible] = useState(false);

  const handleSelect = (option) => {
    onChange(option);
    setVisible(false);
  };

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.selector} onPress={() => setVisible(true)}>
        <Text style={styles.selectorText}>{value}</Text>
        <Text style={styles.arrow}>▼</Text>
      </Pressable>
      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>
            <ScrollView style={styles.optionsList}>
              {options.map((option) => (
                <Pressable
                  key={option}
                  style={[styles.option, value === option && styles.optionSelected]}
                  onPress={() => handleSelect(option)}
                >
                  <Text style={[styles.optionText, value === option && styles.optionTextSelected]}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export default function FilterBar({ filters, onChange }) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Dropdown
          label="Comuna"
          options={COMUNAS}
          value={filters.comuna}
          onChange={(comuna) => onChange({ ...filters, comuna })}
        />
        <Dropdown
          label="Fecha"
          options={TEMPORALES}
          value={filters.temporal}
          onChange={(temporal) => onChange({ ...filters, temporal })}
        />
        <Dropdown
          label="Acceso"
          options={ACCESOS}
          value={filters.acceso}
          onChange={(acceso) => onChange({ ...filters, acceso })}
        />
        <Dropdown
          label="Género"
          options={GENEROS}
          value={filters.genero}
          onChange={(genero) => onChange({ ...filters, genero })}
        />
      </ScrollView>
    </View>
  );
}

export { getDateRange };

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f0f0f',
    paddingTop: 8,
    paddingBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dropdownContainer: {
    minWidth: 140,
  },
  label: {
    color: '#E5b0cb',
    fontSize: 12,
    fontFamily: 'Montserrat',
    marginBottom: 4,
  },
  selector: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Montserrat',
  },
  arrow: {
    color: '#E5b0cb',
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    color: '#E5b0cb',
    fontSize: 18,
    fontFamily: 'Lovelo',
    marginBottom: 16,
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionSelected: {
    backgroundColor: '#E5b0cb',
  },
  optionText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Montserrat',
  },
  optionTextSelected: {
    color: '#0f0f0f',
    fontWeight: 'bold',
  },
});
