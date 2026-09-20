import { updateStaff } from "@/features/settings/settings-service";
import { authorizeRequest } from "@/lib/auth/authorization";
import { mutationError, rejectInvalidMutation } from "../../_shared";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ staffId: string }> }) {
  const auth = await authorizeRequest(request, ["SUPER_ADMIN"]);
  if (auth.response) return auth.response;
  const invalid = rejectInvalidMutation(request);
  if (invalid) return invalid;
  const { staffId } = await params;
  try {
    return Response.json({ staff: await updateStaff(staffId, await request.json(), auth.user.id) });
  } catch (error) {
    return mutationError(error);
  }
}
