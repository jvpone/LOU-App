import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import DataManager from '../lib/DataManager';

const CURRENT_USER_ID = 'user_demo_123';

export default function PollCard({ pregunta, opciones: initialOpciones, encuestaId }) {
  const [opciones, setOpciones] = useState(initialOpciones);
  const [votado, setVotado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPollData = async () => {
      try {
        const pollData = await DataManager.initPoll(encuestaId, initialOpciones);
        setOpciones(pollData.opciones);

        const { userVote } = await DataManager.getPollData(encuestaId, CURRENT_USER_ID);
        setVotado(userVote);
      } catch (error) {
        console.error('Error loading poll:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPollData();
  }, [encuestaId]);

  const handleVote = async (index) => {
    try {
      const result = await DataManager.votePoll(encuestaId, index, CURRENT_USER_ID);
      setOpciones(result.opciones);
      setVotado(result.userVote);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const totalVotos = opciones.reduce((sum, opt) => sum + opt.votos, 0);

  if (loading) return null;

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
