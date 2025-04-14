"use client";

import { logout } from "@/actions/auth";

export default function Logout() {
	return (
		<button
			onClick={() => {
				logout();
			}}
			type="button"
			className="mt-auto px-5 py-2 bg-red-300 text-red-900 font-bold rounded-sm hover:cursor-pointer"
		>
			Logout
		</button>
	);
}
