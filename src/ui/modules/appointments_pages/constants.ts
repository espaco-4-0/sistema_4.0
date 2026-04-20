import { useMemo } from "react";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";

export const monthMap: Record<string, number> = {
    jan: 0,
    fev: 1,
    mar: 2,
    abr: 3,
    mai: 4,
    jun: 5,
    jul: 6,
    ago: 7,
    set: 8,
    out: 9,
    nov: 10,
    dez: 11,
};

export type Step = "idle" | "list" | "form" | "detail" | "loading" | "success" | "error" | "weekend" | "past";

export type InitialVisitState = {
    date: Date;
    step: Step;
};

export function parseInitialVisitState(
    params: ReadonlyURLSearchParams | { get: (k: string) => string | null } | null | undefined
): InitialVisitState {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!params) return { date: new Date(), step: "idle" };

    const dayParam = params.get("day");
    const monthParam = params.get("month");
    if (!dayParam || !monthParam) return { date: new Date(), step: "idle" };

    const monthKey = monthParam.toLowerCase();
    const monthIndex = monthMap[monthKey];
    if (monthIndex === undefined) return { date: new Date(), step: "idle" };

    const day = Number.parseInt(dayParam, 10);
    if (Number.isNaN(day) || day < 1 || day > 31) return { date: new Date(), step: "idle" };

    const year = new Date().getFullYear();
    const target = new Date(year, monthIndex, day);
    target.setHours(0, 0, 0, 0);

    const isWeekend = target.getDay() === 0 || target.getDay() === 6;
    const isPast = target < today;

    if (isWeekend || isPast) return { date: new Date(), step: "idle" };

    return { date: target, step: "list" };
}

export function useInitialVisitState(): InitialVisitState {
    const searchParams = useSearchParams();

    const key = typeof (searchParams as any)?.toString === "function" ? searchParams.toString() : String(searchParams);

    return useMemo(() => parseInitialVisitState(searchParams), [key]);
}
