import { deleteHandlers } from "./handlers/delete";
import { getHandlers } from "./handlers/get";
import { patchHandlers } from "./handlers/patch";
import { postHandlers } from "./handlers/post";

export async function GET() {
    return getHandlers();
}

export async function PATCH(req: Request) {
    return patchHandlers(req);
}

export async function POST(req: Request) {
    return postHandlers(req);
}

export async function DELETE(req: Request) {
    return deleteHandlers(req);
}
