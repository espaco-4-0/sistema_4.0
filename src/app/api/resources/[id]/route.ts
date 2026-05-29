import { handleError } from "@/src/lib/errors/errorHandler";
import { resourceService } from "@/src/lib/services/resource.service";
import { updateResourceSchema } from "@/src/lib/validators/resource.validator";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const resource = await resourceService.getById(params.id);
        return NextResponse.json(resource);
    } catch (error) {
        return handleError(error);
    }
}

export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const body = await request.json();
        const data = updateResourceSchema.parse(body);
        const resource = await resourceService.update(params.id, data);
        return NextResponse.json(resource);
    } catch (error) {
        return handleError(error);
    }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    try {
        const result = await resourceService.delete(params.id);
        return NextResponse.json(result);
    } catch (error) {
        return handleError(error);
    }
}
