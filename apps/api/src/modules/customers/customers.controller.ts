import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@paxbook/config";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import type { RequestAdmin } from "../../common/types/request-admin";
import { CustomersService } from "./customers.service";
import { SaveCustomerDto } from "./dto/save-customer.dto";
import { SaveTravelerDto } from "./dto/save-traveler.dto";
import { SaveCustomerDocumentDto } from "./dto/save-customer-document.dto";

@ApiTags("customers")
@ApiBearerAuth()
@Controller({ path: "customers", version: "1" })
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.CUSTOMERS_READ)
  findAll(@CurrentAdmin() admin: RequestAdmin) {
    return this.customersService.findAll(admin.tenantId);
  }

  @Get(":id")
  @RequirePermissions(PERMISSIONS.CUSTOMERS_READ)
  findOne(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    return this.customersService.findOne(admin.tenantId, id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CUSTOMERS_WRITE)
  create(@CurrentAdmin() admin: RequestAdmin, @Body() dto: SaveCustomerDto) {
    return this.customersService.create(admin.tenantId, dto);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.CUSTOMERS_WRITE)
  update(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string, @Body() dto: SaveCustomerDto) {
    return this.customersService.update(admin.tenantId, id, dto);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.CUSTOMERS_WRITE)
  async remove(@CurrentAdmin() admin: RequestAdmin, @Param("id") id: string) {
    await this.customersService.remove(admin.tenantId, id);
    return { id };
  }

  @Post(":customerId/travelers")
  @RequirePermissions(PERMISSIONS.CUSTOMERS_WRITE)
  addTraveler(@CurrentAdmin() admin: RequestAdmin, @Param("customerId") customerId: string, @Body() dto: SaveTravelerDto) {
    return this.customersService.addTraveler(admin.tenantId, customerId, dto);
  }

  @Patch(":customerId/travelers/:travelerId")
  @RequirePermissions(PERMISSIONS.CUSTOMERS_WRITE)
  updateTraveler(
    @CurrentAdmin() admin: RequestAdmin,
    @Param("customerId") customerId: string,
    @Param("travelerId") travelerId: string,
    @Body() dto: SaveTravelerDto,
  ) {
    return this.customersService.updateTraveler(admin.tenantId, customerId, travelerId, dto);
  }

  @Delete(":customerId/travelers/:travelerId")
  @RequirePermissions(PERMISSIONS.CUSTOMERS_WRITE)
  async removeTraveler(@CurrentAdmin() admin: RequestAdmin, @Param("customerId") customerId: string, @Param("travelerId") travelerId: string) {
    await this.customersService.removeTraveler(admin.tenantId, customerId, travelerId);
    return { id: travelerId };
  }

  @Post(":customerId/documents")
  @RequirePermissions(PERMISSIONS.CUSTOMERS_WRITE)
  addDocument(@CurrentAdmin() admin: RequestAdmin, @Param("customerId") customerId: string, @Body() dto: SaveCustomerDocumentDto) {
    return this.customersService.addDocument(admin.tenantId, customerId, dto);
  }

  @Delete(":customerId/documents/:documentId")
  @RequirePermissions(PERMISSIONS.CUSTOMERS_WRITE)
  async removeDocument(@CurrentAdmin() admin: RequestAdmin, @Param("customerId") customerId: string, @Param("documentId") documentId: string) {
    await this.customersService.removeDocument(admin.tenantId, customerId, documentId);
    return { id: documentId };
  }
}
