function pad2(n: number): string {
    return String(n).padStart(2, "0");
}

function toLocalIsoDate(d: Date): string {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function computeEasterSunday(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

export function buildHolidayMap(
    year: number,
    extraHolidays: Array<{ month: number; day: number; name: string }> = []
): Map<string, string> {
    const map = new Map<string, string>();

    const add = (date: Date, name: string) => {
        map.set(toLocalIsoDate(date), name);
    };

    const fixed = (month: number, day: number, name: string) => {
        add(new Date(year, month - 1, day), name);
    };

    fixed(1, 1, "Confraternização Universal");
    fixed(4, 21, "Tiradentes");
    fixed(5, 1, "Dia do Trabalho");
    fixed(9, 7, "Independência do Brasil");
    fixed(10, 12, "Nossa Senhora Aparecida");
    fixed(11, 2, "Finados");
    fixed(11, 15, "Proclamação da República");
    fixed(11, 20, "Consciência Negra");
    fixed(12, 25, "Natal");

    const easter = computeEasterSunday(year);
    add(addDays(easter, -48), "Carnaval (segunda)"); // segunda-feira
    add(addDays(easter, -47), "Carnaval (terça)"); // terça-feira
    add(addDays(easter, -2), "Sexta-Feira Santa");
    add(easter, "Páscoa");
    add(addDays(easter, 60), "Corpus Christi");

    for (const { month, day, name } of extraHolidays) {
        fixed(month, day, name);
    }

    return map;
}

const holidayCache = new Map<number, Map<string, string>>();

function getHolidayMap(
    year: number,
    extraHolidays?: Array<{ month: number; day: number; name: string }>
): Map<string, string> {
    if (!holidayCache.has(year)) {
        holidayCache.set(year, buildHolidayMap(year, extraHolidays));
    }
    return holidayCache.get(year)!;
}

export function getHolidayName(
    d: Date,
    extraHolidays?: Array<{ month: number; day: number; name: string }>
): string | null {
    const map = getHolidayMap(d.getFullYear(), extraHolidays);
    return map.get(toLocalIsoDate(d)) ?? null;
}

export function getHolidayNameSafe(
    d: Date,
    extraHolidays?: Array<{ month: number; day: number; name: string }>
): string | null {
    try {
        return getHolidayName(d, extraHolidays);
    } catch {
        return null;
    }
}

export function isHolidayOrWeekend(
    d: Date,
    extraHolidays?: Array<{ month: number; day: number; name: string }>
): boolean {
    const dow = d.getDay();
    if (dow === 0 || dow === 6) return true;
    return getHolidayName(d, extraHolidays) !== null;
}
