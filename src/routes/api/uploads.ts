import { createFileRoute } from "@tanstack/react-router";
import { OWNER_CODE } from "@/lib/owner-code";

function fail(error: unknown) {
  const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 500;
  const message = error instanceof Error ? error.message : "Upload failed.";
  return Response.json({ error: message }, { status: status || 500 });
}

function assertOwner(request: Request) {
  const code = request.headers.get("x-owner-code")?.trim().toLowerCase();
  if (code !== OWNER_CODE) {
    throw Object.assign(new Error("Wrong code."), { status: 401 });
  }
}

export const Route = createFileRoute("/api/uploads")({
  server: {
    handlers: {
      GET: async () => {
        const { listUploads } = await import("@/lib/uploads.server");
        const files = await listUploads();
        return Response.json({ files });
      },
      POST: async ({ request }) => {
        try {
          assertOwner(request);
          const payload = (await request.json()) as { name?: string; bytes?: number };
          const { startUpload } = await import("@/lib/uploads.server");
          const created = await startUpload(String(payload.name ?? ""), Number(payload.bytes));
          return Response.json(created);
        } catch (error) {
          return fail(error);
        }
      },
    },
  },
});
