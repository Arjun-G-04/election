"use client";

import { randomBytes } from "crypto";

function generateRandomString(length: number) {
	return randomBytes(length).toString("hex");
}

function generateDAuthLoginUrl() {
	const dauthBaseUrl = "https://auth.delta.nitt.edu/authorize";
	const state = generateRandomString(30);

	const params = {
		client_id: process.env.NEXT_PUBLIC_CLIENT_ID || "", // Ensure this is set in your environment variables
		redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URL || "", // Ensure this is already properly encoded if needed, or encode it here
		response_type: "code", // Fixed value for Authorization Code Flow
		grant_type: "authorization_code", // Fixed value for Authorization Code Flow
		state: state, // Replace with a unique state value for CSRF protection",
		scope: ["openid", "email", "profile", "user"].join(" "), // Join scope array into a space-separated string
		nonce: generateRandomString(30),
	};

	const searchParams = new URLSearchParams();
	for (const key in params) {
		if (params.hasOwnProperty(key)) {
			searchParams.append(key, params[key as keyof typeof params]);
		}
	}
	const authorizationUrl = `${dauthBaseUrl}?${searchParams.toString()}`;

	return { authorizationUrl, state };
}

export default function Login() {
	return (
		<button
			onClick={() => {
				const { authorizationUrl, state } = generateDAuthLoginUrl();
				document.cookie = `dauth_state=${state}; path=/; max-age=3600;`;
				window.location.href = authorizationUrl;
			}}
			className="bg-green-500 p-5"
		>
			Login with DAuth
		</button>
	);
}
