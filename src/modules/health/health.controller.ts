import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Liveness check' })
  async liveness() {
    return this.healthService.liveness();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check - verifies DB, Redis, S3 connectivity' })
  async readiness(@Res() res: Response) {
    const result = await this.healthService.readiness();
    const status = result.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    return res.status(status).json(result);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Application metrics' })
  async metrics() {
    return this.healthService.metrics();
  }
}
