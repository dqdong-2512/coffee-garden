import { authorizeRequest } from "@/lib/auth/authorization";
import { updateProduct } from "@/features/management/services/management-service";
import { mutationError, rejectInvalidMutation } from "../../_shared";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const auth = await authorizeRequest(request, ["AUDIT"]);
  if (auth.response) return auth.response;
  const invalid = rejectInvalidMutation(request);
  if (invalid) return invalid;
  try {
    const { productId } = await params;
    return Response.json({ product: await updateProduct(productId, await request.json()) });
  } catch (error) {
    return mutationError(error);
  }
}
