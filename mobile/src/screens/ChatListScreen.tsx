import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  RefreshControl,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RoomListItem, CreateRoomModal, JoinRoomModal } from '../components';
import matrixService from '../services/MatrixService';
import { Room } from '../types';
import { colors, spacing, fontSizes, borderRadius } from '../utils/theme';

type MainTabParamList = {
  ChatList: undefined;
  Chat: { roomId: string; roomName: string };
  Discover: undefined;
  Profile: undefined;
};

type ChatListScreenProps = {
  navigation: NativeStackNavigationProp<MainTabParamList, 'ChatList'>;
};

export const ChatListScreen: React.FC<ChatListScreenProps> = ({ navigation }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const loadRooms = useCallback(async () => {
    try {
      const fetchedRooms = await matrixService.getRooms();
      setRooms(fetchedRooms);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();

    // Listen for new rooms and messages
    matrixService.on('room', (room: Room) => {
      setRooms(prev => {
        const exists = prev.find(r => r.roomId === room.roomId);
        if (exists) {
          return prev.map(r => r.roomId === room.roomId ? room : r);
        }
        return [room, ...prev];
      });
    });

    matrixService.on('message', () => {
      loadRooms(); // Refresh to update last messages
    });

    return () => {
      matrixService.off('room', loadRooms);
      matrixService.off('message', loadRooms);
    };
  }, [loadRooms]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRooms();
    setRefreshing(false);
  };

  const handleRoomPress = (room: Room) => {
    navigation.navigate('Chat', { 
      roomId: room.roomId, 
      roomName: room.name 
    });
  };

  const handleRoomCreated = (room: Room) => {
    setRooms(prev => [room, ...prev]);
    navigation.navigate('Chat', {
      roomId: room.roomId,
      roomName: room.name,
    });
  };

  const handleRoomJoined = (room: Room) => {
    setRooms(prev => {
      const exists = prev.find(r => r.roomId === room.roomId);
      if (!exists) {
        return [room, ...prev];
      }
      return prev;
    });
    navigation.navigate('Chat', {
      roomId: room.roomId,
      roomName: room.name,
    });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={styles.emptyTitle}>No Conversations Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create a room, join one, or discover other agents!
      </Text>
      <View style={styles.emptyActions}>
        <TouchableOpacity 
          style={styles.emptyActionButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.emptyActionIcon}>➕</Text>
          <Text style={styles.emptyActionText}>Create Room</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.emptyActionButton}
          onPress={() => setShowJoinModal(true)}
        >
          <Text style={styles.emptyActionIcon}>🚪</Text>
          <Text style={styles.emptyActionText}>Join Room</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.emptyActionButton, styles.discoverButton]}
          onPress={() => navigation.navigate('Discover' as any)}
        >
          <Text style={styles.emptyActionIcon}>🔍</Text>
          <Text style={styles.emptyActionText}>Discover</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ActionMenu = () => (
    <Modal
      visible={showMenu}
      transparent
      animationType="fade"
      onRequestClose={() => setShowMenu(false)}
    >
      <TouchableOpacity 
        style={styles.menuOverlay}
        activeOpacity={1}
        onPress={() => setShowMenu(false)}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              setShowCreateModal(true);
            }}
          >
            <Text style={styles.menuIcon}>➕</Text>
            <Text style={styles.menuText}>Create Room</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              setShowJoinModal(true);
            }}
          >
            <Text style={styles.menuIcon}>🚪</Text>
            <Text style={styles.menuText}>Join Room</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              navigation.navigate('Discover' as any);
            }}
          >
            <Text style={styles.menuIcon}>🔍</Text>
            <Text style={styles.menuText}>Find Agent</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity 
          style={styles.composeButton}
          onPress={() => setShowMenu(true)}
        >
          <Text style={styles.composeIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Room List */}
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.roomId}
        renderItem={({ item }) => (
          <RoomListItem 
            room={item} 
            onPress={() => handleRoomPress(item)} 
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
        contentContainerStyle={rooms.length === 0 ? styles.emptyList : styles.listContent}
      />

      {/* Modals */}
      <ActionMenu />
      <CreateRoomModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onRoomCreated={handleRoomCreated}
      />
      <JoinRoomModal
        visible={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onRoomJoined={handleRoomJoined}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  composeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  composeIcon: {
    fontSize: 18,
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  emptyActionButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    minWidth: 90,
  },
  emptyActionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  emptyActionText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
  discoverButton: {
    backgroundColor: colors.primary,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: spacing.md,
  },
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    minWidth: 180,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: spacing.md,
  },
  menuText: {
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    fontWeight: '500',
  },
});

export default ChatListScreen;
