import { authorizeRequest } from "@/lib/auth/authorization";
import { createTable } from "@/features/management/services/management-service";
import { mutationError, rejectInvalidMutation } from "../_shared";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await authorizeRequest(request, ["AUDIT"]);
  if (auth.response) return auth.response;
  const invalid = rejectInvalidMutation(request);
  if (invalid) return invalid;
  try {
    return Response.json({ table: await createTable(await request.json()) }, { status: 201 });
  } catch (error) {
    return mutationError(error);
  }
}
