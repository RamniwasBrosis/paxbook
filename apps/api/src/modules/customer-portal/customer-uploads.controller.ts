import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { SkipAudit } from "../../common/decorators/skip-audit.decorator";
import { CurrentCustomer } from "../../common/decorators/current-customer.decorator";
import type { RequestCustomer } from "../../common/types/request-customer";
import { CustomerJwtAuthGuard } from "../customer-auth/guards/customer-jwt-auth.guard";
import { StorageService } from "../../common/storage/storage.service";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

/** Customer-scoped equivalent of the admin/vendor upload endpoints — used for traveler document uploads. */
@ApiTags("customer-portal")
@Public()
@UseGuards(CustomerJwtAuthGuard)
@SkipAudit()
@Controller({ path: "customer/uploads", version: "1" })
export class CustomerUploadsController {
  constructor(private readonly storageService: StorageService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  async upload(@CurrentCustomer() customer: RequestCustomer, @UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({ code: "FILE_REQUIRED", message: "No file was uploaded." });
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException({ code: "UNSUPPORTED_FILE_TYPE", message: "Only JPEG, PNG, WebP, or PDF files are supported." });
    }
    return this.storageService.uploadFile(customer.tenantId, file.buffer, file.originalname);
  }
}
