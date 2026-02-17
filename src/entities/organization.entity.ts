import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { SubscriptionTier } from './enums';
import { OrganizationMember } from './organization-member.entity';
import { Profile } from './profile.entity';
import { Order } from './order.entity';
import { Subscription } from './subscription.entity';
import { EmailTemplate } from './email-template.entity';
import { AuditLog } from './audit-log.entity';
import { Integration } from './integration.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('uuid')
  owner_user_id: string;

  @ManyToOne(() => User, (user) => user.owned_organizations)
  @JoinColumn({ name: 'owner_user_id' })
  owner: User;

  @Column({
    type: 'enum',
    enum: SubscriptionTier,
    default: SubscriptionTier.FREE,
  })
  subscription_tier: SubscriptionTier;

  @Column({ default: 1 })
  seat_count: number;

  @Column({ type: 'jsonb', nullable: true })
  branding_settings: {
    logo_url?: string;
    colors?: { primary: string; secondary: string };
    fonts?: { heading: string; body: string };
    locked_fields?: string[];
  };

  @Column({ nullable: true })
  custom_domain: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => OrganizationMember, (member) => member.organization)
  members: OrganizationMember[];

  @OneToMany(() => Profile, (profile) => profile.organization)
  profiles: Profile[];

  @OneToMany(() => Order, (order) => order.organization)
  orders: Order[];

  @OneToMany(() => Subscription, (sub) => sub.organization)
  subscriptions: Subscription[];

  @OneToMany(() => EmailTemplate, (template) => template.organization)
  email_templates: EmailTemplate[];

  @OneToMany(() => AuditLog, (log) => log.organization)
  audit_logs: AuditLog[];

  @OneToMany(() => Integration, (integration) => integration.organization)
  integrations: Integration[];
}
