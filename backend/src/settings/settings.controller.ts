import { Controller, Get, Patch, Query, Body, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    getSettings(@Query('userId') userId: string) {
        return this.settingsService.getOrCreate(userId);
    }

    @Patch(':userId')
    updateSettings(@Param('userId') userId: string, @Body() data: any) {
        return this.settingsService.update(userId, data);
    }
}
