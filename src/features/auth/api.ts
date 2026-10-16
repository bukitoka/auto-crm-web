import "server-only";
import { cache } from "react";
import { apiFetch } from "@/lib/api-client";
import type { SetupStatus, User } from "./types";

/** Current user, de-duplicated per request (layout + pages can both call it). */
export const getCurrentUser = cache(() => apiFetch<User>("/auth/me"));

export const getSetupStatus = cache(() => apiFetch<SetupStatus>("/auth/setup", { auth: false }));
