import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { StorageService } from "../../common/storage/storage.service";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const MAX_VIDEO_SIZE_BYTES = 150 * 1024 * 1024;

@ApiTags("uploads")
@ApiBearerAuth()
@Controller({ path: "uploads", version: "1" })
export class UploadsController {
  constructor(private readonly storageService: StorageService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  async upload(@CurrentAdmin() admin: RequestAdmin, @UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({ code: "FILE_REQUIRED", message: "No file was uploaded." });
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException({
        code: "UNSUPPORTED_FILE_TYPE",
        message: "Only JPEG, PNG, and WebP images are supported.",
      });
    }

    return this.storageService.uploadFile(admin.tenantId, file.buffer, file.originalname);
  }

  @Post("video")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: MAX_VIDEO_SIZE_BYTES } }))
  async uploadVideo(@CurrentAdmin() admin: RequestAdmin, @UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({ code: "FILE_REQUIRED", message: "No file was uploaded." });
    }
    if (!VIDEO_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException({
        code: "UNSUPPORTED_FILE_TYPE",
        message: "Only MP4, WebM, and MOV videos are supported.",
      });
    }

    return this.storageService.uploadFile(admin.tenantId, file.buffer, file.originalname);
  }
}
