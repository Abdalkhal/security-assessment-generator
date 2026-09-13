import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';
import { TextField } from './TextField';

interface TextEvidenceFormModalProps {
  visible: boolean;
  saving: boolean;
  onSave: (input: { caption: string; textContent: string }) => void;
  onClose: () => void;
}

export function TextEvidenceFormModal({ visible, saving, onSave, onClose }: TextEvidenceFormModalProps) {
  const [caption, setCaption] = useState('');
  const [textContent, setTextContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setCaption('');
      setTextContent('');
      setError('');
    }
  }, [visible]);

  const handleSave = () => {
    if (!textContent.trim()) {
      setError('Please enter some text for this note.');
      return;
    }
    onSave({ caption: caption.trim() || 'Note', textContent: textContent.trim() });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Add Text Evidence</Text>
          <TextField label="Caption" placeholder="Optional label" value={caption} onChangeText={setCaption} />
          <TextField
            label="Note *"
            placeholder="Command output, observation, or additional context"
            value={textContent}
            onChangeText={setTextContent}
            multiline
            numberOfLines={5}
            style={styles.textInput}
          />
          {!!error && <Text style={styles.errorText}>{error}</Text>}
          <View style={styles.actions}>
            <SecondaryButton label="Cancel" onPress={onClose} style={styles.actionButton} />
            <PrimaryButton label="Save" onPress={handleSave} loading={saving} style={styles.actionButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.lg,
  },
  textInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});
