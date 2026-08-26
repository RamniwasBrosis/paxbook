"use client";

import * as React from "react";
import { PERMISSIONS } from "@paxbook/config";
import { useSession, useSubscription, useCreateBillingActivation, useConfirmBillingActivation } from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@paxbook/ui";

const STATUS_TONE = { TRIALING: "info", ACTIVE: "success", PAST_DUE: "warning", CANCELLED: "danger" } as const;

export default function BillingSettingsPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.SETTINGS_READ);
  const canWrite = hasPermission(PERMISSIONS.SETTINGS_WRITE);

  if (!canRead) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-base font-semibold text-slate-900">Permission required</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your role doesn&apos;t include <code>settings.read</code>.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Billing</h1>
        <p className="text-sm text-slate-500">Your subscription plan and payment status.</p>
      </div>
      <BillingContent canWrite={canWrite} />
    </div>
  );
}

function BillingContent({ canWrite }: { canWrite: boolean }) {
  const subscriptionQuery = useSubscription();
  const createActivation = useCreateBillingActivation();
  const confirmActivation = useConfirmBillingActivation();
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function handleActivate() {
    setError(null);
    setBusy(true);
    try {
      const order = await createActivation.mutateAsync();
      if (order.mock) {
        await confirmActivation.mutateAsync({ devConfirm: true });
      } else {
        // Real Razorpay checkout would open here using order.razorpaySubscriptionId / order.keyId.
        setError("Razorpay checkout is wired up server-side — add the front-end checkout.js flow once live keys are configured.");
      }
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not activate billing.");
    } finally {
      setBusy(false);
    }
  }

  if (subscriptionQuery.isLoading || !subscriptionQuery.data) {
    return <p className="text-sm text-slate-500">Loading subscription…</p>;
  }

  const subscription = subscriptionQuery.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current plan</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">{subscription.planName}</p>
            <p className="text-sm text-slate-500">
              {subscription.currency} {subscription.priceMonthly.toLocaleString("en-IN")} / month
            </p>
          </div>
          <Badge tone={STATUS_TONE[subscription.status]}>{subscription.status}</Badge>
        </div>

        {subscription.currentPeriodEnd ? (
          <p className="text-xs text-slate-400">Current period ends {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN")}</p>
        ) : null}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {canWrite && subscription.status !== "ACTIVE" ? (
          <Button onClick={handleActivate} isLoading={busy} className="self-start">
            Activate subscription
          </Button>
        ) : null}
        {subscription.status !== "ACTIVE" ? (
          <p className="text-xs text-slate-400">
            No live Razorpay keys are configured yet, so activation confirms in dev mode. Add real keys to process an actual charge.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
