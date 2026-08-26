import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { SkipAudit } from "../../common/decorators/skip-audit.decorator";
import { CurrentCustomer } from "../../common/decorators/current-customer.decorator";
import type { RequestCustomer } from "../../common/types/request-customer";
import { CustomerJwtAuthGuard } from "../customer-auth/guards/customer-jwt-auth.guard";
import { CustomersService } from "../customers/customers.service";
import { SaveTravelerDto } from "../customers/dto/save-traveler.dto";
import { SaveCustomerDocumentDto } from "../customers/dto/save-customer-document.dto";
import { CustomerProfileService } from "./customer-profile.service";
import { UpdateCustomerProfileDto } from "./dto/update-customer-profile.dto";

@ApiTags("customer-portal")
@Public()
@UseGuards(CustomerJwtAuthGuard)
@SkipAudit()
@Controller({ path: "customer/profile", version: "1" })
export class CustomerProfileController {
  constructor(
    private readonly customerProfileService: CustomerProfileService,
    private readonly customersService: CustomersService,
  ) {}

  @Get()
  getProfile(@CurrentCustomer() customer: RequestCustomer) {
    return this.customerProfileService.getProfile(customer.tenantId, customer.sub);
  }

  @Get("full")
  getFullProfile(@CurrentCustomer() customer: RequestCustomer) {
    return this.customersService.findOne(customer.tenantId, customer.sub);
  }

  @Patch()
  updateProfile(@CurrentCustomer() customer: RequestCustomer, @Body() dto: UpdateCustomerProfileDto) {
    return this.customerProfileService.updateProfile(customer.tenantId, customer.sub, dto);
  }

  @Post("travelers")
  addTraveler(@CurrentCustomer() customer: RequestCustomer, @Body() dto: SaveTravelerDto) {
    return this.customersService.addTraveler(customer.tenantId, customer.sub, dto);
  }

  @Patch("travelers/:travelerId")
  updateTraveler(@CurrentCustomer() customer: RequestCustomer, @Param("travelerId") travelerId: string, @Body() dto: SaveTravelerDto) {
    return this.customersService.updateTraveler(customer.tenantId, customer.sub, travelerId, dto);
  }

  @Delete("travelers/:travelerId")
  removeTraveler(@CurrentCustomer() customer: RequestCustomer, @Param("travelerId") travelerId: string) {
    return this.customersService.removeTraveler(customer.tenantId, customer.sub, travelerId);
  }

  @Post("documents")
  addDocument(@CurrentCustomer() customer: RequestCustomer, @Body() dto: SaveCustomerDocumentDto) {
    return this.customersService.addDocument(customer.tenantId, customer.sub, dto);
  }

  @Delete("documents/:documentId")
  removeDocument(@CurrentCustomer() customer: RequestCustomer, @Param("documentId") documentId: string) {
    return this.customersService.removeDocument(customer.tenantId, customer.sub, documentId);
  }
}
