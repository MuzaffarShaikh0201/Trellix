import { MdAddCircleOutline } from "react-icons/md";

import Button from "@/components/ui/Button";

export function CreateProjectCard({ onCreate }: { onCreate: () => void }) {
	return (
		<article className="flex h-[27rem] flex-col items-center justify-center rounded-xl border border-dashed border-primary/35 bg-background-secondary p-5 text-center shadow-sm">
			<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-tint">
				<MdAddCircleOutline className="h-10 w-10 text-primary" aria-hidden />
			</div>
			<h3 className="mt-4 text-lg font-semibold text-text-primary">
				Start a new project
			</h3>
			<p className="mt-2 text-sm text-text-secondary">
				Create and organize your next idea in Trellix.
			</p>
			<div className="mt-5 w-full max-w-[11rem]">
				<Button title="Create Project" onClick={onCreate} />
			</div>
		</article>
	);
}
