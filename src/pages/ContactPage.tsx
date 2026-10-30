import { LuMail } from "react-icons/lu";

import { Page, PageHeader } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";

export function ContactPage() {
	return (
		<Page width="max-w-3xl">
			<PageHeader
				title="Contact us"
				subtitle="Questions, feedback, or support? Reach out and we’ll get back to you as soon as we can."
			/>
			<Card className="mt-6 p-5">
				<a href="mailto:support@trellix.app" className="group flex items-center gap-3">
					<span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
						<LuMail className="size-5" />
					</span>
					<span>
						<span className="block text-xs text-muted">Email</span>
						<span className="text-sm font-medium text-primary group-hover:underline">support@trellix.app</span>
					</span>
				</a>
			</Card>
		</Page>
	);
}
