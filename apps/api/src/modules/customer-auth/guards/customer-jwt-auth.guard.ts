import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/** Applied per-route (not globally — the global JwtAuthGuard is admin-only). Every route using this must also be @Public() to skip the global admin guard. */
@Injectable()
export class CustomerJwtAuthGuard extends AuthGuard("customer-jwt") {}
