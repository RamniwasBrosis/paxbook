import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { VendorAuthService } from "./vendor-auth.service";
import { VendorAuthController } from "./vendor-auth.controller";
import { VendorJwtStrategy } from "./strategies/vendor-jwt.strategy";

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>("VENDOR_JWT_ACCESS_SECRET"),
      }),
    }),
  ],
  controllers: [VendorAuthController],
  providers: [VendorAuthService, VendorJwtStrategy],
})
export class VendorAuthModule {}
