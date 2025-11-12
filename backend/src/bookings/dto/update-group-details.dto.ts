import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class UpdateGroupDetailsDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string; // (เราจะส่งค่าจาก Tap มา, เช่น '2025-12-22')

  @IsString()
  details: string; // (ชื่อการแข่งขัน)
}

