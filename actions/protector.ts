import type { User } from "@prisma/client";
import { checkAuth } from "./auth";
import prisma from "@/lib/prisma";

export function protectedFn<
	// biome-ignore lint: we are using this as a wrapper, so it must allow any generic function
	T extends (user: User, ...args: any[]) => any,
	// biome-ignore lint: we are using this as a wrapper, so it must allow any generic function
	A extends Parameters<T> extends [User, ...infer Rest] ? Rest : any[],
	R extends ReturnType<T>,
>(fn: T): (...args: A) => Promise<R | false> {
	return async (...args: A) => {
		const authStatus = await checkAuth();
		if (authStatus === false) return false;
		const user = await prisma.user.findUnique({
			where: {
				email: authStatus.email,
			},
		});
		if (!user) return false;
		return fn(user, ...args);
	};
}
