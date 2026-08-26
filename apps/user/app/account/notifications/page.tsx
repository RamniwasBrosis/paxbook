import type { Metadata } from "next";
import type { NotificationDto } from "@paxbook/types";
import { customerFetch } from "@/lib/customer-api";
import { NotificationMarkReadButton } from "@/components/NotificationMarkReadButton";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const notifications = await customerFetch<NotificationDto[]>("/customer/notifications");

  return (
    <div>
      <p className="eyebrow">Updates</p>
      <h1 className="mt-1 font-display text-2xl font-bold text-navy-deep sm:text-3xl">Notifications</h1>
      <p className="mt-1 text-sm text-slate-500">Updates on your bookings, payments, and requests.</p>

      {notifications.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-mist p-6 text-sm text-slate-500">No notifications yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start justify-between gap-4 rounded-2xl border p-4 ${n.isRead ? "border-slate-100 bg-white" : "border-accent/50 bg-mist-strong"}`}
            >
              <div>
                <p className="font-bold text-navy-deep">{n.title}</p>
                <p className="mt-1 text-sm text-slate-600">{n.body}</p>
                <p className="mt-2 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString("en-IN")}</p>
              </div>
              {!n.isRead ? <NotificationMarkReadButton id={n.id} /> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
