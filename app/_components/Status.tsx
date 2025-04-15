import { getVotesCount } from "@/actions/vote";
import { useQuery } from "@tanstack/react-query";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
);

export const options = {
	indexAxis: "y" as const,
	responsive: true,
	plugins: {
		legend: {
			position: "top" as const,
		},
		title: {
			display: true,
			text: "CR Election Sem VII",
		},
	},
};

export default function Status() {
	const voteCount = useQuery({
		queryFn: async () => {
			return await getVotesCount();
		},
		queryKey: ["get", "votes", "count"],
		refetchInterval: 1000 * 2,
	});

	if (voteCount.status === "pending") {
		return <div>Loading...</div>;
	}

	if (voteCount.status === "error") {
		return <div>Error: {voteCount.error.message}</div>;
	}

	if (voteCount.data === false) {
		return <div>Not authenticated</div>;
	}

	if (voteCount.data.success === false || !voteCount.data.candidates) {
		return <div>Error: {voteCount.data.message}</div>;
	}

	return (
		<>
			<div>
				Turnout:{" "}
				<span className="font-bold text-xl">
					{(
						(voteCount.data.candidates
							.map((cand) => cand.votes)
							.reduce((prev, curr) => prev + curr, 0) /
							(69*2)) *
						100
					).toFixed(2)}
					%
				</span>
			</div>
			<div className="basis-0 grow mb-5 overflow-auto">
				<Bar
					options={options}
					data={{
						labels: voteCount.data.candidates.map(
							(candidate) => candidate.name,
						),
						datasets: [
							{
								label: "Votes",
								data: voteCount.data.candidates.map(
									(candidate) => candidate.votes,
								),
								backgroundColor: "rgba(255, 99, 132, 0.5)",
							},
						],
					}}
				/>
			</div>
		</>
	);
}
