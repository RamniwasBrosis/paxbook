import { PrismaClient } from "@prisma/client";
import { DEFAULT_TENANT_SLUG } from "@paxbook/config";
import { seedTenantRolesAndPermissions } from "../src/common/tenant/seed-tenant-defaults";
import { hashPassword } from "../src/common/crypto/password";

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: DEFAULT_TENANT_SLUG },
    update: {},
    create: { slug: DEFAULT_TENANT_SLUG, name: "Paxbook" },
  });

  const roleByName = await seedTenantRolesAndPermissions(prisma, tenant.id);

  const superAdminRole = roleByName.get("SuperAdmin")!;
  const contentEditorRole = roleByName.get("ContentEditor")!;

  const superAdminPasswordHash = await hashPassword("PaxbookAdmin@123");
  await prisma.adminUser.upsert({
    where: { email: "admin@paxbook.test" },
    update: { isPlatformOwner: true },
    create: {
      tenantId: tenant.id,
      email: "admin@paxbook.test",
      name: "Paxbook Super Admin",
      passwordHash: superAdminPasswordHash,
      roleId: superAdminRole.id,
      isPlatformOwner: true,
    },
  });

  const editorPasswordHash = await hashPassword("PaxbookEditor@123");
  await prisma.adminUser.upsert({
    where: { email: "editor@paxbook.test" },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "editor@paxbook.test",
      name: "Sample Content Editor",
      passwordHash: editorPasswordHash,
      roleId: contentEditorRole.id,
    },
  });

  const countries = [
    { name: "India", iso2: "IN", region: "India" },
    { name: "Thailand", iso2: "TH", region: "Asia" },
    { name: "Indonesia", iso2: "ID", region: "Asia" },
    { name: "United Arab Emirates", iso2: "AE", region: "Middle East" },
    { name: "Singapore", iso2: "SG", region: "Asia" },
    { name: "Vietnam", iso2: "VN", region: "Asia" },
    { name: "Maldives", iso2: "MV", region: "Indian Ocean" },
    { name: "Malaysia", iso2: "MY", region: "Asia" },
    { name: "Japan", iso2: "JP", region: "Asia" },
    { name: "Switzerland", iso2: "CH", region: "Europe" },
    { name: "Sri Lanka", iso2: "LK", region: "Asia" },
    { name: "Mauritius", iso2: "MU", region: "Indian Ocean" },
    { name: "Bhutan", iso2: "BT", region: "Asia" },
    { name: "Europe", iso2: "EU", region: "Europe" },
  ];
  for (const country of countries) {
    await prisma.country.upsert({ where: { iso2: country.iso2 }, update: { region: country.region }, create: country });
  }

  const destinationCategories = [
    "Theme",
    "Honeymoon",
    "Family",
    "Adventure",
    "Seasonal",
    "Budget",
    "Luxury",
    "Couple",
    "Friends",
    "Group",
    "Corporate",
  ];
  for (const name of destinationCategories) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }

  const plans = [
    { name: "Starter", priceMonthly: 2999, maxAdminUsers: 3, maxPackages: 25 },
    { name: "Growth", priceMonthly: 9999, maxAdminUsers: 10, maxPackages: 150 },
    { name: "Enterprise", priceMonthly: 24999, maxAdminUsers: null, maxPackages: null },
  ];
  for (const plan of plans) {
    await prisma.plan.upsert({ where: { name: plan.name }, update: {}, create: plan });
  }

  console.log("Seed complete.");
  console.log("  SuperAdmin  -> admin@paxbook.test  / PaxbookAdmin@123");
  console.log("  ContentEditor -> editor@paxbook.test / PaxbookEditor@123 (no users.* or finance.* permissions — use this to verify RBAC 403s)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
