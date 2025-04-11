"use server";

import { cookies } from "next/headers";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
let _secretKey: Uint8Array | null = null;
function getSecretKey(): Uint8Array {
	if (!_secretKey) {
		if (!JWT_SECRET) {
			throw new Error("JWT_SECRET environment variable is not set.");
		}
		_secretKey = new TextEncoder().encode(JWT_SECRET);
	}
	return _secretKey;
}

export async function checkAuth() {
	const cookieStore = await cookies();
	const jwt = cookieStore.get("jwt")?.value;
	if (!jwt) {
		return false;
	}
	const secretKey = getSecretKey();
	try {
		const { payload } = await jose.jwtVerify(jwt, secretKey);
		return {
			name: payload.name as string,
			email: payload.email as string,
		};
	} catch (error) {
		console.error("JWT verification failed:", error);
		return false;
	}
}

export async function logout() {
	const cookieStore = await cookies();
	cookieStore.delete("jwt");
}
