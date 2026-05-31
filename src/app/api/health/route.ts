import { ok } from "@/lib/api";

export async function GET() {
  return ok({
    status: "ok",
    service: "Alfarezel Market",
    realtime: "socket.io",
    timestamp: new Date().toISOString(),
  });
}
