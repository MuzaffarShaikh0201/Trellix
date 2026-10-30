export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 20;

/** Matches the backend's registration and reset rules. */
export const PASSWORD_RULES = [
	{
		label: `${PASSWORD_MIN}–${PASSWORD_MAX} characters`,
		test: (p: string) => p.length >= PASSWORD_MIN && p.length <= PASSWORD_MAX,
	},
	{ label: "An uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
	{ label: "A number", test: (p: string) => /[0-9]/.test(p) },
	{ label: "A special character (!@#…)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export const PASSWORD_RULES_TEXT = `Use ${PASSWORD_MIN}–${PASSWORD_MAX} characters with an uppercase letter, a number and a special character.`;

/** The first rule the password breaks, or null when it passes them all. */
export function firstFailedRule(password: string) {
	return PASSWORD_RULES.find((r) => !r.test(password)) ?? null;
}
