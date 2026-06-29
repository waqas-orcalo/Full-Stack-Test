import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; service: string; timestamp: string } {
    return {
      message: 'Hello World',
      service: 'ecom-starter',
      timestamp: new Date().toISOString(),
    };
  }
}
