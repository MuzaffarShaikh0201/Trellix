import { DashboardRecentProjectsTable } from "@/components/dashboard/DashboardRecentProjectsTable";
import { useDashboardHistoryReset } from "@/hooks/useDashboardHistoryReset";

export function DashboardPage() {
	useDashboardHistoryReset();

	return (
		<section className="flex flex-col items-start gap-6">
			<header className="max-w-2xl">
				<h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
				<p className="mt-1 text-sm leading-relaxed text-text-secondary">
					See your most recently updated projects, then jump into details or
					open the full list to manage everything in one place.
				</p>
			</header>

			<DashboardRecentProjectsTable />
		</section>
	);
}
