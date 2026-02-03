import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { Input } from './Input';
import { Button } from './Button';
import matrixService from '../services/MatrixService';
import { Room } from '../types';
import { colors, spacing, fontSizes, borderRadius } from '../utils/theme';

interface JoinRoomModalProps {
  visible: boolean;
  onClose: () => void;
  onRoomJoined: (room: Room) => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  visible,
  onClose,
  onRoomJoined,
}) => {
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!roomId.trim()) {
      Alert.alert('Error', 'Please enter a room ID or alias');
      return;
    }

    setLoading(true);
    try {
      const room = await matrixService.joinRoom(roomId.trim());
      if (room) {
        onRoomJoined(room);
        handleClose();
      } else {
        Alert.alert('Error', 'Failed to join room');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRoomId('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.title}>Join Room</Text>
                <TouchableOpacity onPress={handleClose}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                <Input
                  label="Room ID or Alias"
                  value={roomId}
                  onChangeText={setRoomId}
                  placeholder="!roomid:matrix.org or #alias:matrix.org"
                  autoCapitalize="none"
                />

                <Text style={styles.hint}>
                  Enter the room ID (starts with !) or room alias (starts with #)
                </Text>

                <View style={styles.examples}>
                  <Text style={styles.exampleTitle}>Examples:</Text>
                  <Text style={styles.example}>#agents:matrix.org</Text>
                  <Text style={styles.example}>!AbCdEfGhIjKlMnOp:matrix.org</Text>
                </View>
              </View>

              <View style={styles.footer}>
                <Button
                  title="Cancel"
                  onPress={handleClose}
                  variant="ghost"
                  style={styles.cancelButton}
                />
                <Button
                  title="Join Room"
                  onPress={handleJoin}
                  loading={loading}
                  disabled={!roomId.trim()}
                  style={styles.joinButton}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  closeButton: {
    fontSize: 20,
    color: colors.textMuted,
    padding: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  hint: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  examples: {
    backgroundColor: colors.surfaceLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  exampleTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  example: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontFamily: 'monospace',
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    paddingTop: 0,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  joinButton: {
    flex: 1,
  },
});

export default JoinRoomModal;
