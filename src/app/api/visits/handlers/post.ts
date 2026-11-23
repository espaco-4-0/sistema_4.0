import { createVisitFromFormData } from "@/src/infra/modules/visits/visits.service";
import { handleError } from "@/src/lib/errors/errorHandler";
import { NextResponse } from "next/server";

export async function postHandlers(req: Request) {
    try {
        const formData = await req.formData();
        const visitWithDocs = await createVisitFromFormData(formData);
        return NextResponse.json(visitWithDocs, { status: 201 });
    } catch (error) {
        return handleError(error);
    }
}
