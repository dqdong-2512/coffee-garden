import { updateShopSettings } from "@/features/settings/settings-service";
import { authorizeRequest } from "@/lib/auth/authorization";
import { mutationError, rejectInvalidMutation } from "../_shared";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  const auth = await authorizeRequest(request, ["SUPER_ADMIN"]);
  if (auth.response) return auth.response;
  const invalid = rejectInvalidMutation(request);
  if (invalid) return invalid;
  try {
    return Response.json({ settings: await updateShopSettings(await request.json()) });
  } catch (error) {
    return mutationError(error);
  }
}
