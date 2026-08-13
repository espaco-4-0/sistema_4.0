import { handleError } from "@/src/lib/errors/errorHandler";
import { resourceService } from "@/src/lib/services/resource.service";
import { importResourcesSchema } from "@/src/lib/validators/resource.validator";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const dto = importResourcesSchema.parse(body);
        const result = await resourceService.bulkImport(dto);

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return handleError(error);
    }
}
