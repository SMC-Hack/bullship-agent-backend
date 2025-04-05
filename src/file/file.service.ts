import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class FileService {
  getFilePath(filename: string): string {
    const filePath = join(process.cwd(), 'upload', filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }
    return filePath;
  }

  async deleteFile(filename: string): Promise<void> {
    const filePath = this.getFilePath(filename);
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      throw new NotFoundException('Error deleting file');
    }
  }
} 