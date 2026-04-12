export function ContactPage() {
	return (
		<div>
			<h1 className="text-2xl font-bold text-text-primary">Contact us</h1>
			<p className="mt-2 text-sm text-text-secondary">
				Questions, feedback, or support? Reach out and we will get back to
				you as soon as we can.
			</p>
			<dl className="mt-8 space-y-6 text-sm">
				<div>
					<dt className="font-medium text-text-primary">Email</dt>
					<dd className="mt-1 text-text-secondary">
						<a
							href="mailto:support@trellix.app"
							className="text-primary underline-offset-4 hover:underline"
						>
							support@trellix.app
						</a>
					</dd>
				</div>
			</dl>
		</div>
	);
}
