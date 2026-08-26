import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { CustomerAuthService } from "./customer-auth.service";
import { CustomerAuthController } from "./customer-auth.controller";
import { CustomerJwtStrategy } from "./strategies/customer-jwt.strategy";

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>("CUSTOMER_JWT_ACCESS_SECRET"),
      }),
    }),
  ],
  controllers: [CustomerAuthController],
  providers: [CustomerAuthService, CustomerJwtStrategy],
})
export class CustomerAuthModule {}
