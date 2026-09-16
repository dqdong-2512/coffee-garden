import { closeDay } from "@/features/closing/closing-service";
import { authorizeRequest } from "@/lib/auth/authorization";
import { mutationError, rejectInvalidMutation } from "../_shared";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const auth = await authorizeRequest(request, ["OWNER"]); if (auth.response) return auth.response;
  const invalid = rejectInvalidMutation(request); if (invalid) return invalid;
  try { return Response.json({ closure: await closeDay(await request.json(), auth.user.id) }, { status: 201 }); }
  catch (error) { return mutationError(error); }
}
