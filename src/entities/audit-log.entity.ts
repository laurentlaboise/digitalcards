import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  INVITE = 'invite',
  EXPORT = 'export',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

export enum AuditResourceType {
  PROFILE = 'profile',
  USER = 'user',
  ORGANIZATION = 'organization',
  SETTINGS = 'settings',
  MEMBER = 'member',
  SUBSCRIPTION = 'subscription',
  ORDER = 'order',
  INTEGRATION = 'integration',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, (user) => user.audit_logs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  organization_id: string;

  @ManyToOne(() => Organization, (org) => org.audit_logs, { nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ type: 'enum', enum: AuditResourceType })
  resource_type: AuditResourceType;

  @Column('uuid')
  resource_id: string;

  @Column({ type: 'jsonb', nullable: true })
  changes: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };

  @Column({ nullable: true })
  ip_address: string;

  @Column({ type: 'timestamptz' })
  @Index()
  timestamp: Date;
}
