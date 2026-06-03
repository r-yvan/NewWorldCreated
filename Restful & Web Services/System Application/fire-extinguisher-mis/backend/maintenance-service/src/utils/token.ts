import { randomBytes } from "crypto";

export function generateOpaqueToken(bytes = 48): string {
  return randomBytes(bytes).toString("hex");
}
