import { Controller, Get, Post, Delete, Param, Request, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  getWishlist(@Request() req) {
    return this.wishlistService.getWishlist(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':productId')
  addToWishlist(@Request() req, @Param('productId') productId: string) {
    return this.wishlistService.addToWishlist(req.user.userId, +productId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':productId')
  removeFromWishlist(@Request() req, @Param('productId') productId: string) {
    return this.wishlistService.removeFromWishlist(req.user.userId, +productId);
  }
}
