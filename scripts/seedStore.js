// scripts/seedStore.js
import prisma from "../lib/prisma.js";
import crypto from "crypto";

async function main() {
  // Pick a fixed userId for your admin
  const adminId = "admin-user-1";

  // 1. Upsert user (using id, since it's unique)
  const user = await prisma.user.upsert({
    where: { id: adminId },
    update: {}, // nothing to update for now
    create: {
      id: adminId,
      name: "Admin User",
      email: "mooiprofessional7@gmail.com",
      image: "https://placehold.co/100x100",
      cart: {}
    }
  });

  console.log("User ready:", user.id);

  // 2. Upsert store
  const store = await prisma.store.upsert({
    where: { username: "mooiprof" }, // username is unique in schema
    update: { status: "approved", isActive: true },
    create: {
      userId: user.id,
      name: "Mooi Prof Store",
      description: "Main ecommerce store",
      username: "mooiprof",
      address: "123 Main Street",
      logo: "https://placehold.co/200x200",
      email: "store@example.com",
      contact: "+91-9876543210",
      status: "approved",
      isActive: true
    }
  });

  console.log("Store ready with id:", store.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit());
