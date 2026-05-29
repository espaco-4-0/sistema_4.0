import { handleError } from "@/src/lib/errors/errorHandler";
import { resourceService } from "@/src/lib/services/resource.service";
import { createResourceSchema, listResourcesSchema } from "@/src/lib/validators/resource.validator";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const filters = listResourcesSchema.parse({
            page: searchParams.get("page") ?? 1,
            limit: searchParams.get("limit") ?? 10,
            category: searchParams.get("category") ?? undefined,
            status: searchParams.get("status") ?? undefined,
            search: searchParams.get("search") ?? undefined,
        });

        const result = await resourceService.list(filters);
        return NextResponse.json(result);
    } catch (error) {
        return handleError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = createResourceSchema.parse(body);
        const resource = await resourceService.create(data);
        return NextResponse.json(resource, { status: 201 });
    } catch (error) {
        return handleError(error);
    }
}
