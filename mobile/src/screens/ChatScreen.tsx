import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput,
  StyleSheet, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MessageBubble, Avatar } from '../components';
import matrixService from '../services/MatrixService';
import { Message, Room } from '../types';
import { colors, spacing, fontSizes, borderRadius } from '../utils/theme';

type MainTabParamList = {
  ChatList: undefined;
  Chat: { roomId: string; roomName: string };
};

type ChatScreenProps = {
  navigation: NativeStackNavigationProp<MainTabParamList, 'Chat'>;
  route: RouteProp<MainTabParamList, 'Chat'>;
};

export const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { roomId, roomName } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const currentAgent = matrixService.getCurrentAgent();

  const loadMessages = useCallback(async () => {
    try {
      const [fetchedMessages, fetchedRoom] = await Promise.all([
        matrixService.getMessages(roomId),
        matrixService.getRoom(roomId),
      ]);
      setMessages(fetchedMessages);
      setRoom(fetchedRoom);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadMessages();

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      if (message.roomId === roomId) {
        setMessages(prev => [...prev, message]);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    };

    matrixService.on('message', handleNewMessage);

    return () => {
      matrixService.off('message', handleNewMessage);
    };
  }, [roomId, loadMessages]);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    // Optimistic update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      roomId,
      sender: currentAgent!,
      content: text,
      timestamp: Date.now(),
      type: 'text',
      status: 'sending',
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const sentMessage = await matrixService.sendMessage(roomId, text);
      if (sentMessage) {
        setMessages(prev => 
          prev.map(m => m.id === tempMessage.id ? sentMessage : m)
        );
      }
    } catch (error) {
      // Mark as failed
      setMessages(prev => 
        prev.map(m => m.id === tempMessage.id ? { ...m, status: 'failed' } : m)
      );
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.sender.id === currentAgent?.id;
    const prevMessage = messages[index - 1];
    const showAvatar = !isOwn && (
      !prevMessage || 
      prevMessage.sender.id !== item.sender.id ||
      item.timestamp - prevMessage.timestamp > 300000 // 5 minutes
    );

    return (
      <MessageBubble 
        message={item} 
        isOwn={isOwn} 
        showAvatar={showAvatar}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Avatar 
            uri={room?.avatarUrl} 
            name={roomName} 
            size={40}
            status={room?.members[0]?.status}
          />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {roomName}
            </Text>
            <Text style={styles.headerSubtitle}>
              {room?.members.length || 0} members
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }}
        />
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={4000}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!inputText.trim() || sending) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.sendIcon}>→</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  headerText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingVertical: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingTop: spacing.sm,
    color: colors.textPrimary,
    fontSize: fontSizes.md,
    maxHeight: 120,
    marginRight: spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceLight,
  },
  sendIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default ChatScreen;
