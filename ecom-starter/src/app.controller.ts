import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Hello world / liveness endpoint. GET /
   */
  @Get()
  @ApiOperation({ summary: 'Hello world / health check' })
  getHello() {
    return this.appService.getHello();
  }
}
