import { getCandidates } from "@/actions/candidate";
import { voteCandidate } from "@/actions/vote";
import { queryClient } from "@/utils/providers";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Candidates() {
	const [selections, setSelections] = useState<string[]>([]);
	const [confirmDialog, setConfirmDialog] = useState(false);

	const handleOnClick = (candidate: string) => {
		if (selections.includes(candidate)) {
			setSelections((prev) => prev.filter((item) => item !== candidate));
			return;
		}

		if (selections.length < 2) {
			setSelections((prev) => [...prev, candidate]);
		}
	};

	const candidates = useQuery({
		queryKey: ["get", "candidates"],
		queryFn: async () => {
			return await getCandidates();
		},
	});

	const castVote = useMutation({
		mutationFn: async (data: {
			candidate1Id: string;
			candidate2Id: string;
		}) => {
			return await voteCandidate(data.candidate1Id, data.candidate2Id);
		},
		onSuccess: (data) => {
			if (data === false) {
				toast.error("Not authenticated");
				setSelections([]);
				setConfirmDialog(false);
				return;
			}

			if (data.success === false) {
				toast.error(data.message);
				setSelections([]);
				setConfirmDialog(false);
				return;
			}

			toast.success("Vote cast successfully");
			setSelections([]);
			setConfirmDialog(false);
			queryClient.invalidateQueries({
				queryKey: ["check", "vote", "status"],
			});
		},
		onError: (error) => {
			toast.error("Error casting vote");
			console.error(error);
			setSelections([]);
			setConfirmDialog(false);
		},
	});

	if (candidates.status === "pending") {
		return <div>Loading...</div>;
	}

	if (candidates.status === "error") {
		return <div>Error: {candidates.error.message}</div>;
	}

	if (candidates.data === false) {
		return <div>Not authenticated</div>;
	}

	return (
		<div className="flex flex-col justify-center items-start h-full w-full">
			<div className="font-bold text-2xl mt-5">Ballot</div>
			<div className="italic text-left">
				Select your 2 preferred candidates for representing the class in
				7th Sem. The cast button is at the end of the candidates list.
			</div>
			<div className="flex flex-row flex-wrap grow basis-0 w-full overflow-y-auto justify-around py-5">
				{candidates.data.map((candidate) => {
					return (
						<div
							onClick={() => handleOnClick(candidate.id)}
							onKeyDown={() => handleOnClick(candidate.id)}
							key={candidate.name}
							className={`flex flex-col justify-center items-center h-1/2 hover:cursor-pointer transition-all ease-in-out duration-500 ${selections.includes(candidate.id) ? "border-4 border-red-500 rounded-md scale-105 shadow-2xl" : ""}`}
						>
							<img
								src={`/${candidate.photo}`}
								alt={candidate.name}
								className="h-[90%] aspect-square object-cover"
							/>
							<p>{candidate.name}</p>
						</div>
					);
				})}
				{selections.length === 2 && (
					<div className="w-full">
						<button
							onClick={() => {
								setConfirmDialog(true);
							}}
							type="submit"
							className="mx-auto mt-5 px-5 py-2 hover:cursor-pointer bg-blue-300 text-blue-900 rounded-md font-bold"
						>
							Cast your vote
						</button>
					</div>
				)}
			</div>
			{confirmDialog && (
				<div className="fixed p-5 top-0 left-0 w-full h-full bg-black/70 flex justify-center items-center">
					<div className="bg-white px-10 py-5 rounded-md flex flex-col">
						<p>
							Are you sure you want to cast your vote for{" "}
							<strong>
								{
									candidates.data
										.filter((candidate) =>
											selections.includes(candidate.id),
										)
										.map((candidate) => candidate.name)[0]
								}
							</strong>{" "}
							and{" "}
							<strong>
								{
									candidates.data
										.filter((candidate) =>
											selections.includes(candidate.id),
										)
										.map((candidate) => candidate.name)[1]
								}
							</strong>
							?
						</p>
						<button
							onClick={() => {
								if (castVote.isPending) return;
								castVote.mutate({
									candidate1Id: selections[0],
									candidate2Id: selections[1],
								});
							}}
							type="button"
							className="w-24 mx-auto mt-2 bg-green-300 text-green-900 rounded-md font-bold hover:cursor-pointer py-2"
						>
							{castVote.isPending ? "Casting..." : "Confirm"}
						</button>
						<button
							onClick={() => {
								setConfirmDialog(false);
							}}
							type="button"
							className="w-24 mx-auto mt-2 bg-red-300 text-red-900 rounded-md font-bold hover:cursor-pointer py-2"
						>
							Cancel
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
