import { LuCheck } from "react-icons/lu";

import { PASSWORD_RULES } from "@/lib/auth/passwordRules";
import { cn } from "@/lib/utils";

const STRENGTH = ["bg-red-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500"];

/** Strength bar plus a live checklist of the password rules. */
export function PasswordChecklist({ password }: { password: string }) {
	const passed = PASSWORD_RULES.map((r) => r.test(password));
	const score = passed.filter(Boolean).length;
	return (
		<div className="mt-2">
			<div className="flex gap-1" aria-hidden>
				{passed.map((ok, i) => (
					<span key={i} className={cn("h-1 flex-1 rounded-full transition-colors", ok ? STRENGTH[score - 1] : "bg-line")} />
				))}
			</div>
			<ul className="mt-2 space-y-0.5">
				{PASSWORD_RULES.map((r, i) => (
					<li
						key={r.label}
						className={cn(
							"flex items-center gap-1.5 text-[11px] transition-colors",
							passed[i] ? "text-emerald-600 dark:text-emerald-400" : "text-muted",
						)}
					>
						<LuCheck className={cn("size-3", !passed[i] && "opacity-30")} />
						{r.label}
					</li>
				))}
			</ul>
		</div>
	);
}
