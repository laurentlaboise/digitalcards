import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Organization } from './organization.entity';
import { OrganizationMember } from './organization-member.entity';
import { Order } from './order.entity';
import { Subscription } from './subscription.entity';
import { AuditLog } from './audit-log.entity';
import { Integration } from './integration.entity';

export enum AuthMethod {
  PASSWORD = 'password',
  PASSKEY = 'passkey',
  SSO = 'sso',
}

export enum SubscriptionTier {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ nullable: true })
  password_hash: string;

  @Column({ type: 'enum', enum: AuthMethod, default: AuthMethod.PASSWORD })
  auth_method: AuthMethod;

  @Column({
    type: 'enum',
    enum: SubscriptionTier,
    default: SubscriptionTier.FREE,
  })
  subscription_tier: SubscriptionTier;

  @Column({ nullable: true })
  stripe_customer_id: string;

  @Column({ nullable: true })
  email_verified_at: Date;

  @Column({ nullable: true })
  last_login_at: Date;

  @Column({ nullable: true })
  passkey_credential_id: string;

  @Column({ type: 'bytea', nullable: true })
  passkey_public_key: Buffer;

  @Column({ nullable: true })
  password_reset_token: string;

  @Column({ nullable: true })
  password_reset_expires_at: Date;

  @Column({ nullable: true })
  email_verification_token: string;

  @Column({ default: false })
  is_suspended: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Profile, (profile) => profile.user)
  profiles: Profile[];

  @OneToMany(() => Organization, (org) => org.owner)
  owned_organizations: Organization[];

  @OneToMany(() => OrganizationMember, (member) => member.user)
  organization_memberships: OrganizationMember[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Subscription, (sub) => sub.user)
  subscriptions: Subscription[];

  @OneToMany(() => AuditLog, (log) => log.user)
  audit_logs: AuditLog[];

  @OneToMany(() => Integration, (integration) => integration.user)
  integrations: Integration[];
}
