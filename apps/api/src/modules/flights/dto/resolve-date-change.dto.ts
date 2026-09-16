import { IsOptional, IsString, MaxLength } from "class-validator";

export class ResolveDateChangeDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}
