import mongoose, { Schema, Document, Types } from "mongoose";

export const ROLES = ["OWNER", "ADMIN", "MEMBER", "CLIENT_VIEWER"] as const;
export type Role = (typeof ROLES)[number];

export const MEMBERSHIP_STATUSES = ["INVITED", "ACTIVE", "SUSPENDED"] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export interface IMembership extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  userId: Types.ObjectId;
  role: Role;
  status: MembershipStatus;
  clientCompany?: string;
  inviteTokenHash?: string;
  inviteTokenExpires?: Date;
  invitedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const membershipSchema = new Schema<IMembership>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ROLES,
      default: "MEMBER",
      required: true,
    },
    status: {
      type: String,
      enum: MEMBERSHIP_STATUSES,
      required: true,
      default: "ACTIVE",
    },
    clientCompany: {
      type: String,
      trim: true,
    },
    inviteTokenHash: {
      type: String,
      select: false,
    },
    inviteTokenExpires: {
      type: Date,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// Prevent duplicate memberships for the same user in the same tenant
membershipSchema.index({ tenantId: 1, userId: 1 }, { unique: true });

// Fast lookup of active workspaces for a user during login
membershipSchema.index({ userId: 1, status: 1 });

// Fast lookup of invite tokens (sparse)
membershipSchema.index({ inviteTokenHash: 1 }, { sparse: true });

export const MembershipModel = mongoose.model<IMembership>(
  "Membership",
  membershipSchema,
);
