import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { CustomerProfileDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { UpdateCustomerProfileDto } from "./dto/update-customer-profile.dto";

@Injectable()
export class CustomerProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(tenantId: string, customerId: string): Promise<CustomerProfileDto> {
    const customer = await this.prisma.customer.findFirst({ where: { id: customerId, tenantId } });
    if (!customer) {
      throw new NotFoundException({ code: "CUSTOMER_NOT_FOUND", message: "Customer does not exist." });
    }
    return toProfileDto(customer);
  }

  async updateProfile(tenantId: string, customerId: string, dto: UpdateCustomerProfileDto): Promise<CustomerProfileDto> {
    await this.getProfile(tenantId, customerId);
    try {
      const updated = await this.prisma.customer.update({
        where: { id: customerId },
        data: { name: dto.name, email: dto.email, phone: dto.phone },
      });
      return toProfileDto(updated);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ConflictException({ code: "PROFILE_EMAIL_OR_PHONE_TAKEN", message: "This email or phone is already in use." });
      }
      throw err;
    }
  }
}

function toProfileDto(c: { id: string; name: string; email: string; phone: string | null; createdAt: Date }): CustomerProfileDto {
  return { id: c.id, name: c.name, email: c.email, phone: c.phone, createdAt: c.createdAt.toISOString() };
}
