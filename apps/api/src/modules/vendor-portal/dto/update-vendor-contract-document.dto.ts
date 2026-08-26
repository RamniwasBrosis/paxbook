import { IsString } from "class-validator";

export class UpdateVendorContractDocumentDto {
  @IsString()
  storageKey!: string;
}
