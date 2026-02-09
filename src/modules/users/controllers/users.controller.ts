import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../../entities';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: User) {
    return this.usersService.getProfile(user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete (deactivate) current user account' })
  @ApiResponse({ status: 200, description: 'Account deactivated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteAccount(@CurrentUser() user: User) {
    return this.usersService.deleteAccount(user.id);
  }

  @Get('subscription')
  @ApiOperation({ summary: 'Get current user subscription details' })
  @ApiResponse({ status: 200, description: 'Subscription details retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSubscription(@CurrentUser() user: User) {
    return this.usersService.getSubscription(user.id);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get current user usage statistics' })
  @ApiResponse({ status: 200, description: 'Usage statistics retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUsage(@CurrentUser() user: User) {
    return this.usersService.getUsage(user.id);
  }
}
