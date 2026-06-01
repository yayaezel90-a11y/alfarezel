import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { firebaseDb, isFirebaseBackend } from "@/lib/firebase-admin";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!isFirebaseBackend()) throw new Error("Upload hanya tersedia di mode Firebase.");
    const { id } = await params;
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error("File upload tidak valid.");

    const snapshot = await firebaseDb().collection("uploaded_files").doc(id).get();
    if (!snapshot.exists) throw new Error("File tidak ditemukan.");
    const file = snapshot.data() as { contentType?: string; dataBase64?: string };
    if (!file.dataBase64) throw new Error("File tidak valid.");

    return new NextResponse(Buffer.from(file.dataBase64, "base64"), {
      headers: {
        "content-type": file.contentType ?? "application/octet-stream",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
