import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import { UserModel } from "../modules/user/user.model.js";
import { TenantModel } from "../modules/tenant/tenant.model.js";
import { MembershipModel } from "../modules/tenant/membership.model.js";

async function seed() {
  console.log("🌱 Starting minimal database seed...");
  await connectDB();

  const ownerEmail = "owner@relayops.io";
  const existingOwner = await UserModel.findOne({ email: ownerEmail });

  if (existingOwner) {
    console.log(`ℹ️ Seed account ${ownerEmail} already exists. Skipping.`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const passwordHash = await bcrypt.hash("Password123!", 12);

    const [tenant] = await TenantModel.create(
      [
        {
          name: "RelayOps Studio",
          slug: "relayops-studio",
          plan: "FREE",
          settings: {
            currency: "USD",
            invoicePrefix: "REL",
            maxProjects: 3,
          },
        },
      ],
      { session },
    );

    const [user] = await UserModel.create(
      [
        {
          name: "RelayOps Owner",
          email: ownerEmail,
          passwordHash,
          lastActiveTenantId: tenant._id,
        },
      ],
      { session },
    );

    await MembershipModel.create(
      [
        {
          tenantId: tenant._id,
          userId: user._id,
          role: "OWNER",
          status: "ACTIVE",
        },
      ],
      { session },
    );

    await session.commitTransaction();

    console.log("✅ Minimal database seed completed successfully!");
    console.log("--------------------------------------------------");
    console.log(`👤 Owner Email:    ${ownerEmail}`);
    console.log("🔑 Password:       Password123!");
    console.log(`🏢 Workspace:      ${tenant.name} (${tenant.slug})`);
    console.log(`🆔 Tenant ID:      ${tenant._id.toString()}`);
    console.log("--------------------------------------------------");
  } catch (error) {
    await session.abortTransaction();
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    session.endSession();
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
