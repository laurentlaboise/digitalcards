import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

interface SubscribePayload {
  profile_id: string;
}

@WebSocketGateway({
  namespace: 'analytics',
  cors: true,
})
export class AnalyticsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(AnalyticsGateway.name);
  private readonly clientProfileMap = new Map<string, Set<string>>();

  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token =
        client.handshake.query.token as string ||
        client.handshake.auth?.token as string;

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token, disconnecting`);
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      (client as any).userId = payload.sub;

      this.logger.log(`Client ${client.id} authenticated as user ${payload.sub}`);
    } catch (error) {
      this.logger.warn(`Client ${client.id} failed authentication: ${error.message}`);
      client.emit('error', { message: 'Invalid or expired token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.clientProfileMap.delete(client.id);
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SubscribePayload,
  ): { event: string; data: { subscribed: boolean; profile_id: string } } {
    const profileId = data.profile_id;

    if (!profileId) {
      return {
        event: 'error',
        data: { subscribed: false, profile_id: null },
      };
    }

    const roomName = `profile:${profileId}`;
    client.join(roomName);

    if (!this.clientProfileMap.has(client.id)) {
      this.clientProfileMap.set(client.id, new Set());
    }
    this.clientProfileMap.get(client.id).add(profileId);

    this.logger.log(`Client ${client.id} subscribed to profile ${profileId}`);

    return {
      event: 'subscribed',
      data: { subscribed: true, profile_id: profileId },
    };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SubscribePayload,
  ): { event: string; data: { unsubscribed: boolean; profile_id: string } } {
    const profileId = data.profile_id;

    if (!profileId) {
      return {
        event: 'error',
        data: { unsubscribed: false, profile_id: null },
      };
    }

    const roomName = `profile:${profileId}`;
    client.leave(roomName);

    if (this.clientProfileMap.has(client.id)) {
      this.clientProfileMap.get(client.id).delete(profileId);
    }

    this.logger.log(`Client ${client.id} unsubscribed from profile ${profileId}`);

    return {
      event: 'unsubscribed',
      data: { unsubscribed: true, profile_id: profileId },
    };
  }

  broadcastEvent(profileId: string, event: any): void {
    const roomName = `profile:${profileId}`;
    this.server.to(roomName).emit('analytics_event', {
      profile_id: profileId,
      ...event,
      broadcast_at: new Date().toISOString(),
    });
  }
}
