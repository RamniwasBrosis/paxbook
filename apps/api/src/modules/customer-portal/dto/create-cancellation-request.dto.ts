import { IsOptional, IsString } from "class-validator";

export class CreateCancellationRequestDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
