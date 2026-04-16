import { MdAddCircleOutline } from "react-icons/md";

import Button from "@/components/ui/Button";

export function CreateProjectCard({ onCreate }: { onCreate: () => void }) {
	return (
		<article className="flex h-[19rem] flex-col items-center justify-center rounded-xl border border-dashed border-primary/35 bg-background-secondary p-4 text-center shadow-sm transition-colors hover:border-primary/40">
			<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-tint">
				<MdAddCircleOutline className="h-10 w-10 text-primary" aria-hidden />
			</div>
			<h3 className="mt-4 text-lg font-semibold text-text-primary">
				Start a new project
			</h3>
			<p className="mt-2 max-w-[18rem] text-sm text-text-secondary">
				Create and organize your next idea in Trellix.
			</p>
			<div className="mt-5 w-full max-w-[11rem]">
				<Button title="Create Project" onClick={onCreate} />
			</div>
		</article>
	);
}
