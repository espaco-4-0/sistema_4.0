/**
 * Parser de CSV suficiente para os arquivos de importação do painel:
 * aceita aspas duplas, aspas escapadas (""), vírgula ou ponto-e-vírgula como
 * separador e quebras de linha CRLF.
 */
export function parseCsv(text: string): Record<string, string>[] {
    const clean = text.replace(/^﻿/, "");
    const rows = splitRows(clean);

    if (rows.length < 2) return [];

    const separator = detectSeparator(rows[0]);
    const headers = splitLine(rows[0], separator).map((h) => h.trim());

    return rows
        .slice(1)
        .filter((line) => line.trim() !== "")
        .map((line) => {
            const cells = splitLine(line, separator);
            const row: Record<string, string> = {};

            headers.forEach((header, index) => {
                if (header) row[header] = (cells[index] ?? "").trim();
            });

            return row;
        });
}

function detectSeparator(headerLine: string): string {
    const semicolons = (headerLine.match(/;/g) ?? []).length;
    const commas = (headerLine.match(/,/g) ?? []).length;
    return semicolons > commas ? ";" : ",";
}

/** Quebra em linhas respeitando quebras dentro de campos entre aspas. */
function splitRows(text: string): string[] {
    const rows: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === '"') {
            if (inQuotes && text[i + 1] === '"') {
                current += '""';
                i++;
                continue;
            }
            inQuotes = !inQuotes;
            current += char;
            continue;
        }

        if (!inQuotes && (char === "\n" || char === "\r")) {
            if (char === "\r" && text[i + 1] === "\n") i++;
            rows.push(current);
            current = "";
            continue;
        }

        current += char;
    }

    if (current !== "") rows.push(current);

    return rows;
}

function splitLine(line: string, separator: string): string[] {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
                continue;
            }
            inQuotes = !inQuotes;
            continue;
        }

        if (char === separator && !inQuotes) {
            cells.push(current);
            current = "";
            continue;
        }

        current += char;
    }

    cells.push(current);

    return cells;
}

/** Gera o conteúdo de um CSV a partir de cabeçalhos e linhas. */
export function toCsv(headers: string[], rows: (string | number)[][]): string {
    const escape = (value: string | number) => {
        const text = String(value ?? "");
        return /[",;\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };

    return [headers.map(escape).join(","), ...rows.map((row) => row.map(escape).join(","))].join("\n");
}

/** Dispara o download de um CSV no navegador. */
export function downloadCsv(filename: string, content: string): void {
    const blob = new Blob([`﻿${content}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
