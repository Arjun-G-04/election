"use server";

import type { User } from "@prisma/client";
import { protectedFn } from "./protector";

export const getUserDetails = protectedFn(async (user: User) => {
	return user;
});
