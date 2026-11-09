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

export const Route = createFileRoute("/api/uploads/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { readUpload } = await import("@/lib/uploads.server");
        const found = await readUpload(params.id);
        if (!found) return Response.json({ error: "Not found." }, { status: 404 });
        return new Response(Buffer.from(found.body), {
          headers: {
            "content-type": "application/octet-stream",
            "content-length": String(found.body.byteLength),
            "content-disposition": `attachment; filename="${found.meta.file}"`,
          },
        });
      },
      PUT: async ({ request, params }) => {
        try {
          assertOwner(request);
          const index = Number(request.headers.get("x-chunk-index"));
          const body = new Uint8Array(await request.arrayBuffer());
          const { saveChunk } = await import("@/lib/uploads.server");
          await saveChunk(params.id, index, body);
          return Response.json({ ok: true });
        } catch (error) {
          return fail(error);
        }
      },
      POST: async ({ request, params }) => {
        try {
          assertOwner(request);
          const { finishUpload } = await import("@/lib/uploads.server");
          const meta = await finishUpload(params.id);
          return Response.json(meta);
        } catch (error) {
          return fail(error);
        }
      },
      DELETE: async ({ request, params }) => {
        try {
          assertOwner(request);
          const { deleteUpload } = await import("@/lib/uploads.server");
          await deleteUpload(params.id);
          return Response.json({ ok: true });
        } catch (error) {
          return fail(error);
        }
      },
    },
  },
});
