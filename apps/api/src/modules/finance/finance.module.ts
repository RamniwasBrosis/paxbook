import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { InvoicesController } from "./invoices.controller";
import { InvoicesService } from "./invoices.service";
import { EmiPlansController } from "./emi-plans.controller";
import { EmiPlansService } from "./emi-plans.service";
import { RefundsController } from "./refunds.controller";
import { RefundsService } from "./refunds.service";

@Module({
  controllers: [PaymentsController, InvoicesController, EmiPlansController, RefundsController],
  providers: [PaymentsService, InvoicesService, EmiPlansService, RefundsService],
  exports: [PaymentsService, InvoicesService],
})
export class FinanceModule {}
