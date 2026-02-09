import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from './profile.entity';

export enum AssetType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

@Entity('media_assets')
export class MediaAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ uuid: true })
  profile_id: string;

  @ManyToOne(() => Profile, (profile) => profile.media_assets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @Column({ type: 'enum', enum: AssetType })
  asset_type: AssetType;

  @Column()
  file_url: string;

  @Column({ type: 'bigint' })
  file_size: number;

  @Column()
  mime_type: string;

  @Column({ nullable: true })
  original_filename: string;

  @Column({ default: 0 })
  display_order: number;

  @CreateDateColumn()
  created_at: Date;
}
