import { SetMetadata } from "@nestjs/common";

export const SKIP_AUDIT_KEY = "skipAudit";

/** Opt a mutating route OUT of automatic audit logging (opt-out, not opt-in, by design). */
export const SkipAudit = () => SetMetadata(SKIP_AUDIT_KEY, true);
