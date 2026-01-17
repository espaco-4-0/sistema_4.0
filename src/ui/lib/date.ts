export function formatDateBR(dateISO: string): string {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(dateISO));
}
