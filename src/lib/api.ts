import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(error: unknown) {
  if (error instanceof Response) {
    return NextResponse.json({ error: error.statusText || error.status.toString() }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Data yang dikirim belum valid.",
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 422 },
    );
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const maybeCode = (error as { code?: string }).code;
    if (
      maybeCode === "P1001" ||
      message.includes("can't reach database server") ||
      message.includes("database server") ||
      message.includes("connect econnrefused")
    ) {
      return NextResponse.json(
        {
          error:
            "Database belum aktif. Jalankan PostgreSQL lalu migrasi dan seed database sebelum login.",
          setup: ["docker compose up -d", "npm run db:push", "npm run db:seed"],
        },
        { status: 503 },
      );
    }
    if (message.includes("firebase belum dikonfigurasi") || message.includes("could not load the default credentials")) {
      return NextResponse.json(
        {
          error: "Firebase belum dikonfigurasi. Isi service account Firebase di .env lalu jalankan seed Firebase.",
          setup: ["DATA_BACKEND=firebase", "FIREBASE_SERVICE_ACCOUNT_BASE64=...", "npm run firebase:seed"],
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ error: "Terjadi kendala di server." }, { status: 500 });
}

export async function parseJson<T>(request: Request, schema: { parse: (data: unknown) => T }) {
  const body = await request.json().catch(() => ({}));
  return schema.parse(body);
}
