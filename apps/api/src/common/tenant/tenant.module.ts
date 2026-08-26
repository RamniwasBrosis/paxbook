import { Global, Module } from "@nestjs/common";
import { TenantContextService } from "./tenant-context.service";
import { TenantResolverMiddleware } from "./tenant-resolver.middleware";

@Global()
@Module({
  providers: [TenantContextService, TenantResolverMiddleware],
  exports: [TenantContextService, TenantResolverMiddleware],
})
export class TenantModule {}
