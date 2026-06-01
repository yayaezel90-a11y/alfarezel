import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardShell, adminNav } from "@/components/dashboard-shell";
import { AdminSectionContent, adminSectionSlugs, adminSections } from "@/lib/admin-pages";
import { isFirebaseBackend } from "@/lib/firebase-admin";
import { firebaseAdminCollection } from "@/lib/firebase-store";

export function generateStaticParams() {
  return adminSectionSlugs.map((section) => ({ section }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  const config = adminSections[section];
  return {
    title: config?.title ?? "Admin",
    description: config?.subtitle,
  };
}

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const config = adminSections[section];
  if (!config) notFound();
  const records = isFirebaseBackend() ? await firebaseAdminCollection(config.collection).catch(() => []) : [];

  return (
    <DashboardShell title={config.title} subtitle={config.subtitle} roleLabel="Super Admin" nav={adminNav(config.slug)}>
      <AdminSectionContent section={config} records={records} />
    </DashboardShell>
  );
}
