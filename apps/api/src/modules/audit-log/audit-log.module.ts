import { Global, Module } from "@nestjs/common";
import { AuditLogService } from "./audit-log.service";
import { AuditLogController } from "./audit-log.controller";

/**
 * @Global because the platform-wide AuditInterceptor (registered as
 * APP_INTERCEPTOR in AppModule) injects AuditLogService directly, outside
 * any specific feature module's own DI scope.
 */
@Global()
@Module({
  controllers: [AuditLogController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule {}
