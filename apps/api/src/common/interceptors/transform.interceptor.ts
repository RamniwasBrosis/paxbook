import { Injectable, type CallHandler, type ExecutionContext, type NestInterceptor } from "@nestjs/common";
import { map, type Observable } from "rxjs";

interface PaginatedShape<T> {
  data: T;
  meta: { page: number; pageSize: number; total: number };
}

function isPaginatedShape<T>(value: unknown): value is PaginatedShape<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    "meta" in value
  );
}

/**
 * Applied globally. Wraps every controller return value in the platform-wide
 * { success: true, data, meta? } envelope so all four future frontends
 * (admin/user/vendor/mobile) parse responses identically.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<unknown> {
    return next.handle().pipe(
      map((result) => {
        if (isPaginatedShape<T>(result)) {
          return { success: true, data: result.data, meta: result.meta };
        }
        return { success: true, data: result };
      }),
    );
  }
}
