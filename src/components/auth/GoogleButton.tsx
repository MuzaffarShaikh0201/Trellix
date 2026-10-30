import googleLogo from "@/assets/google.svg";
import { buttonSecondaryClass } from "@/components/ui/buttonStyles";
import { showAlert } from "@/services/alertService";

export function GoogleButton({ disabled }: { disabled?: boolean }) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={() =>
				showAlert(
					"Coming soon",
					"info",
					"Google sign-in isn’t available yet.",
				)
			}
			aria-label="Continue with Google"
			className={buttonSecondaryClass("w-full py-2.5")}
		>
			Continue with
			<img src={googleLogo} alt="" className="h-5 w-auto" />
		</button>
	);
}

export function OrDivider() {
	return (
		<div className="my-6 flex items-center gap-3 text-[11px] tracking-wider text-muted uppercase">
			<span className="h-px flex-1 bg-line" />
			or
			<span className="h-px flex-1 bg-line" />
		</div>
	);
}
