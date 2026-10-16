export type { User } from "@/features/users/types";

export type SetupStatus = {
  /** True until the super admin account exists. */
  needs_setup: boolean;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};
