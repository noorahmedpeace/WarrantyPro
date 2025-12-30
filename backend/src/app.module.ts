import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WarrantiesModule } from './warranties/warranties.module';
import { PrismaService } from './prisma.service';
import { CategoriesModule } from './categories/categories.module';
import { OcrModule } from './ocr/ocr.module';
import { AlertsModule } from './alerts/alerts.module';
import { SettingsModule } from './settings/settings.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    WarrantiesModule,
    CategoriesModule,
    OcrModule,
    AlertsModule,
    SettingsModule,
    AuthModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule { }
