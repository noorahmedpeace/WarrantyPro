import { Controller, Get, Patch, Post, Param, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service';

@Controller('alerts')
export class AlertsController {
    constructor(private readonly alertsService: AlertsService) { }

    @Get()
    findAll(@Query('userId') userId: string) {
        return this.alertsService.findAll(userId);
    }

    @Patch(':id/read')
    markAsRead(@Param('id') id: string) {
        return this.alertsService.markAsRead(id);
    }

    @Patch(':id/dismiss')
    dismiss(@Param('id') id: string) {
        return this.alertsService.dismiss(id);
    }

    @Post('generate')
    generateAlerts() {
        return this.alertsService.generateExpiryAlerts();
    }
}
