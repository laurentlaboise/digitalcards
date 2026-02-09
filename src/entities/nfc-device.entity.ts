import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Order } from './order.entity';

export enum DeviceType {
  CARD = 'card',
  TAG = 'tag',
  STICKER = 'sticker',
}

export enum DeviceMaterial {
  PLASTIC = 'plastic',
  METAL = 'metal',
  WOOD = 'wood',
}

@Entity('nfc_devices')
export class NFCDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  device_serial: string;

  @Column({ type: 'enum', enum: DeviceType })
  device_type: DeviceType;

  @Column({ type: 'enum', enum: DeviceMaterial })
  material: DeviceMaterial;

  @Column({ unique: true })
  @Index()
  provisioning_token: string;

  @Column({ uuid: true, nullable: true })
  profile_id: string;

  @ManyToOne(() => Profile, (profile) => profile.nfc_devices, {
    nullable: true,
  })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @Column({ nullable: true })
  activated_at: Date;

  @Column({ uuid: true, nullable: true })
  order_id: string;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @CreateDateColumn()
  created_at: Date;
}
