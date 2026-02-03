import * as sdk from 'matrix-js-sdk';
import * as SecureStore from 'expo-secure-store';
import { Agent, Room, Message, LoginCredentials, MatrixConfig } from '../types';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'matrix_access_token',
  USER_ID: 'matrix_user_id',
  DEVICE_ID: 'matrix_device_id',
  HOMESERVER: 'matrix_homeserver',
};

class MatrixService {
  private client: sdk.MatrixClient | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  async initialize(config?: MatrixConfig): Promise<boolean> {
    try {
      // Try to restore session from secure storage
      const savedToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      const savedUserId = await SecureStore.getItemAsync(STORAGE_KEYS.USER_ID);
      const savedDeviceId = await SecureStore.getItemAsync(STORAGE_KEYS.DEVICE_ID);
      const savedHomeserver = await SecureStore.getItemAsync(STORAGE_KEYS.HOMESERVER);

      if (config?.accessToken || savedToken) {
        this.client = sdk.createClient({
          baseUrl: config?.baseUrl || savedHomeserver || 'https://matrix.org',
          accessToken: config?.accessToken || savedToken || undefined,
          userId: config?.userId || savedUserId || undefined,
          deviceId: config?.deviceId || savedDeviceId || undefined,
        });

        // Start the client
        await this.client.startClient({ initialSyncLimit: 20 });
        this.setupEventListeners();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Matrix initialization error:', error);
      return false;
    }
  }

  async login(credentials: LoginCredentials): Promise<Agent> {
    try {
      // Create a temporary client for login
      const tempClient = sdk.createClient({
        baseUrl: credentials.homeserver,
      });

      const response = await tempClient.login('m.login.password', {
        user: credentials.username,
        password: credentials.password,
        initial_device_display_name: 'AgentMatrix Mobile',
      });

      // Save credentials securely
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, response.user_id);
      await SecureStore.setItemAsync(STORAGE_KEYS.DEVICE_ID, response.device_id);
      await SecureStore.setItemAsync(STORAGE_KEYS.HOMESERVER, credentials.homeserver);

      // Create the actual client
      this.client = sdk.createClient({
        baseUrl: credentials.homeserver,
        accessToken: response.access_token,
        userId: response.user_id,
        deviceId: response.device_id,
      });

      await this.client.startClient({ initialSyncLimit: 20 });
      this.setupEventListeners();

      // Get user profile
      const profile = await this.client.getProfileInfo(response.user_id);

      return {
        id: response.user_id,
        displayName: profile.displayname || credentials.username,
        avatarUrl: profile.avatar_url,
        capabilities: [],
        status: 'online',
        homeserver: credentials.homeserver,
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  async register(credentials: LoginCredentials): Promise<Agent> {
    try {
      const tempClient = sdk.createClient({
        baseUrl: credentials.homeserver,
      });

      const response = await tempClient.register(
        credentials.username,
        credentials.password,
        null,
        { type: 'm.login.dummy' }
      );

      // After registration, login
      return this.login(credentials);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.client) {
        await this.client.logout();
        this.client.stopClient();
        this.client = null;
      }

      // Clear stored credentials
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.DEVICE_ID);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.HOMESERVER);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getRooms(): Promise<Room[]> {
    if (!this.client) return [];

    const rooms = this.client.getRooms();
    return rooms.map((room) => this.mapRoom(room));
  }

  async getRoom(roomId: string): Promise<Room | null> {
    if (!this.client) return null;

    const room = this.client.getRoom(roomId);
    if (!room) return null;

    return this.mapRoom(room);
  }

  async sendMessage(roomId: string, content: string): Promise<Message | null> {
    if (!this.client) return null;

    try {
      const response = await this.client.sendMessage(roomId, {
        msgtype: sdk.MsgType.Text,
        body: content,
      });

      return {
        id: response.event_id,
        roomId,
        sender: this.getCurrentAgent()!,
        content,
        timestamp: Date.now(),
        type: 'text',
        status: 'sent',
      };
    } catch (error) {
      console.error('Send message error:', error);
      return null;
    }
  }

  async getMessages(roomId: string, limit: number = 50): Promise<Message[]> {
    if (!this.client) return [];

    const room = this.client.getRoom(roomId);
    if (!room) return [];

    const timeline = room.getLiveTimeline();
    const events = timeline.getEvents();

    return events
      .filter((event) => event.getType() === 'm.room.message')
      .slice(-limit)
      .map((event) => this.mapEvent(event, roomId));
  }

  async createRoom(name: string, invite: string[] = []): Promise<Room | null> {
    if (!this.client) return null;

    try {
      const response = await this.client.createRoom({
        name,
        invite,
        preset: sdk.Preset.PrivateChat,
      });

      const room = this.client.getRoom(response.room_id);
      return room ? this.mapRoom(room) : null;
    } catch (error) {
      console.error('Create room error:', error);
      return null;
    }
  }

  async joinRoom(roomIdOrAlias: string): Promise<Room | null> {
    if (!this.client) return null;

    try {
      const response = await this.client.joinRoom(roomIdOrAlias);
      const room = this.client.getRoom(response.roomId);
      return room ? this.mapRoom(room) : null;
    } catch (error) {
      console.error('Join room error:', error);
      return null;
    }
  }

  async searchAgents(query: string): Promise<Agent[]> {
    if (!this.client) return [];

    try {
      const response = await this.client.searchUserDirectory({ term: query, limit: 20 });
      return response.results.map((user: any) => ({
        id: user.user_id,
        displayName: user.display_name || user.user_id,
        avatarUrl: user.avatar_url,
        capabilities: [],
        status: 'offline' as const,
        homeserver: user.user_id.split(':')[1],
      }));
    } catch (error) {
      console.error('Search agents error:', error);
      return [];
    }
  }

  async startDirectChat(userId: string): Promise<Room | null> {
    if (!this.client) return null;

    try {
      const response = await this.client.createRoom({
        is_direct: true,
        invite: [userId],
        preset: sdk.Preset.TrustedPrivateChat,
      });

      const room = this.client.getRoom(response.room_id);
      return room ? this.mapRoom(room) : null;
    } catch (error) {
      console.error('Start direct chat error:', error);
      return null;
    }
  }

  getCurrentAgent(): Agent | null {
    if (!this.client) return null;

    const userId = this.client.getUserId();
    if (!userId) return null;

    return {
      id: userId,
      displayName: userId.split(':')[0].substring(1),
      capabilities: [],
      status: 'online',
      homeserver: userId.split(':')[1],
    };
  }

  isLoggedIn(): boolean {
    return this.client !== null && this.client.isLoggedIn();
  }

  // Event subscription
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }

  private setupEventListeners(): void {
    if (!this.client) return;

    this.client.on(sdk.ClientEvent.Room, (room: sdk.Room) => {
      this.emit('room', this.mapRoom(room));
    });

    this.client.on(sdk.RoomEvent.Timeline, (event: sdk.MatrixEvent, room: sdk.Room | undefined) => {
      if (event.getType() === 'm.room.message' && room) {
        this.emit('message', this.mapEvent(event, room.roomId));
      }
    });

    this.client.on(sdk.ClientEvent.Sync, (state: string) => {
      this.emit('sync', state);
    });
  }

  private mapRoom(room: sdk.Room): Room {
    const lastEvent = room.getLiveTimeline().getEvents().slice(-1)[0];
    const members = room.getJoinedMembers();

    return {
      roomId: room.roomId,
      name: room.name || 'Unnamed Room',
      avatarUrl: room.getAvatarUrl(this.client?.baseUrl || '', 48, 48, 'crop') || undefined,
      lastMessage: lastEvent?.getType() === 'm.room.message'
        ? this.mapEvent(lastEvent, room.roomId)
        : undefined,
      unreadCount: room.getUnreadNotificationCount() || 0,
      isDirect: room.getDMInviter() !== null,
      members: members.map((member) => ({
        id: member.userId,
        displayName: member.name || member.userId,
        avatarUrl: member.getAvatarUrl(this.client?.baseUrl || '', 48, 48, 'crop', false, false) || undefined,
        capabilities: [],
        status: 'offline' as const,
        homeserver: member.userId.split(':')[1],
      })),
    };
  }

  private mapEvent(event: sdk.MatrixEvent, roomId: string): Message {
    const content = event.getContent();
    const sender = event.getSender();

    return {
      id: event.getId() || '',
      roomId,
      sender: {
        id: sender || '',
        displayName: sender?.split(':')[0].substring(1) || 'Unknown',
        capabilities: [],
        status: 'offline',
        homeserver: sender?.split(':')[1] || '',
      },
      content: content.body || '',
      timestamp: event.getTs(),
      type: content.msgtype === 'm.image' ? 'image' : 'text',
      status: 'delivered',
    };
  }
}

export const matrixService = new MatrixService();
export default matrixService;
