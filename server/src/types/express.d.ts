import { Types } from "mongoose";
import { Role } from "../modules/tenant/membership.model.js";
import { TenantPlan } from "../modules/tenant/tenant.model.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
      tenantContext?: {
        tenantId: Types.ObjectId;
        role: Role;
        plan: TenantPlan;
      };
    }
  }
}
