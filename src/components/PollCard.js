import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState } from 'react';

export default function PollCard({ pregunta, opciones: initialOpciones }) {
  const [opciones, setOpciones] = useState(initialOpciones);
  const [votado, setVotado] = useState(null);
  const totalVotos = opciones.reduce((sum, opt) => sum + opt.votos, 0);

  const handleVote = (index) => {
    if (votado !== null) return;

    const newOpciones = opciones.map((opt, i) => {
      if (i === index) {
        return { ...opt, votos: opt.votos + 1 };
      }
      return opt;
    });

    setOpciones(newOpciones);
    setVotado(index);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pregunta}>{pregunta}</Text>
      <View style={styles.opciones}>
        {opciones.map((opcion, index) => {
          const porcentaje = totalVotos > 0 ? Math.round((opcion.votos / totalVotos) * 100) : 0;
          const isSelected = votado === index;

          return (
            <Pressable
              key={index}
              style={[styles.opcion, isSelected && styles.opcionSelected]}
              onPress={() => handleVote(index)}
            >
              <View style={styles.opcionContent}>
                <Text style={styles.opcionTexto}>{opcion.texto}</Text>
                <Text style={styles.porcentaje}>{porcentaje}%</Text>
              </View>
              <View style={styles.barraContainer}>
                <View
                  style={[
                    styles.barra,
                    { width: `${porcentaje}%` },
                    isSelected && styles.barraSelected
                  ]}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.totalVotos}>{totalVotos} votos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  pregunta: {
    fontFamily: 'Lovelo',
    fontSize: 14,
    color: '#ffd2fb',
    marginBottom: 10,
  },
  opciones: {
    gap: 8,
  },
  opcion: {
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    padding: 10,
    overflow: 'hidden',
  },
  opcionSelected: {
    borderWidth: 1,
    borderColor: '#E5b0cb',
  },
  opcionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  opcionTexto: {
    fontFamily: 'Montserrat',
    fontSize: 13,
    color: '#ffffff',
  },
  porcentaje: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 13,
    color: '#E5b0cb',
  },
  barraContainer: {
    height: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barra: {
    height: '100%',
    backgroundColor: '#666666',
    borderRadius: 3,
  },
  barraSelected: {
    backgroundColor: '#E5b0cb',
  },
  totalVotos: {
    fontFamily: 'Montserrat',
    fontSize: 11,
    color: '#888888',
    marginTop: 8,
    textAlign: 'right',
  },
});
