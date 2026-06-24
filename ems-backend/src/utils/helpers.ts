import bcrypt from "bcryptjs";
import { config } from "@/config";
import crypto from "crypto";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, config.bcrypt.rounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function generateTempPassword(length = 10): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function generateEmployeeId(count: number): string {
  return `EMP-${String(count + 1001).padStart(4, "0")}`;
}

export function calcWorkingHours(checkIn: Date, checkOut: Date): number {
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.round((ms / 3600000) * 100) / 100;
}

export function isLate(checkIn: Date, thresholdMinutes = 15): boolean {
  const start = new Date(checkIn);
  start.setHours(9, 0, 0, 0);
  return checkIn.getTime() > start.getTime() + thresholdMinutes * 60 * 1000;
}

export function formatCurrency(amount: number, currency = "BDT"): string {
  return new Intl.NumberFormat("en-BD", { style: "currency", currency }).format(amount);
}

export function getMonthName(month: number, year: number): string {
  return new Date(year, month - 1).toLocaleString("en-US", { month: "long", year: "numeric" });
}
