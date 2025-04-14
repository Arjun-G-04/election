import { checkAuth } from "@/actions/auth";
import Login from "./_components/Login";
import Logout from "./_components/Logout";
import Home from "./_components/Home";
import Election from "./_components/Election";
import Countdown from "./_components/Countdown";

export default async function Page() {
	const authStatus = await checkAuth();

	if (authStatus === false) {
		return (
			<div className="flex flex-col justify-center items-center text-center h-screen w-screen p-5">
				<div className="text-5xl font-bold">CR Election Sem VII</div>
				<Login />
				<div className="mt-5 font-medium">Organized by</div>
				<div className="text-xl font-semibold">
					Election Commission of Mech-A 2026
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col justify-start items-start text-center h-screen w-screen p-5">
			<Home />
			<Countdown />
			<Election />
			<Logout />
		</div>
	);
}
