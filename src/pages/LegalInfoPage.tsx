import type { MouseEvent, ReactNode } from "react";
import { useLayoutEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { ThemeToggle } from "@/components/ui/ThemeToggle";

/**
 * In-page section links on `/legal`: use replace so switching Terms ↔ Privacy
 * does not add history entries (Back leaves the legal page for the prior route).
 */
function LegalHashLink({
	sectionId,
	className,
	children,
}: {
	sectionId: string;
	className?: string;
	children: ReactNode;
}) {
	const navigate = useNavigate();
	const { pathname } = useLocation();

	return (
		<a
			href={`${pathname}#${sectionId}`}
			className={className}
			onClick={(e: MouseEvent<HTMLAnchorElement>) => {
				if (
					e.button !== 0 ||
					e.metaKey ||
					e.altKey ||
					e.ctrlKey ||
					e.shiftKey
				) {
					return;
				}
				e.preventDefault();
				const nextHash = `#${sectionId}`;
				if (window.location.hash === nextHash) {
					document
						.getElementById(sectionId)
						?.scrollIntoView({ behavior: "smooth", block: "start" });
					return;
				}
				navigate({ pathname, hash: nextHash }, { replace: true });
			}}
		>
			{children}
		</a>
	);
}

function useScrollToHash() {
	const location = useLocation();

	useLayoutEffect(() => {
		if (!location.hash) return;
		const id = location.hash.slice(1);
		const el = document.getElementById(id);
		el?.scrollIntoView({ behavior: "smooth", block: "start" });
	}, [location.pathname, location.hash]);
}

const sectionClass =
	"scroll-mt-24 space-y-4 border-b border-tint pb-10 last:border-b-0 last:pb-0";
const h2Class = "text-xl font-bold text-text-primary";
const h3Class = "mt-6 text-base font-semibold text-text-primary";
const pClass = "text-sm leading-relaxed text-text-secondary";
const listClass = "list-disc space-y-2 pl-5 text-sm leading-relaxed text-text-secondary";

export function LegalInfoPage() {
	useScrollToHash();
	const year = new Date().getFullYear();

	return (
		<div className="min-h-dvh bg-background-primary">
			<header className="sticky top-0 z-10 border-b border-tint bg-background-secondary/95 backdrop-blur-sm">
				<div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
					<Link
						to="/"
						className="flex items-center gap-2 text-text-primary"
					>
						<img
							src="/layers.svg"
							alt=""
							width={32}
							height={32}
							className="size-8 shrink-0"
						/>
						<span className="text-lg font-bold tracking-tight">
							Trellix
						</span>
					</Link>
					<div className="flex items-center gap-3">
						<nav
							className="hidden gap-4 text-sm text-text-secondary sm:flex"
							aria-label="On this page"
						>
							<LegalHashLink
								sectionId="terms-of-use"
								className="underline-offset-4 hover:text-text-primary hover:underline"
							>
								Terms
							</LegalHashLink>
							<LegalHashLink
								sectionId="privacy-policy"
								className="underline-offset-4 hover:text-text-primary hover:underline"
							>
								Privacy
							</LegalHashLink>
						</nav>
						<ThemeToggle />
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
				<div className="mb-10 rounded-xl border border-tint bg-background-secondary p-6 shadow-sm sm:p-8">
					<p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
						Legal
					</p>
					<h1 className="mt-2 text-2xl font-bold text-text-primary sm:text-3xl">
						Terms of use &amp; Privacy policy
					</h1>
					<p className={pClass + " mt-3"}>
						These documents describe how you may use Trellix and how
						we handle information when you do. Last updated: April{" "}
						{year}.
					</p>
					<nav
						className="mt-6 flex flex-wrap gap-x-4 gap-y-2 border-t border-tint pt-6 text-sm sm:hidden"
						aria-label="On this page"
					>
						<LegalHashLink
							sectionId="terms-of-use"
							className="text-primary underline-offset-4 hover:underline"
						>
							Terms of use
						</LegalHashLink>
						<LegalHashLink
							sectionId="privacy-policy"
							className="text-primary underline-offset-4 hover:underline"
						>
							Privacy policy
						</LegalHashLink>
					</nav>
				</div>

				<div className="space-y-12">
					<article id="terms-of-use" className={sectionClass}>
						<h2 className={h2Class}>Terms of use</h2>
						<p className={pClass}>
							By accessing or using Trellix (&quot;the Service&quot;),
							you agree to these terms. If you do not agree, do not
							use the Service.
						</p>

						<h3 className={h3Class}>Account and eligibility</h3>
						<p className={pClass}>
							You are responsible for maintaining the confidentiality
							of your credentials and for all activity under your
							account. You must provide accurate registration
							information and be legally able to enter into this
							agreement.
						</p>

						<h3 className={h3Class}>Acceptable use</h3>
						<p className={pClass}>
							You agree not to misuse the Service, including by:
						</p>
						<ul className={listClass}>
							<li>
								Attempting to gain unauthorized access to systems,
								data, or other users&apos; accounts
							</li>
							<li>
								Uploading malware, spam, or content that violates
								applicable law
							</li>
							<li>
								Reverse engineering or scraping the Service except
								where allowed by law
							</li>
							<li>
								Using the Service in a way that could impair
								availability or performance for others
							</li>
						</ul>

						<h3 className={h3Class}>Content and intellectual property</h3>
						<p className={pClass}>
							You retain rights to content you submit. You grant
							Trellix a limited license to host, process, and display
							that content solely to operate the Service. The
							Service&apos;s software, branding, and documentation are
							protected by intellectual property laws.
						</p>

						<h3 className={h3Class}>Disclaimers</h3>
						<p className={pClass}>
							The Service is provided &quot;as is&quot; without
							warranties of any kind, to the fullest extent permitted
							by law. We do not guarantee uninterrupted or error-free
							operation.
						</p>

						<h3 className={h3Class}>Limitation of liability</h3>
						<p className={pClass}>
							To the maximum extent permitted by law, Trellix and its
							contributors will not be liable for indirect,
							incidental, special, consequential, or punitive
							damages, or any loss of profits, data, or goodwill,
							arising from your use of the Service.
						</p>

						<h3 className={h3Class}>Changes and termination</h3>
						<p className={pClass}>
							We may modify these terms or discontinue the Service.
							Material changes will be communicated when reasonable.
							You may stop using the Service at any time; we may
							suspend or terminate access for violations of these
							terms or legal requirements.
						</p>

						<h3 className={h3Class}>Contact</h3>
						<p className={pClass}>
							Questions about these terms can be directed through the
							contact channels provided on the Trellix website or
							application.
						</p>
					</article>

					<article id="privacy-policy" className={sectionClass}>
						<h2 className={h2Class}>Privacy policy</h2>
						<p className={pClass}>
							This policy explains what information we collect when you
							use Trellix, how we use it, and the choices you have.
						</p>

						<h3 className={h3Class}>Information we collect</h3>
						<ul className={listClass}>
							<li>
								<strong className="font-medium text-text-primary">
									Account data:
								</strong>{" "}
								name, email address, and credentials you provide when
								you register or sign in.
							</li>
							<li>
								<strong className="font-medium text-text-primary">
									Usage data:
								</strong>{" "}
								how you interact with the Service, such as features
								used and approximate timestamps, to improve
								reliability and product experience.
							</li>
							<li>
								<strong className="font-medium text-text-primary">
									Technical data:
								</strong>{" "}
								device or browser type, IP address, and diagnostic
								logs when needed for security and operations.
							</li>
						</ul>

						<h3 className={h3Class}>How we use information</h3>
						<p className={pClass}>We use the information above to:</p>
						<ul className={listClass}>
							<li>Provide, secure, and improve the Service</li>
							<li>Authenticate you and maintain your session</li>
							<li>Respond to support requests and legal obligations</li>
							<li>Analyze aggregate usage to guide product decisions</li>
						</ul>

						<h3 className={h3Class}>Sharing</h3>
						<p className={pClass}>
							We do not sell your personal information. We may share
							data with service providers who process it on our behalf
							(e.g. hosting, email), when required by law, or to
							protect rights and safety. Any provider is bound by
							contractual obligations consistent with this policy.
						</p>

						<h3 className={h3Class}>Retention and security</h3>
						<p className={pClass}>
							We retain information only as long as needed for the
							purposes described, unless a longer period is required
							by law. We use industry-standard safeguards; no method
							of transmission or storage is completely secure.
						</p>

						<h3 className={h3Class}>Your choices</h3>
						<p className={pClass}>
							Depending on your region, you may have rights to access,
							correct, delete, or export your personal data, or to
							object to certain processing. Contact us to exercise
							these rights where applicable.
						</p>

						<h3 className={h3Class}>Children</h3>
						<p className={pClass}>
							The Service is not directed at children under the age
							where parental consent is required in your jurisdiction,
							and we do not knowingly collect their personal
							information.
						</p>

						<h3 className={h3Class}>Updates</h3>
						<p className={pClass}>
							We may update this policy from time to time. We will post
							the revised version here and adjust the &quot;last
							updated&quot; date when appropriate.
						</p>
					</article>
				</div>

				<footer className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-tint pt-8 sm:flex-row">
					<p className="text-xs text-text-secondary">
						&copy; Trellix {year}
					</p>
					<Link
						to="/"
						className="text-sm text-primary underline-offset-4 hover:underline"
					>
						Back to home
					</Link>
				</footer>
			</main>
		</div>
	);
}
