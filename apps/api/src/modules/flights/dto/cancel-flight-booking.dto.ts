import { IsIn, IsInt, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RequestFlightCancellationDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}

export class AdminCancelFlightBookingDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;

  /** 2 Missed/No-show, 5 Customer cancel (default), 6 Already cancelled, 7 Flight cancelled, 8 Time changed. */
  @IsOptional()
  @IsInt()
  @IsIn([2, 5, 6, 7, 8])
  canMode?: number;
}
