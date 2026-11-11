import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password";

export const newPasswordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`)
  .max(200);
