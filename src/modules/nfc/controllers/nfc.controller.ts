import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { NfcService } from '../services/nfc.service';
import { ProvisionDeviceDto } from '../dto/provision-device.dto';
import { LinkProfileDto } from '../dto/link-profile.dto';
import { ScanEventDto } from '../dto/scan-event.dto';

@ApiTags('NFC')
@Controller('nfc')
@UseGuards(JwtAuthGuard)
export class NfcController {
  constructor(private readonly nfcService: NfcService) {}

  @Post('provision')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Provision a new NFC device' })
  @HttpCode(HttpStatus.CREATED)
  async provision(@Body() dto: ProvisionDeviceDto) {
    return this.nfcService.provision(dto);
  }

  @Get(':deviceSerial')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get NFC device details by serial number' })
  @ApiParam({ name: 'deviceSerial', description: 'Device serial number' })
  async getDevice(@Param('deviceSerial') deviceSerial: string) {
    return this.nfcService.getDevice(deviceSerial);
  }

  @Put(':deviceSerial/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Link a profile to an NFC device' })
  @ApiParam({ name: 'deviceSerial', description: 'Device serial number' })
  async linkProfile(
    @Param('deviceSerial') deviceSerial: string,
    @Body() dto: LinkProfileDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.nfcService.linkProfile(deviceSerial, dto.profile_id, userId);
  }

  @Delete(':deviceSerial/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlink a profile from an NFC device' })
  @ApiParam({ name: 'deviceSerial', description: 'Device serial number' })
  async unlinkProfile(
    @Param('deviceSerial') deviceSerial: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.nfcService.unlinkProfile(deviceSerial, userId);
  }

  @Post('scan')
  @Public()
  @ApiOperation({ summary: 'Handle NFC device scan (public endpoint)' })
  @HttpCode(HttpStatus.OK)
  async handleScan(@Body() dto: ScanEventDto) {
    return this.nfcService.handleScan(dto.device_serial, {
      user_agent: dto.user_agent,
      ip_address: dto.ip_address,
    });
  }

  @Get('orders/:orderId/devices')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all NFC devices for an order' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  async getOrderDevices(@Param('orderId') orderId: string) {
    return this.nfcService.getOrderDevices(orderId);
  }
}
