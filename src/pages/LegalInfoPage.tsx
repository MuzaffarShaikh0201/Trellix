import { useEffect, useLayoutEffect, useState, type MouseEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { LuArrowLeft, LuFileText, LuShield } from "react-icons/lu";

import { AppBrand } from "@/components/layout/AppBrand";
import { buttonGhostClass } from "@/components/ui/buttonStyles";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

/** Update this when the text below changes. */
const LAST_UPDATED = "April 2026";

type Section = { id: string; title: string; body: ReactNode };
type Doc = { id: string; title: string; icon: ReactNode; intro: ReactNode; sections: Section[] };

const p = "text-sm leading-relaxed text-muted";
const list = "list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted marker:text-muted/60";
const strong = "font-medium text-fg";

const DOCS: Doc[] = [
	{
		id: "terms-of-use",
		title: "Terms of use",
		icon: <LuFileText />,
		intro: (
			<>
				By accessing or using Trellix (&quot;the Service&quot;), you agree to these terms. If you do not agree,
				do not use the Service.
			</>
		),
		sections: [
			{
				id: "terms-account",
				title: "Account and eligibility",
				body: (
					<p className={p}>
						You are responsible for maintaining the confidentiality of your credentials and for all activity
						under your account. You must provide accurate registration information and be legally able to
						enter into this agreement.
					</p>
				),
			},
			{
				id: "terms-acceptable-use",
				title: "Acceptable use",
				body: (
					<>
						<p className={p}>You agree not to misuse the Service, including by:</p>
						<ul className={list}>
							<li>Attempting to gain unauthorized access to systems, data, or other users&apos; accounts</li>
							<li>Uploading malware, spam, or content that violates applicable law</li>
							<li>Reverse engineering or scraping the Service except where allowed by law</li>
							<li>Using the Service in a way that could impair availability or performance for others</li>
						</ul>
					</>
				),
			},
			{
				id: "terms-content",
				title: "Content and intellectual property",
				body: (
					<p className={p}>
						You retain rights to content you submit. You grant Trellix a limited license to host, process,
						and display that content solely to operate the Service. The Service&apos;s software, branding,
						and documentation are protected by intellectual property laws.
					</p>
				),
			},
			{
				id: "terms-disclaimers",
				title: "Disclaimers",
				body: (
					<p className={p}>
						The Service is provided &quot;as is&quot; without warranties of any kind, to the fullest extent
						permitted by law. We do not guarantee uninterrupted or error-free operation.
					</p>
				),
			},
			{
				id: "terms-liability",
				title: "Limitation of liability",
				body: (
					<p className={p}>
						To the maximum extent permitted by law, Trellix and its contributors will not be liable for
						indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data,
						or goodwill, arising from your use of the Service.
					</p>
				),
			},
			{
				id: "terms-changes",
				title: "Changes and termination",
				body: (
					<p className={p}>
						We may modify these terms or discontinue the Service. Material changes will be communicated when
						reasonable. You may stop using the Service at any time; we may suspend or terminate access for
						violations of these terms or legal requirements.
					</p>
				),
			},
			{
				id: "terms-contact",
				title: "Contact",
				body: (
					<p className={p}>
						Questions about these terms can be directed through the contact channels provided on the Trellix
						website or application.
					</p>
				),
			},
		],
	},
	{
		id: "privacy-policy",
		title: "Privacy policy",
		icon: <LuShield />,
		intro: <>This policy explains what information we collect when you use Trellix, how we use it, and the choices you have.</>,
		sections: [
			{
				id: "privacy-collect",
				title: "Information we collect",
				body: (
					<ul className={list}>
						<li>
							<strong className={strong}>Account data:</strong> name, email address, and credentials you
							provide when you register or sign in.
						</li>
						<li>
							<strong className={strong}>Usage data:</strong> how you interact with the Service, such as
							features used and approximate timestamps, to improve reliability and product experience.
						</li>
						<li>
							<strong className={strong}>Technical data:</strong> device or browser type, IP address, and
							diagnostic logs when needed for security and operations.
						</li>
					</ul>
				),
			},
			{
				id: "privacy-use",
				title: "How we use information",
				body: (
					<>
						<p className={p}>We use the information above to:</p>
						<ul className={list}>
							<li>Provide, secure, and improve the Service</li>
							<li>Authenticate you and maintain your session</li>
							<li>Respond to support requests and legal obligations</li>
							<li>Analyze aggregate usage to guide product decisions</li>
						</ul>
					</>
				),
			},
			{
				id: "privacy-sharing",
				title: "Sharing",
				body: (
					<p className={p}>
						We do not sell your personal information. We may share data with service providers who process it
						on our behalf (e.g. hosting, email), when required by law, or to protect rights and safety. Any
						provider is bound by contractual obligations consistent with this policy.
					</p>
				),
			},
			{
				id: "privacy-retention",
				title: "Retention and security",
				body: (
					<p className={p}>
						We retain information only as long as needed for the purposes described, unless a longer period is
						required by law. We use industry-standard safeguards; no method of transmission or storage is
						completely secure.
					</p>
				),
			},
			{
				id: "privacy-choices",
				title: "Your choices",
				body: (
					<p className={p}>
						Depending on your region, you may have rights to access, correct, delete, or export your personal
						data, or to object to certain processing. Contact us to exercise these rights where applicable.
					</p>
				),
			},
			{
				id: "privacy-children",
				title: "Children",
				body: (
					<p className={p}>
						The Service is not directed at children under the age where parental consent is required in your
						jurisdiction, and we do not knowingly collect their personal information.
					</p>
				),
			},
			{
				id: "privacy-updates",
				title: "Updates",
				body: (
					<p className={p}>
						We may update this policy from time to time. We will post the revised version here and adjust the
						&quot;last updated&quot; date when appropriate.
					</p>
				),
			},
		],
	},
];

const ALL_IDS = DOCS.flatMap((d) => [d.id, ...d.sections.map((s) => s.id)]);

/**
 * In-page links: replace history so jumping between sections doesn't add
 * entries (Back leaves the legal page for the previous route).
 */
function HashLink({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	return (
		<a
			href={`${pathname}#${id}`}
			className={className}
			onClick={(e: MouseEvent<HTMLAnchorElement>) => {
				if (e.button !== 0 || e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;
				e.preventDefault();
				if (window.location.hash === `#${id}`) {
					document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
					return;
				}
				navigate({ pathname, hash: `#${id}` }, { replace: true });
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
		document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
	}, [location.pathname, location.hash]);
}

/** Id of the section currently near the top of the viewport. */
function useActiveSection() {
	const [active, setActive] = useState(ALL_IDS[0]);
	useEffect(() => {
		const els = ALL_IDS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible[0]) setActive(visible[0].target.id);
			},
			{ rootMargin: "-80px 0px -65% 0px" },
		);
		els.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	}, []);
	return active;
}

export function LegalInfoPage() {
	useScrollToHash();
	const active = useActiveSection();
	const navigate = useNavigate();
	const year = new Date().getFullYear();
	const activeDoc = DOCS.find((d) => d.id === active || d.sections.some((s) => s.id === active)) ?? DOCS[0];

	return (
		<div className="min-h-dvh bg-bg">
			<header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
				<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
					<AppBrand />
					<div className="flex items-center gap-1">
						<button type="button" onClick={() => navigate(-1)} className={buttonGhostClass("max-sm:hidden")}>
							<LuArrowLeft className="size-4" />
							Back
						</button>
						<ThemeToggle />
					</div>
				</div>
				{/* Mobile: switch between the two documents. */}
				<nav aria-label="Documents" className="flex gap-1 px-4 pb-2 lg:hidden">
					{DOCS.map((d) => (
						<HashLink
							key={d.id}
							id={d.id}
							className={cn(
								"flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition [&>svg]:size-3.5",
								activeDoc.id === d.id ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface-2",
							)}
						>
							{d.icon}
							{d.title}
						</HashLink>
					))}
				</nav>
			</header>

			<div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 md:px-8 lg:grid-cols-[15rem_1fr] lg:py-12">
				<aside className="hidden lg:block">
					<nav aria-label="On this page" className="sticky top-24 space-y-6">
						{DOCS.map((d) => (
							<div key={d.id}>
								<HashLink
									id={d.id}
									className={cn(
										"flex items-center gap-2 text-sm font-semibold transition [&>svg]:size-4",
										activeDoc.id === d.id ? "text-fg" : "text-muted hover:text-fg",
									)}
								>
									{d.icon}
									{d.title}
								</HashLink>
								<ul className="mt-2 space-y-0.5 border-l border-line">
									{d.sections.map((s) => (
										<li key={s.id}>
											<HashLink
												id={s.id}
												className={cn(
													"-ml-px block border-l-2 py-1 pl-3 text-[13px] transition",
													active === s.id
														? "border-primary font-medium text-primary"
														: "border-transparent text-muted hover:text-fg",
												)}
											>
												{s.title}
											</HashLink>
										</li>
									))}
								</ul>
							</div>
						))}
					</nav>
				</aside>

				<main className="min-w-0 max-w-3xl">
					<p className="text-xs font-medium tracking-wider text-muted uppercase">Legal</p>
					<h1 className="mt-2 text-3xl font-semibold tracking-tight">Terms of use &amp; Privacy policy</h1>
					<p className={cn(p, "mt-3")}>
						These documents describe how you may use Trellix and how we handle information when you do.
					</p>
					<p className="mt-3 inline-flex rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted">
						Last updated {LAST_UPDATED}
					</p>

					<div className="mt-10 space-y-14">
						{DOCS.map((d) => (
							<article key={d.id} id={d.id} className="scroll-mt-28 lg:scroll-mt-24">
								<div className="flex items-center gap-3">
									<span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary [&>svg]:size-4.5">
										{d.icon}
									</span>
									<h2 className="text-xl font-semibold tracking-tight">{d.title}</h2>
								</div>
								<p className={cn(p, "mt-4")}>{d.intro}</p>
								<div className="mt-6 divide-y divide-line rounded-xl border border-line bg-surface">
									{d.sections.map((s) => (
										<section key={s.id} id={s.id} className="scroll-mt-28 space-y-3 p-5 lg:scroll-mt-24">
											<h3 className="text-[15px] font-semibold">{s.title}</h3>
											{s.body}
										</section>
									))}
								</div>
							</article>
						))}
					</div>

					<footer className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-line pt-8 sm:flex-row">
						<p className="text-xs text-muted">© Trellix {year}</p>
						<div className="flex gap-4 text-sm">
							<Link to="/contact" className="text-muted hover:text-fg">
								Contact us
							</Link>
							<Link to="/" className="text-primary hover:underline">
								Back to Trellix
							</Link>
						</div>
					</footer>
				</main>
			</div>
		</div>
	);
}
