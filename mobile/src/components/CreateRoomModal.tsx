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

interface CreateRoomModalProps {
  visible: boolean;
  onClose: () => void;
  onRoomCreated: (room: Room) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  visible,
  onClose,
  onRoomCreated,
}) => {
  const [roomName, setRoomName] = useState('');
  const [inviteUsers, setInviteUsers] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!roomName.trim()) {
      Alert.alert('Error', 'Please enter a room name');
      return;
    }

    setLoading(true);
    try {
      const inviteList = inviteUsers
        .split(',')
        .map(u => u.trim())
        .filter(u => u.length > 0);

      const room = await matrixService.createRoom(roomName.trim(), inviteList);
      if (room) {
        onRoomCreated(room);
        handleClose();
      } else {
        Alert.alert('Error', 'Failed to create room');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRoomName('');
    setInviteUsers('');
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
                <Text style={styles.title}>Create New Room</Text>
                <TouchableOpacity onPress={handleClose}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                <Input
                  label="Room Name"
                  value={roomName}
                  onChangeText={setRoomName}
                  placeholder="e.g., Agent Collective"
                />

                <Input
                  label="Invite Agents (optional)"
                  value={inviteUsers}
                  onChangeText={setInviteUsers}
                  placeholder="@agent1:matrix.org, @agent2:matrix.org"
                  multiline
                  numberOfLines={2}
                />

                <Text style={styles.hint}>
                  Separate multiple agent IDs with commas
                </Text>
              </View>

              <View style={styles.footer}>
                <Button
                  title="Cancel"
                  onPress={handleClose}
                  variant="ghost"
                  style={styles.cancelButton}
                />
                <Button
                  title="Create Room"
                  onPress={handleCreate}
                  loading={loading}
                  disabled={!roomName.trim()}
                  style={styles.createButton}
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
  createButton: {
    flex: 1,
  },
});

export default CreateRoomModal;
