import { Card } from "@paxbook/ui";

export function ComingSoon({ title, checkpoint }: { title: string; checkpoint: number }) {
  return (
    <Card className="p-8 text-center">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">
        This module is scheduled for Checkpoint {checkpoint} of the Admin build and isn&apos;t wired up yet.
      </p>
    </Card>
  );
}
