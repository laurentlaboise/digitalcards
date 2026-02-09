import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';
import { SocialLink } from './social-link.entity';
import { MediaAsset } from './media-asset.entity';
import { ShortLink } from './short-link.entity';
import { QRCode } from './qr-code.entity';
import { LeadForm } from './lead-form.entity';
import { LeadSubmission } from './lead-submission.entity';
import { AnalyticsEvent } from './analytics-event.entity';
import { NFCDevice } from './nfc-device.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, (user) => user.profiles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  organization_id: string;

  @ManyToOne(() => Organization, (org) => org.profiles, { nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column()
  name: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  profile_photo_url: string;

  @Column({ nullable: true })
  company_logo_url: string;

  @Column({ type: 'jsonb', nullable: true })
  theme_settings: {
    colors?: { primary: string; secondary: string; background: string };
    background?: string;
    font?: string;
    layout?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  custom_fields: Array<{
    label: string;
    value: string;
    type: string;
    icon?: string;
  }>;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  password_protected: boolean;

  @Column({ nullable: true })
  password_hash: string;

  @Column({ nullable: true })
  expiration_date: Date;

  @Column({ default: 0 })
  @Index()
  view_count: number;

  @Column({ nullable: true })
  template_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => SocialLink, (link) => link.profile)
  social_links: SocialLink[];

  @OneToMany(() => MediaAsset, (asset) => asset.profile)
  media_assets: MediaAsset[];

  @OneToMany(() => ShortLink, (link) => link.profile)
  short_links: ShortLink[];

  @OneToMany(() => QRCode, (qr) => qr.profile)
  qr_codes: QRCode[];

  @OneToMany(() => LeadForm, (form) => form.profile)
  lead_forms: LeadForm[];

  @OneToMany(() => LeadSubmission, (sub) => sub.profile)
  lead_submissions: LeadSubmission[];

  @OneToMany(() => AnalyticsEvent, (event) => event.profile)
  analytics_events: AnalyticsEvent[];

  @OneToMany(() => NFCDevice, (device) => device.profile)
  nfc_devices: NFCDevice[];
}
