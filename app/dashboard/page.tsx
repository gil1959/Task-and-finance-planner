export const revalidate = 0;
export const dynamic = "force-dynamic";

import DashboardClient from "./_client";

export default function DashboardPage() {
    return <DashboardClient />;
}