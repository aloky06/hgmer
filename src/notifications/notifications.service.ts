import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

@Injectable()
export class NotificationsService {
  private expo: Expo;

  constructor(private prisma: PrismaService) {
    this.expo = new Expo();
  }

  async broadcast(data: { title: string; message: string; type: string; linkType?: string; linkTarget?: string }) {
    // Fetch all users to broadcast to
    const users = await this.prisma.user.findMany({
      select: { id: true, pushToken: true }
    });

    if (users.length === 0) return { count: 0 };

    // Send Expo push notifications
    const messages: ExpoPushMessage[] = [];
    const uniqueTokens = new Set<string>(); // Deduplicate tokens

    for (const user of users) {
      if (user.pushToken && Expo.isExpoPushToken(user.pushToken) && !uniqueTokens.has(user.pushToken)) {
        uniqueTokens.add(user.pushToken);
        messages.push({
          to: user.pushToken,
          sound: 'default',
          title: data.title,
          body: data.message,
          data: { 
            type: data.type,
            linkType: data.linkType,
            linkTarget: data.linkTarget
          },
        });
      }
    }

    if (messages.length > 0) {
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];
      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending Expo push notifications:', error);
        }
      }
    }

    return { count: messages.length };
  }
}
