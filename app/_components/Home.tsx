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

	if (user.data == false) {
		return <div>Not authenticated</div>;
	}

	return (
		<div>
			<div>Welcome {user.data.name}</div>
			<div>Your email is {user.data.email}</div>
			<div>Your voter id is {user.data.voterId}</div>
		</div>
	);
}
