"use client";

import { checkVoteStatus } from "@/actions/vote";
import { useQuery } from "@tanstack/react-query";
import Candidates from "./Candidates";
import Status from "./Status";

export default function Election() {
	const voteStatus = useQuery({
		queryKey: ["check", "vote", "status"],
		queryFn: async () => {
			return await checkVoteStatus();
		},
	});

	if (voteStatus.status === "pending") {
		return <div>Loading...</div>;
	}

	if (voteStatus.status === "error") {
		return <div>Error: {voteStatus.error.message}</div>;
	}

	if (voteStatus.data === false) {
		return <div>Not authenticated</div>;
	}

	if (voteStatus.data.voteStatus) {
		return (
			<div className="mt-5 flex flex-col h-full w-full text-left">
				<div>
					Thank you for participating in CR Election Sem VII, Your
					vote has been cast!!!
				</div>
				<div className="mt-5 text-2xl font-bold">Election Status</div>
				<Status />
			</div>
		);
	}

	return (
		<>
			<Candidates />
		</>
	);
}
