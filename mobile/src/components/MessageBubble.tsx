import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../types';
import { Avatar } from './Avatar';
import { colors, spacing, fontSizes, borderRadius } from '../utils/theme';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isOwn,
  showAvatar = true 
}) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending': return '⏳';
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      case 'failed': return '⚠️';
      default: return '';
    }
  };

  return (
    <View style={[
      styles.container,
      isOwn ? styles.containerOwn : styles.containerOther
    ]}>
      {!isOwn && showAvatar && (
        <Avatar 
          uri={message.sender.avatarUrl} 
          name={message.sender.displayName} 
          size={32}
        />
      )}
      <View style={[
        styles.bubble,
        isOwn ? styles.bubbleOwn : styles.bubbleOther,
        !isOwn && !showAvatar && styles.bubbleNoAvatar
      ]}>
        {!isOwn && (
          <Text style={styles.senderName}>{message.sender.displayName}</Text>
        )}
        <Text style={[
          styles.content,
          isOwn ? styles.contentOwn : styles.contentOther
        ]}>
          {message.content}
        </Text>
        <View style={styles.footer}>
          <Text style={[
            styles.time,
            isOwn ? styles.timeOwn : styles.timeOther
          ]}>
            {formatTime(message.timestamp)}
          </Text>
          {isOwn && (
            <Text style={[
              styles.status,
              message.status === 'read' && styles.statusRead
            ]}>
              {getStatusIcon()}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  containerOwn: {
    justifyContent: 'flex-end',
  },
  containerOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  bubbleOwn: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: spacing.xs,
  },
  bubbleOther: {
    backgroundColor: colors.surfaceLight,
    borderBottomLeftRadius: spacing.xs,
    marginLeft: spacing.sm,
  },
  bubbleNoAvatar: {
    marginLeft: 40,
  },
  senderName: {
    color: colors.primaryLight,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  content: {
    fontSize: fontSizes.md,
    lineHeight: 22,
  },
  contentOwn: {
    color: '#FFFFFF',
  },
  contentOther: {
    color: colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  time: {
    fontSize: fontSizes.xs,
  },
  timeOwn: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  timeOther: {
    color: colors.textMuted,
  },
  status: {
    marginLeft: spacing.xs,
    fontSize: fontSizes.xs,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statusRead: {
    color: colors.accent,
  },
});

export default MessageBubble;
