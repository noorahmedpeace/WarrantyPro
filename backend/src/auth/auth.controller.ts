import { Controller, Post, Body, Get, Query, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('magic-link')
    async requestMagicLink(@Body('email') email: string) {
        return this.authService.generateMagicLink(email);
    }

    @Get('verify')
    async verifyMagicLink(@Query('token') token: string) {
        return this.authService.verifyMagicLink(token);
    }

    @Post('register')
    async register(@Body() body: any) {
        return this.authService.register(body);
    }

    @Post('login')
    async login(@Body() body: any) {
        return this.authService.login(body);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res: Response) {
        const { access_token } = await this.authService.validateGoogleUser(req.user);

        // Redirect to frontend with token
        // In production, use cookies or a secure way to pass the token
        res.redirect(`http://localhost:5173/auth/callback?token=${access_token}`);
    }
}
