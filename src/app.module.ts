import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { PanditsModule } from './pandits/pandits.module';
import { BannersModule } from './banners/banners.module';
import { FestivalsModule } from './festivals/festivals.module';
import { UploadModule } from './upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { InventoryModule } from './inventory/inventory.module';
import { ShiprocketModule } from './shiprocket/shiprocket.module';
import { OrdersModule } from './orders/orders.module';
import { PoojaTypesModule } from './pooja-types/pooja-types.module';
import { BookingsModule } from './bookings/bookings.module';

import { WishlistModule } from './wishlist/wishlist.module';
import { PoojaVidhisModule } from './pooja-vidhis/pooja-vidhis.module';
import { ConsultancyServicesModule } from './consultancy-services/consultancy-services.module';
import { HoroscopesModule } from './horoscopes/horoscopes.module';
import { PanchangsModule } from './panchangs/panchangs.module';
import { NotificationsModule } from './notifications/notifications.module';
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    PanditsModule,
    BannersModule,
    FestivalsModule,
    UploadModule,
    InventoryModule,
    ShiprocketModule,
    OrdersModule,
    PoojaTypesModule,
    BookingsModule,
    WishlistModule,
    PoojaVidhisModule,
    ConsultancyServicesModule,
    HoroscopesModule,
    PanchangsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
