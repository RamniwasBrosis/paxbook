"use client";

import * as React from "react";
import { PERMISSIONS } from "@paxbook/config";
import { useSession, useIntegrations, useUpdateIntegrations } from "@paxbook/api-client";
import { ApiRequestError } from "@paxbook/auth-client";
import type { TenantIntegrationsDto, UpdateTenantIntegrationsDto } from "@paxbook/types";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from "@paxbook/ui";

export default function IntegrationsSettingsPage() {
  const { hasPermission } = useSession();
  const canRead = hasPermission(PERMISSIONS.SETTINGS_READ);
  const canWrite = hasPermission(PERMISSIONS.SETTINGS_WRITE);
  const integrationsQuery = useIntegrations();

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

  if (integrationsQuery.isLoading || !integrationsQuery.data) {
    return <p className="text-sm text-slate-500">Loading integrations…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Integrations</h1>
        <p className="text-sm text-slate-500">
          Connect your own payment, messaging, storage and analytics accounts. Nothing here is shared with other agencies on the platform —
          leave any card blank to keep the site running on its built-in fallback (dev-mode payments, on-screen OTP, local file storage, no
          analytics tags, static map text instead of an embedded map).
        </p>
      </div>
      <IntegrationsForm initial={integrationsQuery.data} canWrite={canWrite} />
    </div>
  );
}

function SecretField({
  label,
  placeholder,
  configured,
  disabled,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  configured: boolean;
  disabled: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Input
      label={label}
      type="password"
      placeholder={configured ? "•••••••• (configured — leave blank to keep)" : placeholder}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function IntegrationsForm({ initial, canWrite }: { initial: TenantIntegrationsDto; canWrite: boolean }) {
  const updateIntegrations = useUpdateIntegrations();
  const [form, setForm] = React.useState({
    razorpayKeyId: initial.razorpayKeyId ?? "",
    razorpayKeySecret: "",
    twilioAccountSid: initial.twilioAccountSid ?? "",
    twilioAuthToken: "",
    twilioFromNumber: initial.twilioFromNumber ?? "",
    twilioWhatsappFromNumber: initial.twilioWhatsappFromNumber ?? "",
    googleClientId: initial.googleClientId ?? "",
    googleClientSecret: "",
    smtpHost: initial.smtpHost ?? "",
    smtpPort: initial.smtpPort ? String(initial.smtpPort) : "",
    smtpUser: initial.smtpUser ?? "",
    smtpPassword: "",
    smtpFromEmail: initial.smtpFromEmail ?? "",
    ga4MeasurementId: initial.ga4MeasurementId ?? "",
    facebookPixelId: initial.facebookPixelId ?? "",
    googleMapsApiKey: initial.googleMapsApiKey ?? "",
    s3AccessKeyId: "",
    s3SecretAccessKey: "",
    s3Bucket: initial.s3Bucket ?? "",
    s3Region: initial.s3Region ?? "",
    s3PublicBaseUrl: initial.s3PublicBaseUrl ?? "",
  });
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      const payload: UpdateTenantIntegrationsDto = {
        razorpayKeyId: form.razorpayKeyId || undefined,
        razorpayKeySecret: form.razorpayKeySecret || undefined,
        twilioAccountSid: form.twilioAccountSid || undefined,
        twilioAuthToken: form.twilioAuthToken || undefined,
        twilioFromNumber: form.twilioFromNumber || undefined,
        twilioWhatsappFromNumber: form.twilioWhatsappFromNumber || undefined,
        googleClientId: form.googleClientId || undefined,
        googleClientSecret: form.googleClientSecret || undefined,
        smtpHost: form.smtpHost || undefined,
        smtpPort: form.smtpPort ? Number(form.smtpPort) : undefined,
        smtpUser: form.smtpUser || undefined,
        smtpPassword: form.smtpPassword || undefined,
        smtpFromEmail: form.smtpFromEmail || undefined,
        ga4MeasurementId: form.ga4MeasurementId || undefined,
        facebookPixelId: form.facebookPixelId || undefined,
        googleMapsApiKey: form.googleMapsApiKey || undefined,
        s3AccessKeyId: form.s3AccessKeyId || undefined,
        s3SecretAccessKey: form.s3SecretAccessKey || undefined,
        s3Bucket: form.s3Bucket || undefined,
        s3Region: form.s3Region || undefined,
        s3PublicBaseUrl: form.s3PublicBaseUrl || undefined,
      };
      await updateIntegrations.mutateAsync(payload);
      setForm((f) => ({ ...f, razorpayKeySecret: "", twilioAuthToken: "", googleClientSecret: "", smtpPassword: "", s3AccessKeyId: "", s3SecretAccessKey: "" }));
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save integrations.");
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Payment Gateway — Razorpay</CardTitle>
          <Badge tone={initial.razorpayConfigured ? "success" : "neutral"}>{initial.razorpayConfigured ? "Connected" : "Not connected"}</Badge>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Key ID" placeholder="rzp_live_..." disabled={!canWrite} value={form.razorpayKeyId} onChange={(e) => set("razorpayKeyId", e.target.value)} />
          <SecretField label="Key Secret" placeholder="Enter your Key Secret" configured={initial.razorpayConfigured} disabled={!canWrite} value={form.razorpayKeySecret} onChange={(v) => set("razorpayKeySecret", v)} />
          <p className="text-xs text-slate-400 sm:col-span-2">
            Until this is connected, checkout runs in dev-mode with a mock order (customers can still complete a test booking, but no real money moves).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>SMS &amp; WhatsApp — Twilio</CardTitle>
          <Badge tone={initial.smsConfigured ? "success" : "neutral"}>{initial.smsConfigured ? "Connected" : "Not connected"}</Badge>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Account SID" placeholder="AC..." disabled={!canWrite} value={form.twilioAccountSid} onChange={(e) => set("twilioAccountSid", e.target.value)} />
          <SecretField label="Auth Token" placeholder="Enter your Auth Token" configured={initial.smsConfigured} disabled={!canWrite} value={form.twilioAuthToken} onChange={(v) => set("twilioAuthToken", v)} />
          <Input label="SMS from-number" placeholder="+14155551234" disabled={!canWrite} value={form.twilioFromNumber} onChange={(e) => set("twilioFromNumber", e.target.value)} />
          <Input label="WhatsApp from-number (optional)" placeholder="whatsapp:+14155238886" disabled={!canWrite} value={form.twilioWhatsappFromNumber} onChange={(e) => set("twilioWhatsappFromNumber", e.target.value)} />
          <p className="text-xs text-slate-400 sm:col-span-2">
            Until this is connected, one-time login codes only show on-screen (dev mode) and "Talk on WhatsApp" links just open a chat with your
            number — no automated WhatsApp messages are sent. Add the from-number above once your Twilio WhatsApp sender is approved.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Google Login</CardTitle>
          <Badge tone={initial.googleLoginConfigured ? "success" : "neutral"}>{initial.googleLoginConfigured ? "Connected" : "Not connected"}</Badge>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="OAuth Client ID" placeholder="xxxx.apps.googleusercontent.com" disabled={!canWrite} value={form.googleClientId} onChange={(e) => set("googleClientId", e.target.value)} />
          <SecretField label="OAuth Client Secret" placeholder="Enter your Client Secret" configured={initial.googleLoginConfigured} disabled={!canWrite} value={form.googleClientSecret} onChange={(v) => set("googleClientSecret", v)} />
          <p className="text-xs text-slate-400 sm:col-span-2">
            From Google Cloud Console → APIs &amp; Services → Credentials. Set the authorized redirect URI to your site&apos;s
            <code className="mx-1 rounded bg-slate-100 px-1">/api/auth/google/callback</code>. Until this is connected, "Continue with Google" stays disabled on the login screen.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Email — SMTP</CardTitle>
          <Badge tone={initial.emailConfigured ? "success" : "neutral"}>{initial.emailConfigured ? "Connected" : "Not connected"}</Badge>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="SMTP host" placeholder="smtp.zoho.com" disabled={!canWrite} value={form.smtpHost} onChange={(e) => set("smtpHost", e.target.value)} />
          <Input label="SMTP port" placeholder="587" disabled={!canWrite} value={form.smtpPort} onChange={(e) => set("smtpPort", e.target.value.replace(/\D/g, ""))} />
          <Input label="SMTP username" placeholder="bookings@youragency.com" disabled={!canWrite} value={form.smtpUser} onChange={(e) => set("smtpUser", e.target.value)} />
          <SecretField label="SMTP password" placeholder="Enter your SMTP password" configured={initial.emailConfigured} disabled={!canWrite} value={form.smtpPassword} onChange={(v) => set("smtpPassword", v)} />
          <Input label="From address" placeholder="Paxbook <bookings@youragency.com>" disabled={!canWrite} value={form.smtpFromEmail} onChange={(e) => set("smtpFromEmail", e.target.value)} className="sm:col-span-2" />
          <p className="text-xs text-slate-400 sm:col-span-2">
            Used for booking confirmations and account notifications. Until this is connected, no emails are sent — customers still see everything
            in their dashboard and via SMS/on-screen OTP.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>File Storage — Amazon S3</CardTitle>
          <Badge tone={initial.s3Configured ? "success" : "neutral"}>{initial.s3Configured ? "Connected" : "Local disk"}</Badge>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SecretField label="Access key ID" placeholder="AKIA..." configured={initial.s3Configured} disabled={!canWrite} value={form.s3AccessKeyId} onChange={(v) => set("s3AccessKeyId", v)} />
          <SecretField label="Secret access key" placeholder="Enter your secret key" configured={initial.s3Configured} disabled={!canWrite} value={form.s3SecretAccessKey} onChange={(v) => set("s3SecretAccessKey", v)} />
          <Input label="Bucket name" placeholder="paxbook-uploads" disabled={!canWrite} value={form.s3Bucket} onChange={(e) => set("s3Bucket", e.target.value)} />
          <Input label="Region" placeholder="ap-south-1" disabled={!canWrite} value={form.s3Region} onChange={(e) => set("s3Region", e.target.value)} />
          <Input label="Public base URL (optional, e.g. CloudFront)" placeholder="https://cdn.youragency.com" disabled={!canWrite} value={form.s3PublicBaseUrl} onChange={(e) => set("s3PublicBaseUrl", e.target.value)} className="sm:col-span-2" />
          <p className="text-xs text-slate-400 sm:col-span-2">
            Until this is connected, uploaded images/documents are stored on the server&apos;s local disk — fine for a single VPS, but won&apos;t
            survive a server migration or scale across multiple servers.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maps &amp; Analytics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Google Maps API key (optional)" placeholder="AIza..." disabled={!canWrite} value={form.googleMapsApiKey} onChange={(e) => set("googleMapsApiKey", e.target.value)} />
          <Input label="GA4 Measurement ID" placeholder="G-XXXXXXXXXX" disabled={!canWrite} value={form.ga4MeasurementId} onChange={(e) => set("ga4MeasurementId", e.target.value)} />
          <Input label="Facebook Pixel ID" placeholder="123456789012345" disabled={!canWrite} value={form.facebookPixelId} onChange={(e) => set("facebookPixelId", e.target.value)} />
          <p className="text-xs text-slate-400 sm:col-span-2">
            Route maps on package/destination pages always work using a free map (no key needed) — add a Google Maps key here only if you want
            Google&apos;s own map tiles instead. GA4/Pixel tags only load on the site once an ID is set here.
          </p>
        </CardContent>
      </Card>

      {canWrite ? (
        <div>
          {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
          {saved ? <p className="mb-2 text-sm text-emerald-600">Saved.</p> : null}
          <Button type="submit" isLoading={updateIntegrations.isPending}>
            Save integrations
          </Button>
        </div>
      ) : null}
    </form>
  );
}
