import { IsArray, IsUUID } from "class-validator";

export class SyncBookingTravelersDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  travelerIds!: string[];
}
