"use client";

import { useRef, useState } from "react";
import {
    ELEMENT_LABELS,
    PAGE_HEIGHT,
    PAGE_WIDTH,
    type CertificateLayoutV2,
    type ElementKey,
} from "@/src/infra/modules/certificates/layout";

/** Texto de exemplo mostrado no editor — o real entra na emissão. */
const PREVIEW_TEXT: Record<ElementKey, string> = {
    titulo: "Certificado de Participação",
    descricao: "Certificamos que o aluno participou das atividades do Espaço 4.0.",
    nome: "Maria Silva Santos",
    curso: "Robótica Educacional — 40 horas",
    rodape: "Emitido em 13/08/2026",
    assinatura: "Ana Costa — Coordenadora",
};

interface CertificateCanvasProps {
    layout: CertificateLayoutV2;
    selected: ElementKey | null;
    onSelect: (key: ElementKey) => void;
    onMove: (key: ElementKey, x: number, y: number) => void;
}

export function CertificateCanvas({ layout, selected, onSelect, onMove }: Readonly<CertificateCanvasProps>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState<ElementKey | null>(null);

    /**
     * Converte a posição do mouse para coordenadas do PDF. O eixo Y é invertido:
     * no PDF a origem fica embaixo, no DOM fica em cima.
     */
    function toPdfCoords(clientX: number, clientY: number) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return null;

        const scaleX = PAGE_WIDTH / rect.width;
        const scaleY = PAGE_HEIGHT / rect.height;

        return {
            x: Math.round(Math.min(Math.max((clientX - rect.left) * scaleX, 0), PAGE_WIDTH)),
            y: Math.round(Math.min(Math.max(PAGE_HEIGHT - (clientY - rect.top) * scaleY, 0), PAGE_HEIGHT)),
        };
    }

    function handlePointerMove(event: React.PointerEvent) {
        if (!dragging) return;

        const coords = toPdfCoords(event.clientX, event.clientY);
        if (coords) onMove(dragging, coords.x, coords.y);
    }

    return (
        <div
            ref={containerRef}
            onPointerMove={handlePointerMove}
            onPointerUp={() => setDragging(null)}
            onPointerLeave={() => setDragging(null)}
            className="relative w-full overflow-hidden rounded-lg border-2 border-gray-200 select-none"
            style={{
                aspectRatio: `${PAGE_WIDTH} / ${PAGE_HEIGHT}`,
                backgroundColor: layout.corFundo,
                backgroundImage: layout.backgroundUrl ? `url(${layout.backgroundUrl})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {layout.showBorder ? (
                <div
                    className="pointer-events-none absolute"
                    style={{
                        inset: `${(28 / PAGE_HEIGHT) * 100}% ${(28 / PAGE_WIDTH) * 100}%`,
                        border: `2px solid ${layout.corBorda}`,
                    }}
                />
            ) : null}

            {(Object.keys(layout.elements) as ElementKey[]).map((key) => {
                const element = layout.elements[key];
                if (!element.visible) return null;

                const isSelected = selected === key;

                // Percentuais mantêm o posicionamento correto em qualquer largura.
                const left = (element.x / PAGE_WIDTH) * 100;
                const top = ((PAGE_HEIGHT - element.y) / PAGE_HEIGHT) * 100;

                const translateX = element.align === "center" ? "-50%" : element.align === "right" ? "-100%" : "0";

                return (
                    <button
                        key={key}
                        type="button"
                        aria-label={`Mover ${ELEMENT_LABELS[key]}`}
                        onPointerDown={(event) => {
                            event.preventDefault();
                            onSelect(key);
                            setDragging(key);
                        }}
                        className={`absolute cursor-move whitespace-nowrap px-1 text-left ${
                            isSelected ? "ring-2 ring-blue-500 ring-offset-1" : "hover:ring-1 hover:ring-gray-400"
                        }`}
                        style={{
                            left: `${left}%`,
                            top: `${top}%`,
                            transform: `translate(${translateX}, -50%)`,
                            color: element.color,
                            // O tamanho é relativo à largura da página para acompanhar a escala.
                            fontSize: `${(element.size / PAGE_WIDTH) * 100}cqw`,
                            fontWeight: key === "titulo" || key === "nome" ? 700 : 400,
                        }}
                    >
                        {PREVIEW_TEXT[key]}
                    </button>
                );
            })}
        </div>
    );
}
