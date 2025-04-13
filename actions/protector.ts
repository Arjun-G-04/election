import { User } from "@prisma/client";
import { checkAuth } from "./auth";
import prisma from "@/lib/prisma";

export function protectedFn<
	T extends (user: User, ...args: any[]) => any,
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
