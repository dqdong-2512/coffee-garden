import { authorizeRequest } from "@/lib/auth/authorization";
import { createCategory } from "@/features/management/services/management-service";
import { mutationError, rejectInvalidMutation } from "../_shared";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await authorizeRequest(request, ["OWNER"]);
  if (auth.response) return auth.response;
  const invalid = rejectInvalidMutation(request);
  if (invalid) return invalid;
  try {
    return Response.json({ category: await createCategory(await request.json()) }, { status: 201 });
  } catch (error) {
    return mutationError(error);
  }
}
