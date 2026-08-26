import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from "@nestjs/common";
import type { Response } from "express";

interface ErrorBody {
  code?: string;
  message?: string | string[];
  details?: Array<{ field?: string; message: string }>;
}

/**
 * Applied globally. Every thrown error — HttpException or otherwise — comes
 * out as { success: false, error: { code, message, details } }. `code` is a
 * stable machine-readable string (not just the HTTP status) so frontends can
 * branch on it without parsing prose.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "INTERNAL_SERVER_ERROR";
    let message = "Something went wrong. Please try again.";
    let details: ErrorBody["details"];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === "string") {
        message = body;
        code = defaultCodeForStatus(status);
      } else {
        const b = body as ErrorBody;
        code = b.code ?? defaultCodeForStatus(status);
        message = Array.isArray(b.message) ? b.message.join(", ") : (b.message ?? message);
        details = Array.isArray(b.message)
          ? b.message.map((m) => ({ message: m }))
          : b.details;
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    } else {
      this.logger.error("Unknown exception thrown", JSON.stringify(exception));
    }

    response.status(status).json({
      success: false,
      error: { code, message, details },
    });
  }
}

function defaultCodeForStatus(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return "BAD_REQUEST";
    case HttpStatus.UNAUTHORIZED:
      return "UNAUTHORIZED";
    case HttpStatus.FORBIDDEN:
      return "FORBIDDEN";
    case HttpStatus.NOT_FOUND:
      return "NOT_FOUND";
    case HttpStatus.CONFLICT:
      return "CONFLICT";
    default:
      return "INTERNAL_SERVER_ERROR";
  }
}
