import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationsService } from './services/organizations.service';
import { OrganizationsController } from './controllers/organizations.controller';
import {
  Organization,
  OrganizationMember,
  User,
  AuditLog,
} from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      OrganizationMember,
      User,
      AuditLog,
    ]),
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
