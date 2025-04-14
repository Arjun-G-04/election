import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

const DAUTH_TOKEN_URL = "https://auth.delta.nitt.edu/api/oauth/token";
const DAUTH_RESOURCE_URL = "https://auth.delta.nitt.edu/api/resources/user";
const DAUTH_CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID!;
const DAUTH_CLIENT_SECRET = process.env.CLIENT_SECRET!;
const DAUTH_REDIRECT_URL = process.env.NEXT_PUBLIC_REDIRECT_URL!;
const JWT_SECRET = process.env.JWT_SECRET;

interface DAuthTokens {
	access_token: string;
	id_token?: string;
}

interface DAuthUserInfo {
	id: string | number;
	email: string;
	name: string;
}

let _secretKey: Uint8Array | null = null;
function getSecretKey(): Uint8Array {
	if (!_secretKey) {
		if (!JWT_SECRET) {
			throw new Error("JWT_SECRET environment variable is not set.");
		}
		// Encode the secret string into a Uint8Array for jose HS256 signing
		_secretKey = new TextEncoder().encode(JWT_SECRET);
	}
	return _secretKey;
}

export async function GET(req: NextRequest) {
	const searchParams = req.nextUrl.searchParams;
	const code = searchParams.get("code");
	const state = searchParams.get("state");
	if (!code || !state) {
		return new NextResponse("Missing code or state", { status: 400 });
	}

	const cookieStore = await cookies();
	const expectedState = cookieStore.get("dauth_state")?.value;
	if (!expectedState) {
		return new NextResponse("Missing state cookie", { status: 400 });
	}

	if (state !== expectedState) {
		return new NextResponse("Invalid state", { status: 400 });
	}

	const tokenParams = new URLSearchParams({
		grant_type: "authorization_code",
		code: code,
		redirect_uri: DAUTH_REDIRECT_URL,
		client_id: DAUTH_CLIENT_ID,
		client_secret: DAUTH_CLIENT_SECRET,
	});

	const tokenResponse = await fetch(DAUTH_TOKEN_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: tokenParams.toString(),
	});

	if (!tokenResponse.ok) {
		const errorData = await tokenResponse.json().catch(() => ({}));
		console.error(
			"DAuth token exchange failed:",
			tokenResponse.status,
			errorData,
		);
		return new NextResponse("Token exchange failed", { status: 500 });
	}

	const tokens: DAuthTokens = await tokenResponse.json();

	if (!tokens.access_token) {
		return new NextResponse("Missing access token", { status: 500 });
	}

	const userInfoResponse = await fetch(DAUTH_RESOURCE_URL, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${tokens.access_token}`,
		},
	});

	if (!userInfoResponse.ok) {
		const errorData = await userInfoResponse.json().catch(() => ({}));
		console.error(
			"DAuth user info fetch failed:",
			userInfoResponse.status,
			errorData,
		);
		return new NextResponse("User info fetch failed", { status: 500 });
	}

	const userInfo: DAuthUserInfo = await userInfoResponse.json();

	if (
		!userInfo.email.startsWith("111122") ||
		Number(userInfo.email.slice(8, 9)) % 2 === 0
	) {
		return new NextResponse("You are not eligible to vote", {
			status: 403,
		});
	}

	const secretKey = getSecretKey();
	const payload = {
		email: userInfo.email,
		name: userInfo.name,
	};

	const sessionToken = await new jose.SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" }) // Algorithm must match secret key type
		.setIssuedAt() // Timestamp of issuance
		.setExpirationTime("24h") // Set the token's expiry time
		.sign(secretKey);

	cookieStore.set("jwt", sessionToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV !== "development",
		maxAge: 60 * 60 * 24,
		path: "/",
		sameSite: "lax",
	});

	// delete state
	cookieStore.delete("dauth_state");

	const existingUser = await prisma.user.findUnique({
		where: {
			email: userInfo.email,
		},
	});

	if (!existingUser) {
		const voterIds = await prisma.user.findMany({
			where: {},
			select: {
				voterId: true,
			},
		});

		let newVoterId = randomBytes(2).toString("hex");
		while (voterIds.some((voter) => voter.voterId === newVoterId)) {
			newVoterId = randomBytes(2).toString("hex");
		}

		await prisma.user.create({
			data: {
				email: userInfo.email,
				name: userInfo.name,
				voterId: newVoterId,
			},
		});
	}

	// redirect to home page
	return NextResponse.redirect(new URL("/", req.url));
}
