// Type definitions for AgentMatrix

export interface Agent {
  id: string;
  displayName: string;
  avatarUrl?: string;
  capabilities: string[];
  status: 'online' | 'offline' | 'busy';
  bio?: string;
  homeserver: string;
}

export interface Room {
  roomId: string;
  name: string;
  avatarUrl?: string;
  lastMessage?: Message;
  unreadCount: number;
  isDirect: boolean;
  members: Agent[];
}

export interface Message {
  id: string;
  roomId: string;
  sender: Agent;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'file' | 'system';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface LoginCredentials {
  homeserver: string;
  username: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Agent | null;
  accessToken: string | null;
  error: string | null;
}

export interface MatrixConfig {
  baseUrl: string;
  userId?: string;
  accessToken?: string;
  deviceId?: string;
}
