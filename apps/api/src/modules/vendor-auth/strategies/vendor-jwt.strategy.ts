import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { RequestVendor } from "../../../common/types/request-vendor";

/** Named "vendor-jwt" (distinct from admin's "jwt" and customer's "customer-jwt"), its own secret. */
@Injectable()
export class VendorJwtStrategy extends PassportStrategy(Strategy, "vendor-jwt") {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("VENDOR_JWT_ACCESS_SECRET"),
    });
  }

  validate(payload: RequestVendor): RequestVendor {
    return payload;
  }
}
