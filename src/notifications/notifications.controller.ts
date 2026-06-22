import { Controller, Get, Patch, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post('broadcast')
  async broadcast(@Body() body: { title: string; message: string; type: string; linkType?: string; linkTarget?: string }) {
    return this.notificationsService.broadcast(body);
  }
}
