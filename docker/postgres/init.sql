-- Extensions Prisma/the app relies on (uuid generation, case-insensitive email lookups).
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
