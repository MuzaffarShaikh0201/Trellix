import { formatProjectDateTime } from "@/lib/project/formatProjectDate";

type ProjectTimestampsMetaProps = {
	createdAt: string;
};

export function ProjectTimestampsMeta({ createdAt }: ProjectTimestampsMetaProps) {
	return (
		<p className="mt-1 text-sm text-text-secondary">
			Created on{" "}
			<time dateTime={createdAt} className="text-text-primary">
				{formatProjectDateTime(createdAt)}
			</time>
		</p>
	);
}
