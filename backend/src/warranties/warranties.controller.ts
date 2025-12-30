import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { WarrantiesService } from './warranties.service';
import { CreateWarrantyDto } from './dto/create-warranty.dto';
import { UpdateWarrantyDto } from './dto/update-warranty.dto';

@Controller('warranties')
@UseGuards(AuthGuard('jwt'))
export class WarrantiesController {
  constructor(private readonly warrantiesService: WarrantiesService) { }

  @Post()
  create(@Body() createWarrantyDto: CreateWarrantyDto, @Request() req) {
    createWarrantyDto.user_id = req.user.id;
    return this.warrantiesService.create(createWarrantyDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.warrantiesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.warrantiesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWarrantyDto: UpdateWarrantyDto, @Request() req) {
    return this.warrantiesService.update(id, req.user.id, updateWarrantyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.warrantiesService.remove(id, req.user.id);
  }

  @Post(':id/files')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  uploadFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Request() req) {
    return this.warrantiesService.addFile(id, req.user.id, file);
  }
}
