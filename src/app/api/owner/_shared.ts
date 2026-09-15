import { ZodError } from "zod";
import { ManagementError } from "@/features/management/services/management-service";
import { InventoryError } from "@/features/inventory/inventory-service";

export function mutationError(error: unknown) {
  if (error instanceof SyntaxError) {
    return Response.json({ error: "Dữ liệu JSON không hợp lệ." }, { status: 400 });
  }
  if (error instanceof ZodError) {
    return Response.json(
      { error: error.issues[0]?.message ?? "Dữ liệu không hợp lệ." },
      { status: 400 },
    );
  }
  if (error instanceof ManagementError) {
    return Response.json({ code: error.code, error: error.message }, { status: error.status });
  }
  if (error instanceof InventoryError) {
    return Response.json({ code: error.code, error: error.message }, { status: error.status });
  }
  return Response.json({ error: "Không thể lưu thay đổi lúc này." }, { status: 503 });
}

export function rejectInvalidMutation(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Yêu cầu không hợp lệ." }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return Response.json({ error: "Dữ liệu phải có định dạng JSON." }, { status: 415 });
  }
  return null;
}
