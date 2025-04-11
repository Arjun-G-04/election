"use server";

import { User } from "@/generated/prisma";
import { protectedFn } from "./protector";

export const getUserDetails = protectedFn(async (user: User) => {
	return user;
});
