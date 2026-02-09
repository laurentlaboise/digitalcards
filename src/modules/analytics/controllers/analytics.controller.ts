import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Public } from '../../../common/decorators/public.decorator';
import { AnalyticsService } from '../services/analytics.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { AnalyticsQueryDto, AnalyticsInterval } from '../dto/analytics-query.dto';

@ApiTags('Analytics')
@Controller()
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('analytics/events')
  @Public()
  @ApiOperation({ summary: 'Ingest an analytics event (public endpoint for tracking)' })
  @HttpCode(HttpStatus.ACCEPTED)
  async ingestEvent(@Body() dto: CreateEventDto) {
    return this.analyticsService.ingestEvent(dto);
  }

  @Get('profiles/:id/analytics')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics summary for a profile' })
  @ApiParam({ name: 'id', description: 'Profile ID' })
  async getSummary(
    @Param('id') profileId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getSummary(profileId, {
      start: query.start_date,
      end: query.end_date,
    });
  }

  @Get('profiles/:id/analytics/timeseries')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get time-series analytics data for a profile' })
  @ApiParam({ name: 'id', description: 'Profile ID' })
  async getTimeseries(
    @Param('id') profileId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getTimeseries(
      profileId,
      { start: query.start_date, end: query.end_date },
      query.interval || AnalyticsInterval.DAILY,
    );
  }

  @Get('profiles/:id/analytics/geography')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get geographic breakdown of analytics events' })
  @ApiParam({ name: 'id', description: 'Profile ID' })
  async getGeography(
    @Param('id') profileId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getGeography(profileId, {
      start: query.start_date,
      end: query.end_date,
    });
  }

  @Get('profiles/:id/analytics/devices')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get device and OS breakdown of analytics events' })
  @ApiParam({ name: 'id', description: 'Profile ID' })
  async getDevices(
    @Param('id') profileId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getDevices(profileId, {
      start: query.start_date,
      end: query.end_date,
    });
  }

  @Get('profiles/:id/analytics/referrers')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get referrer breakdown of analytics events' })
  @ApiParam({ name: 'id', description: 'Profile ID' })
  async getReferrers(
    @Param('id') profileId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getReferrers(profileId, {
      start: query.start_date,
      end: query.end_date,
    });
  }

  @Get('profiles/:id/analytics/export')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export analytics data as CSV or PDF' })
  @ApiParam({ name: 'id', description: 'Profile ID' })
  @ApiQuery({ name: 'format', enum: ['csv', 'pdf'], required: false })
  async exportAnalytics(
    @Param('id') profileId: string,
    @Query() query: AnalyticsQueryDto,
    @Query('format') format: 'csv' | 'pdf' = 'csv',
  ) {
    return this.analyticsService.exportAnalytics(
      profileId,
      { start: query.start_date, end: query.end_date },
      format,
    );
  }
}
