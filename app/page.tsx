import { checkAuth } from "@/actions/auth";
import Login from "./_components/Login";
import Logout from "./_components/Logout";
import Home from "./_components/Home";

export default async function Page() {
	const authStatus = await checkAuth();

	if (authStatus === false) {
		return (
			<div>
				<Login />
			</div>
		);
	}

	return (
		<div>
			<Home />
			<Logout />
		</div>
	);
}
