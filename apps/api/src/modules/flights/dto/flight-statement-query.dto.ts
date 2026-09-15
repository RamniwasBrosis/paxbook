import { Transform } from "class-transformer";
import { IsBoolean, IsDateString, IsOptional } from "class-validator";

export class FlightStatementQueryDto {
  /** YYYY-MM-DD */
  @IsDateString()
  date!: string;

  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  refresh?: boolean;
}
