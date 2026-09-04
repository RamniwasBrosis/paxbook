"use client";

import * as React from "react";
import Script from "next/script";

interface PaymentOrder {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string | null;
  mock: boolean;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function FlightBookingPaymentPanel({ bookingId, amount, currency }: { bookingId: string; amount: number; currency: string }) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function startPayment() {
    setBusy(true);
    setError(null);
    try {
      const orderRes = await fetch(`/api/customer/flight-bookings/${bookingId}/payment/order`, { method: "POST" });
      const orderJson = await orderRes.json();
      if (!orderRes.ok || orderJson.success === false) {
        throw new Error(orderJson?.error?.message ?? "Could not start payment.");
      }
      const order = orderJson.data as PaymentOrder;

      if (order.mock || !order.keyId || !window.Razorpay) {
        await verify(order.paymentId, { devConfirm: true });
        return;
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: Math.round(order.amount * 100),
        currency: order.currency,
        order_id: order.orderId,
        name: "Paxbook Flights",
        handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          void verify(order.paymentId, {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
      });
      rzp.open();
      setBusy(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment.");
      setBusy(false);
    }
  }

  async function verify(paymentId: string, payload: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/customer/flight-bookings/${bookingId}/payment/${paymentId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json?.error?.message ?? "Payment could not be verified.");
      }
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment could not be verified.");
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <p className="text-xs text-amber-700">Amount due</p>
      <p className="text-2xl font-bold text-navy-deep">
        {currency} {amount.toLocaleString("en-IN")}
      </p>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <button
        type="button"
        onClick={startPayment}
        disabled={busy}
        className="mt-4 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-navy-deep transition-colors hover:bg-accent-dark disabled:opacity-60"
      >
        {busy ? "Processing…" : "Pay now"}
      </button>
    </div>
  );
}
