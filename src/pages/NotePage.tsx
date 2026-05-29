import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";
import { MdArrowBack, MdPushPin } from "react-icons/md";

import { CustomLoader } from "@/components/ui/CustomLoader";
import { buttonSecondaryClass } from "@/components/ui/buttonStyles";
import { deleteNote, fetchNote, toggleNotePinned } from "@/lib/api/notes";
import { MarkdownContent } from "@/components/note/MarkdownContent";
import { NoteLastUpdated } from "@/components/note/NoteLastUpdated";
import { formatProjectDateTime } from "@/lib/project/formatProjectDate";
import { getRequestErrorMessage } from "@/lib/getRequestErrorMessage";
import { cn } from "@/lib/utils";
import { showAlert } from "@/services/alertService";

export function NotePage() {
	const { noteId } = useParams<{ noteId: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const noteQueryKey = ["note", noteId] as const;

	const {
		data: note,
		isPending,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: noteQueryKey,
		queryFn: () => fetchNote(noteId!),
		enabled: Boolean(noteId),
	});

	const pinMutation = useMutation({
		mutationFn: () => toggleNotePinned(noteId!),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: noteQueryKey });
			await queryClient.invalidateQueries({ queryKey: ["notes"] });
		},
		onError: (err) => {
			showAlert(
				"Could not update pin",
				"error",
				getRequestErrorMessage(
					err,
					"Something went wrong while updating pin status.",
				),
			);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: () => deleteNote(noteId!),
		onSuccess: async () => {
			showAlert("Note deleted", "success", "The note has been removed.");
			await queryClient.invalidateQueries({ queryKey: ["notes"] });
			navigate("/notes");
		},
		onError: (err) => {
			showAlert(
				"Delete failed",
				"error",
				getRequestErrorMessage(
					err,
					"Something went wrong while deleting this note.",
				),
			);
		},
	});

	function handleDelete() {
		const confirmed = window.confirm(
			"Delete this note? This cannot be undone.",
		);
		if (!confirmed) return;
		void deleteMutation.mutate();
	}

	if (!noteId) {
		return (
			<section className="space-y-4">
				<Link
					to="/notes"
					className="inline-flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-primary"
				>
					<MdArrowBack className="h-[18px] w-[18px]" aria-hidden />
					Back to Notes
				</Link>
				<p className="text-sm text-text-secondary">Note not found.</p>
			</section>
		);
	}

	return (
		<section className="flex min-h-0 flex-1 flex-col gap-4">
			<div className="flex items-center justify-between gap-3">
				<Link
					to="/notes"
					className="inline-flex min-w-0 items-center gap-1 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
				>
					<MdArrowBack className="h-[18px] w-[18px] shrink-0" aria-hidden />
					Back to Notes
				</Link>
				{note ? (
					<button
						type="button"
						onClick={() => pinMutation.mutate()}
						disabled={pinMutation.isPending}
						className={cn(
							"shrink-0 rounded-md p-1 text-text-secondary transition-colors hover:text-primary",
							note.is_pinned && "text-primary",
							pinMutation.isPending && "cursor-wait opacity-60",
						)}
						aria-label={note.is_pinned ? "Unpin note" : "Pin note"}
					>
						<MdPushPin
							className={cn(
								"h-[18px] w-[18px]",
								note.is_pinned && "rotate-45",
							)}
							aria-hidden
						/>
					</button>
				) : null}
			</div>

			{isPending ? (
				<div className="flex items-center justify-center py-16">
					<CustomLoader size={32} aria-label="Loading note" />
				</div>
			) : isError ? (
				<div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
					<p className="text-sm font-medium text-red-600 dark:text-red-400">
						Could not load note
					</p>
					<p className="mt-1 text-sm text-text-secondary">
						{getRequestErrorMessage(
							error,
							"Something went wrong while loading this note.",
						)}
					</p>
					<button
						type="button"
						onClick={() => void refetch()}
						className={cn("mt-3", buttonSecondaryClass())}
					>
						Try again
					</button>
				</div>
			) : note ? (
				<>
					<header>
						<h1 className="text-2xl font-bold text-text-primary">
							{note.title}
						</h1>
						<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary">
							{note.project ? (
								<Link
									to={`/projects/${note.project.id}`}
									className="font-medium text-primary hover:text-primary/80"
								>
									{note.project.title}
								</Link>
							) : (
								<span>Personal note</span>
							)}
							<span aria-hidden>·</span>
							<span>
								Created{" "}
								<time dateTime={note.created_at}>
									{formatProjectDateTime(note.created_at)}
								</time>
							</span>
							<span aria-hidden>·</span>
							<NoteLastUpdated updatedAt={note.updated_at} inline />
						</div>
					</header>

					<div
						className={cn(
							"rounded-xl border border-primary/10 bg-background-secondary p-4 sm:p-5",
						)}
					>
						{note.content?.trim() ? (
							<MarkdownContent content={note.content} />
						) : (
							<p className="text-sm text-text-secondary">No content.</p>
						)}
					</div>

					<div className="flex flex-wrap gap-2">
						<button
							type="button"
							onClick={handleDelete}
							disabled={deleteMutation.isPending}
							className={cn(
								buttonSecondaryClass(),
								"text-red-500 hover:bg-red-500/10 dark:text-red-400",
							)}
						>
							Delete note
						</button>
					</div>
				</>
			) : null}
		</section>
	);
}
