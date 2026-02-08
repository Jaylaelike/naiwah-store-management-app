import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { handleSignOut } from "@/app/actions/auth";

import { getFilterOptions } from "@/app/analytics/actions";
import AnalyticsClientPage from "@/app/analytics/AnalyticsClientPage";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const resolvedParams = await searchParams;
  const startDate = resolvedParams.startDate as string;
  const endDate = resolvedParams.endDate as string;
  const site = resolvedParams.site as string;
  const facilityProvider = resolvedParams.facilityProvider as string;
  const engineeringCenter = resolvedParams.engineeringCenter as string;

  const where: any = {};

  if (startDate && endDate) {
    where.DowntimeStart = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  if (site) {
    where.Site = site;
  }

  if (facilityProvider) {
    where.FacilityProvider = facilityProvider;
  }

  if (engineeringCenter) {
    where.EngineeringCenter = engineeringCenter;
  }

  const [data, filterOptions] = await Promise.all([
    prisma.mainDb.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 2000, // Increased limit for filtered reports
    }),
    getFilterOptions(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <header className="border-b border-border/50 bg-white/80 dark:bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg glow-orange">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <h1 className="text-2xl font-bold text-gradient-orange">NOC Downtime Report</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground px-3 py-1.5 rounded-full bg-secondary/50">
              👋 Welcome,{" "}
              {session.user.role === "ADMIN" || session.user.role === "admin" ? (
                <Link href="/admin" className="font-medium text-foreground hover:underline cursor-pointer">
                  {session.user.name}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{session.user.name}</span>
              )}
            </span>
            <form action={handleSignOut}>
              <Button variant="outline" size="sm" className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Analytics Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Analytics Dashboard</h2>
              <p className="text-sm text-muted-foreground">Real-time system performance and downtime insights</p>
            </div>
            <Link href="/create">
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 glow-orange">
                <span className="mr-2">+</span> เพิ่มข้อมูลใหม่
              </Button>
            </Link>
          </div>
          <AnalyticsClientPage filterOptions={filterOptions} />
        </section>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Downtime Records</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage and track network downtime incidents</p>
          </div>
        </div>
        <div className="bg-card rounded-xl shadow-lg border border-border/50 overflow-hidden">
          <DataTable data={data} />
        </div>
      </main>
    </div>
  );
}

