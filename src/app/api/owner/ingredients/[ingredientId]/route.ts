import { updateIngredient } from "@/features/inventory/inventory-service";
import { authorizeRequest } from "@/lib/auth/authorization";
import { mutationError, rejectInvalidMutation } from "../../_shared";

export const runtime = "nodejs";
export async function PATCH(request: Request, { params }: { params: Promise<{ ingredientId: string }> }) {
  const auth = await authorizeRequest(request, ["OWNER"]); if (auth.response) return auth.response;
  const invalid = rejectInvalidMutation(request); if (invalid) return invalid;
  try { const { ingredientId } = await params; return Response.json({ ingredient: await updateIngredient(ingredientId, await request.json()) }); }
  catch (error) { return mutationError(error); }
}
