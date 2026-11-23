import { listPostComments } from "@/src/infra/modules/blog/blog-interaction.service";
import { postSlugBlogSchema } from "@/src/infra/modules/blog/blog.schema";
import { ValidationError } from "@/src/lib/errors/AppError";
import { handleError } from "@/src/lib/errors/errorHandler";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const slug: string = (await params).slug;
        const validatedSlug = postSlugBlogSchema.safeParse(slug);
        if (!validatedSlug.success) throw new ValidationError("Dado inválido");

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
        const limit = 6;

        const paginated = await listPostComments(validatedSlug.data, page, limit);

        return NextResponse.json(paginated, { status: 200 });
    } catch (err) {
        return handleError(err);
    }
}
