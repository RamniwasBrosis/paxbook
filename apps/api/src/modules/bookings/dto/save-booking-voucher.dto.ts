import { IsString, MinLength } from "class-validator";

export class SaveBookingVoucherDto {
  @IsString()
  @MinLength(1)
  storageKey!: string;
}
