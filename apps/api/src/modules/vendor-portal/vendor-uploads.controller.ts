import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { SkipAudit } from "../../common/decorators/skip-audit.decorator";
import { VendorJwtAuthGuard } from "../vendor-auth/guards/vendor-jwt-auth.guard";
import { StorageService } from "../../common/storage/storage.service";
import { CurrentVendor } from "../../common/decorators/current-vendor.decorator";
import type { RequestVendor } from "../../common/types/request-vendor";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

/** Vendor-scoped equivalent of the admin /uploads endpoint — that one sits behind the global admin guard. */
@ApiTags("vendor-portal")
@Public()
@UseGuards(VendorJwtAuthGuard)
@SkipAudit()
@Controller({ path: "vendor/uploads", version: "1" })
export class VendorUploadsController {
  constructor(private readonly storageService: StorageService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  async upload(@CurrentVendor() vendor: RequestVendor, @UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({ code: "FILE_REQUIRED", message: "No file was uploaded." });
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException({ code: "UNSUPPORTED_FILE_TYPE", message: "Only JPEG, PNG, WebP, or PDF files are supported." });
    }
    return this.storageService.uploadFile(vendor.tenantId, file.buffer, file.originalname);
  }
}
