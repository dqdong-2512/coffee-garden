import { recordStockMovement } from "@/features/inventory/inventory-service";
import { authorizeRequest } from "@/lib/auth/authorization";
import { mutationError, rejectInvalidMutation } from "../_shared";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const auth = await authorizeRequest(request, ["AUDIT"]); if (auth.response) return auth.response;
  const invalid = rejectInvalidMutation(request); if (invalid) return invalid;
  try { return Response.json({ movement: await recordStockMovement(await request.json(), auth.user.id) }, { status: 201 }); }
  catch (error) { return mutationError(error); }
}
