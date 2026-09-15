import { authorizeRequest } from "@/lib/auth/authorization";
import { updateTable } from "@/features/management/services/management-service";
import { mutationError, rejectInvalidMutation } from "../../_shared";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tableId: string }> },
) {
  const auth = await authorizeRequest(request, ["OWNER"]);
  if (auth.response) return auth.response;
  const invalid = rejectInvalidMutation(request);
  if (invalid) return invalid;
  try {
    const { tableId } = await params;
    return Response.json({ table: await updateTable(tableId, await request.json()) });
  } catch (error) {
    return mutationError(error);
  }
}
