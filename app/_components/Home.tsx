"use client";

import { getUserDetails } from "@/actions/user";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
	const user = useQuery({
		queryKey: ["get", "user", "details"],
		queryFn: async () => {
			return await getUserDetails();
		},
	});

	if (user.status === "pending") {
		return <div>Loading...</div>;
	}

	if (user.status === "error") {
		return <div>Error: {user.error.message}</div>;
	}

	if (user.data === false) {
		return <div>Not authenticated</div>;
	}

	return (
		<div className="flex flex-col justify-center items-start">
			<div className="text-2xl">
				Welcome <strong>{user.data.name}</strong>,
			</div>
			<div className="text-lg">
				Your Voter ID is{" "}
				<strong>{user.data.voterId.toUpperCase()}</strong>
			</div>
		</div>
	);
}
