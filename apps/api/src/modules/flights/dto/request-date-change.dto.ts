import { IsDateString, IsString, MaxLength, MinLength } from "class-validator";

export class RequestDateChangeDto {
  /** ISO date (YYYY-MM-DD) — converted to FTD's DD-MM-YYYY format before the real reschedule call. */
  @IsDateString()
  newTravelDate!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  remarks!: string;
}
