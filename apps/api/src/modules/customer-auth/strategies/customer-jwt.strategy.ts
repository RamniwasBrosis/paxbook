import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { RequestCustomer } from "../../../common/types/request-customer";

/** Named "customer-jwt" (distinct from admin's "jwt") and signed with a separate secret, so admin and customer tokens are never cross-valid. */
@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy, "customer-jwt") {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("CUSTOMER_JWT_ACCESS_SECRET"),
    });
  }

  validate(payload: RequestCustomer): RequestCustomer {
    return payload;
  }
}
