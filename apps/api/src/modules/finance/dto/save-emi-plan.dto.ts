import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";

export class EmiInstallmentInputDto {
  @IsString()
  dueDate!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsBoolean()
  paid?: boolean;
}

export class SaveEmiPlanDto {
  @IsInt()
  @Min(1)
  totalInstallments!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmiInstallmentInputDto)
  schedule!: EmiInstallmentInputDto[];
}
