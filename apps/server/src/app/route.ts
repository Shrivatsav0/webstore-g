import { NextResponse } from "next/server";
import { appRouter } from "@/routers";

export async function GET() {
  // Aggregate health based on presence of `health` procedures only
  const services: Record<string, string> = {};
  const entries = Object.entries(appRouter as Record<string, any>);
  for (const [key, value] of entries) {
    if (value && Object.prototype.hasOwnProperty.call(value, "health")) {
      services[key] = "ok";
    }
  }

  // Include top-level healthCheck similar to current behavior
  services["healthCheck"] = "OK";

  return NextResponse.json({ status: "ok", services });
}
