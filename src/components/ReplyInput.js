import { useState } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';

export default function ReplyInput({ onSubmit, onCancel }) {
  const [replyText, setReplyText] = useState('');

  const handleSubmit = () => {
    if (replyText.trim()) {
      onSubmit(replyText.trim());
      setReplyText('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Escribe tu respuesta..."
        placeholderTextColor="#666"
        maxLength={500}
        value={replyText}
        onChangeText={setReplyText}
        multiline
        autoFocus
      />
      <View style={styles.actions}>
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
        <Pressable
          style={[styles.sendButton, !replyText.trim() && styles.sendButtonDisabled]}
          onPress={handleSubmit}
          disabled={!replyText.trim()}
        >
          <Text style={styles.sendText}>Responder</Text>
        </Pressable>
      </View>
      <Text style={styles.charCounter}>{500 - replyText.length}/500</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginLeft: 20,
    marginTop: 8,
  },
  input: {
    fontFamily: 'Montserrat',
    fontSize: 13,
    color: '#ffffff',
    maxHeight: 80,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelText: {
    fontFamily: 'Montserrat',
    fontSize: 12,
    color: '#888888',
  },
  sendButton: {
    backgroundColor: '#E5b0cb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 12,
    color: '#0f0f0f',
  },
  charCounter: {
    fontFamily: 'Montserrat',
    fontSize: 11,
    color: '#E5b0cb',
    textAlign: 'right',
    marginTop: 4,
  },
});
