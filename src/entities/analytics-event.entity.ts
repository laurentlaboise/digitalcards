import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Profile } from './profile.entity';

export enum EventType {
  VIEW = 'view',
  CLICK = 'click',
  SHARE = 'share',
  LEAD_CAPTURE = 'lead_capture',
  NFC_TAP = 'nfc_tap',
}

@Entity('analytics_events')
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ uuid: true })
  @Index()
  profile_id: string;

  @ManyToOne(() => Profile, (profile) => profile.analytics_events, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @Column({ type: 'enum', enum: EventType })
  event_type: EventType;

  @Column({ type: 'jsonb', nullable: true })
  event_metadata: {
    link_clicked?: string;
    device?: string;
    os?: string;
    browser?: string;
    referrer?: string;
    nfc_serial?: string;
  };

  @Column({ nullable: true })
  ip_address: string;

  @Column({ nullable: true })
  user_agent: string;

  @Column({ type: 'jsonb', nullable: true })
  geolocation: {
    country?: string;
    city?: string;
    region?: string;
    lat?: number;
    lng?: number;
  };

  @Column({ type: 'timestamptz' })
  @Index()
  timestamp: Date;
}
