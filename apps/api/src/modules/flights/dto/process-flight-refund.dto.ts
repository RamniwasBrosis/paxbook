import { IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class ProcessFlightRefundDto {
  @IsNumber()
  @Min(1)
  @Max(1_000_000)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}
