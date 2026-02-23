import { Injectable } from '@nestjs/common';

@Injectable()
export class VideoProcessingWorkerService {
  getHello(): string {
    return 'Hello World!';
  }
}
