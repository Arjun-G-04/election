"use server";

import prisma from "@/lib/prisma";
import { protectedFn } from "./protector";

export const getConstants = protectedFn(async () => {
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

	return {
		success: true,
		constants,
	};
});

export const getCandidates = protectedFn(async () => {
	const candidates = await prisma.candidate.findMany({
		orderBy: {
			name: "asc",
		},
	});

	return candidates;
});
