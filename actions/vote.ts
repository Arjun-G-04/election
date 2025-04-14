"use server";

import prisma from "@/lib/prisma";
import { protectedFn } from "./protector";

export const checkVoteStatus = protectedFn(async (user) => {
	const vote = await prisma.vote.findUnique({
		where: {
			userId: user.id,
		},
	});

	if (vote) {
		return {
			voteStatus: true,
		};
	}

	return {
		voteStatus: false,
	};
});

export const voteCandidate = protectedFn(
	async (user, candidate1Id, candidate2Id) => {
		const constants = await prisma.constants.findUnique({
			where: {
				id: 1,
			},
		});

		if (!constants) {
			return {
				success: false,
				message: "Constants not found",
			};
		}

		const now = new Date();
		const startTime = constants.startTime;
		const endTime = constants.endTime;

		if (now < startTime) {
			return {
				success: false,
				message: "Election has not started yet",
			};
		}

		if (now > endTime) {
			return {
				success: false,
				message: "Election has ended",
			};
		}

		const existingVote = await prisma.vote.findUnique({
			where: {
				userId: user.id,
			},
		});

		if (existingVote) {
			return {
				success: false,
				message: "You have already voted",
			};
		}

		if (candidate1Id === candidate2Id) {
			return {
				success: false,
				message: "You cannot vote for the same candidates",
			};
		}

		await prisma.vote.create({
			data: {
				userId: user.id,
				candidate1Id: candidate1Id,
				candidate2Id: candidate2Id,
			},
		});

		return {
			success: true,
			message: "Vote cast successfully",
		};
	},
);

export const getVotesCount = protectedFn(async (user) => {
	const vote = await prisma.vote.findUnique({
		where: {
			userId: user.id,
		},
	});

	if (!vote) {
		return {
			success: false,
			message: "You have not voted",
		};
	}

	const candidates = await prisma.candidate.findMany({
		include: {
			votes1: true,
			votes2: true,
		},
		orderBy: {
			name: "asc",
		},
	});

	const filteredCandidatesData = candidates.map((candidate) => ({
		id: candidate.id,
		name: candidate.name,
		votes: candidate.votes1.length + candidate.votes2.length,
	}));

	return {
		success: true,
		candidates: filteredCandidatesData,
	};
});
