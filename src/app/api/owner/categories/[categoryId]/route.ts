import { authorizeRequest } from "@/lib/auth/authorization";
import { updateCategory } from "@/features/management/services/management-service";
import { mutationError, rejectInvalidMutation } from "../../_shared";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const auth = await authorizeRequest(request, ["OWNER"]);
  if (auth.response) return auth.response;
  const invalid = rejectInvalidMutation(request);
  if (invalid) return invalid;
  try {
    const { categoryId } = await params;
    return Response.json({ category: await updateCategory(categoryId, await request.json()) });
  } catch (error) {
    return mutationError(error);
  }
}
