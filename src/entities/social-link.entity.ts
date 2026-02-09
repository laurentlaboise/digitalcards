import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from './profile.entity';

export enum SocialPlatform {
  LINKEDIN = 'linkedin',
  TWITTER = 'twitter',
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  YOUTUBE = 'youtube',
  TIKTOK = 'tiktok',
  GITHUB = 'github',
  DRIBBBLE = 'dribbble',
  BEHANCE = 'behance',
  SNAPCHAT = 'snapchat',
  WHATSAPP = 'whatsapp',
  TELEGRAM = 'telegram',
  CUSTOM = 'custom',
}

@Entity('social_links')
export class SocialLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ uuid: true })
  profile_id: string;

  @ManyToOne(() => Profile, (profile) => profile.social_links, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @Column({ type: 'enum', enum: SocialPlatform })
  platform: SocialPlatform;

  @Column()
  url: string;

  @Column({ nullable: true })
  label: string;

  @Column({ default: 0 })
  display_order: number;
}
