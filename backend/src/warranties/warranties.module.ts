import { Module } from '@nestjs/common';
import { WarrantiesService } from './warranties.service';
import { WarrantiesController } from './warranties.controller';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';
import { RemindersService } from './reminders.service';

@Module({
  controllers: [WarrantiesController],
  providers: [WarrantiesService, PrismaService, EmailService, RemindersService],
})
export class WarrantiesModule { }
