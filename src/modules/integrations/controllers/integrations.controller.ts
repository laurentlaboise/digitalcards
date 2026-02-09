import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { IntegrationsService } from '../services/integrations.service';
import { ConnectIntegrationDto } from '../dto/connect-integration.dto';

@ApiTags('Integrations')
@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @ApiOperation({ summary: 'List available integrations' })
  listAvailable() {
    return this.integrationsService.listAvailable();
  }

  @Post(':type/connect')
  @ApiOperation({ summary: 'Connect an integration' })
  async connect(
    @CurrentUser('id') userId: string,
    @Body() dto: ConnectIntegrationDto,
  ) {
    return this.integrationsService.connect(userId, dto);
  }

  @Delete(':id/disconnect')
  @ApiOperation({ summary: 'Disconnect an integration' })
  async disconnect(@Param('id', ParseUUIDPipe) integrationId: string) {
    return this.integrationsService.disconnect(integrationId);
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Trigger manual sync' })
  async triggerSync(@Param('id', ParseUUIDPipe) integrationId: string) {
    return this.integrationsService.triggerSync(integrationId);
  }

  @Post(':id/webhook')
  @Public()
  @ApiOperation({ summary: 'Incoming webhook handler' })
  async handleWebhook(
    @Param('id', ParseUUIDPipe) integrationId: string,
    @Body() payload: Record<string, any>,
  ) {
    return this.integrationsService.handleWebhook(integrationId, payload);
  }

  @Get('zapier/triggers')
  @ApiOperation({ summary: 'Zapier trigger definitions' })
  getZapierTriggers() {
    return this.integrationsService.getZapierTriggers();
  }

  @Get('zapier/actions')
  @ApiOperation({ summary: 'Zapier action definitions' })
  getZapierActions() {
    return this.integrationsService.getZapierActions();
  }
}
