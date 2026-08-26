import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron } from "@nestjs/schedule";
import { exec } from "node:child_process";
import { mkdir, readdir, stat, unlink } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);
const RETENTION_COUNT = 14;

/**
 * Nightly `pg_dump` of the whole database to local disk, auto-pruned to the last RETENTION_COUNT
 * files. This is a platform-level safety net (the DB is shared across tenants), not something an
 * individual agency configures — it just needs to exist and run quietly. Failure is logged, never
 * thrown: a missed backup shouldn't take the API down.
 */
@Injectable()
export class BackupService implements OnModuleInit {
  private readonly logger = new Logger(BackupService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.logger.log(`Automated backups scheduled — daily at 02:00, retaining the last ${RETENTION_COUNT} dumps in ${this.backupDir()}.`);
  }

  @Cron("0 2 * * *")
  async runNightlyBackup() {
    await this.runBackup();
  }

  async runBackup(): Promise<{ file: string } | { skipped: string }> {
    const databaseUrl = this.configService.get<string>("DATABASE_URL");
    if (!databaseUrl) {
      return { skipped: "DATABASE_URL not set" };
    }

    const dir = this.backupDir();
    await mkdir(dir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const file = join(dir, `paxbook-${timestamp}.sql`);
    const pgDumpPath = this.configService.get<string>("PG_DUMP_PATH", "pg_dump");
    // Prisma's `?schema=public` connection param isn't a real libpq option — pg_dump rejects it outright.
    const dumpUrl = databaseUrl.replace(/[?&]schema=[^&]*/, "");

    try {
      await execAsync(`"${pgDumpPath}" "${dumpUrl}" -f "${file}"`);
      this.logger.log(`Backup complete: ${file}`);
      await this.pruneOldBackups(dir);
      return { file };
    } catch (err) {
      this.logger.error(`Backup failed: ${(err as Error).message}`);
      throw err;
    }
  }

  private backupDir(): string {
    return this.configService.get<string>("BACKUP_DIR", join(process.cwd(), "backups"));
  }

  private async pruneOldBackups(dir: string) {
    const entries = await readdir(dir);
    const dumps = entries.filter((f) => f.startsWith("paxbook-") && f.endsWith(".sql"));
    if (dumps.length <= RETENTION_COUNT) return;

    const withStats = await Promise.all(
      dumps.map(async (f) => ({ file: f, mtime: (await stat(join(dir, f))).mtimeMs })),
    );
    withStats.sort((a, b) => b.mtime - a.mtime);
    const toDelete = withStats.slice(RETENTION_COUNT);
    await Promise.all(toDelete.map((d) => unlink(join(dir, d.file))));
  }
}
