"use client";

import { getConstants } from "@/actions/candidate";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

function formatTime(time: number) {
	const hours = Math.floor(time / (1000 * 60 * 60));
	const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((time % (1000 * 60)) / 1000);

	const formattedTime = `${String(hours).padStart(2, "0")}h ${String(
		minutes,
	).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
	return formattedTime;
}

export default function Countdown() {
	const [startTime, setStartTime] = useState("--h --m --s");
	const [endTime, setEndTime] = useState("--h --m --s");

	const constants = useQuery({
		queryKey: ["get", "constants"],
		queryFn: async () => {
			return await getConstants();
		},
	});

	useEffect(() => {
		const intervalId = setInterval(() => {
			const now = new Date();
			if (constants.data === false) return;
			if (constants.data?.constants === undefined) return;
			const startDifference =
				constants.data.constants.startTime.getTime() - now.getTime();
			const endDifference =
				constants.data.constants.endTime.getTime() - now.getTime();

			if (startDifference <= 0) {
				setStartTime("");
			} else {
				setStartTime(formatTime(startDifference));
			}

			if (endDifference <= 0) {
				setEndTime("");
			} else {
				setEndTime(formatTime(endDifference));
			}

			if (startDifference <= 0 && endDifference <= 0) {
				clearInterval(intervalId);
			}
		}, 1000);

		return () => clearInterval(intervalId);
	}, [constants.data]);

	if (constants.status === "pending") {
		return <div>Loading...</div>;
	}

	if (constants.status === "error") {
		return <div>Error: {constants.error.message}</div>;
	}

	if (constants.data === false) {
		return <div>Not authenticated</div>;
	}

	if (constants.data.success === false || !constants.data.constants) {
		return <div>Error: {constants.data.message}</div>;
	}

	return (
		<>
			{constants.data.constants.startTime >= new Date() && (
				<div className="mt-5 text-left">
					The election starts in{" "}
					<span className="text-lg font-bold">{startTime}</span>
				</div>
			)}
			{constants.data.constants.startTime <= new Date() &&
				new Date() <= constants.data.constants.endTime && (
					<>
						<div className="mt-5 text-left">
							The election is{" "}
							<span className="text-xl font-extrabold text-red-500 animate-pulse">
								LIVE
							</span>
						</div>
						<div className=" text-left">
							The election ends in{" "}
							<span className="text-lg font-bold">{endTime}</span>
						</div>
					</>
				)}
			{constants.data.constants.endTime < new Date() && (
				<div className="mt-5 text-left">The election has ended</div>
			)}
		</>
	);
}
