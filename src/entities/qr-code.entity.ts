import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from './profile.entity';

export enum QRFormat {
  SVG = 'svg',
  PNG = 'png',
}

@Entity('qr_codes')
export class QRCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ uuid: true })
  profile_id: string;

  @ManyToOne(() => Profile, (profile) => profile.qr_codes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @Column({ type: 'text' })
  qr_data: string;

  @Column({ type: 'jsonb', nullable: true })
  style_settings: {
    color?: string;
    background?: string;
    logo_url?: string;
    shape?: string;
    size?: number;
  };

  @Column({ type: 'enum', enum: QRFormat, default: QRFormat.PNG })
  format: QRFormat;

  @Column({ nullable: true })
  file_url: string;

  @CreateDateColumn()
  created_at: Date;
}
