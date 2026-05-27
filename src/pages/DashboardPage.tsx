import { DashboardRecentProjectsTable } from "@/components/dashboard/DashboardRecentProjectsTable";
import { useDashboardHistoryReset } from "@/hooks/useDashboardHistoryReset";

export function DashboardPage() {
	useDashboardHistoryReset();

	return (
		<section className="flex flex-col items-start gap-6">
			<header className="max-w-2xl">
				<h1 className="text-2xl font-bold text-text-primary">
					Dashboard
				</h1>
				<p className="mt-1 text-sm text-text-secondary">
					Get a complete overview of your projects, activities, and
					key insights in one place.
				</p>
			</header>

			<DashboardRecentProjectsTable />
		</section>
	);
}
