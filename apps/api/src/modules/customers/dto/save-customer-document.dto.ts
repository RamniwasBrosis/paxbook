import { IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class SaveCustomerDocumentDto {
  @IsOptional()
  @IsUUID()
  travelerId?: string;

  @IsString()
  @MinLength(1)
  docType!: string;

  @IsString()
  @MinLength(1)
  storageKey!: string;
}
