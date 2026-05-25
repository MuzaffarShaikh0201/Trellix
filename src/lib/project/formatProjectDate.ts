/** Formats API timestamps for display (e.g. 24/May/2026 2:36 AM). */
export function formatProjectDateTime(value: string): string {
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return value;
	const day = String(d.getDate()).padStart(2, "0");
	const month = d.toLocaleString(undefined, { month: "short" });
	const year = d.getFullYear();
	const time = d.toLocaleString(undefined, {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
	return `${day}/${month}/${year} ${time}`;
}
