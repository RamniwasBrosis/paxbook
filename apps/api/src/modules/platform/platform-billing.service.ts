import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import type { BillingActivationOrderDto, SubscriptionDto } from "@paxbook/types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RazorpaySubscriptionService } from "./razorpay-subscription.service";
import type { ConfirmBillingActivationDto } from "./dto/confirm-billing-activation.dto";

const SUBSCRIPTION_TOTAL_COUNT = 120; // 10 years of monthly cycles — Razorpay's "run until cancelled" convention

@Injectable()
export class PlatformBillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly razorpaySubscriptionService: RazorpaySubscriptionService,
  ) {}

  async getSubscription(tenantId: string): Promise<SubscriptionDto> {
    const subscription = await this.prisma.subscription.findUnique({ where: { tenantId }, include: { plan: true } });
    if (!subscription) {
      throw new NotFoundException({ code: "SUBSCRIPTION_NOT_FOUND", message: "No subscription found for this tenant." });
    }
    return this.toDto(subscription);
  }

  async createActivationOrder(tenantId: string): Promise<BillingActivationOrderDto> {
    const subscription = await this.prisma.subscription.findUnique({ where: { tenantId }, include: { plan: true } });
    if (!subscription) {
      throw new NotFoundException({ code: "SUBSCRIPTION_NOT_FOUND", message: "No subscription found for this tenant." });
    }
    if (subscription.status === "ACTIVE") {
      throw new BadRequestException({ code: "SUBSCRIPTION_ALREADY_ACTIVE", message: "This subscription is already active." });
    }

    const result = await this.razorpaySubscriptionService.createSubscription(subscription.plan.razorpayPlanId, SUBSCRIPTION_TOTAL_COUNT);
    await this.prisma.subscription.update({ where: { id: subscription.id }, data: { razorpaySubscriptionId: result.razorpaySubscriptionId } });

    return { subscriptionId: subscription.id, razorpaySubscriptionId: result.razorpaySubscriptionId, keyId: result.keyId, mock: result.mock };
  }

  async confirmActivation(tenantId: string, dto: ConfirmBillingActivationDto): Promise<SubscriptionDto> {
    const subscription = await this.prisma.subscription.findUnique({ where: { tenantId }, include: { plan: true } });
    if (!subscription || !subscription.razorpaySubscriptionId) {
      throw new NotFoundException({ code: "SUBSCRIPTION_NOT_FOUND", message: "Start activation first." });
    }

    if (this.razorpaySubscriptionService.isConfigured) {
      if (!dto.razorpayPaymentId || !dto.razorpaySignature) {
        throw new BadRequestException({ code: "PAYMENT_VERIFICATION_INCOMPLETE", message: "Missing Razorpay verification fields." });
      }
      const valid = this.razorpaySubscriptionService.verifySignature(subscription.razorpaySubscriptionId, dto.razorpayPaymentId, dto.razorpaySignature);
      if (!valid) {
        throw new UnauthorizedException({ code: "PAYMENT_SIGNATURE_INVALID", message: "Payment verification failed." });
      }
    } else if (!dto.devConfirm) {
      throw new BadRequestException({ code: "PAYMENT_NOT_CONFIRMED", message: "Payment was not confirmed." });
    }

    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    const updated = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "ACTIVE", currentPeriodEnd },
      include: { plan: true },
    });
    return this.toDto(updated);
  }

  private toDto(s: { id: string; planId: string; plan: { name: string; priceMonthly: { toNumber(): number }; currency: string }; status: SubscriptionDto["status"]; razorpaySubscriptionId: string | null; currentPeriodEnd: Date | null }): SubscriptionDto {
    return {
      id: s.id,
      planId: s.planId,
      planName: s.plan.name,
      priceMonthly: s.plan.priceMonthly.toNumber(),
      currency: s.plan.currency,
      status: s.status,
      razorpaySubscriptionId: s.razorpaySubscriptionId,
      currentPeriodEnd: s.currentPeriodEnd?.toISOString() ?? null,
    };
  }
}
