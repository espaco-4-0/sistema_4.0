type BlockType = "start" | "center" | "end" | "nearest";

export function scrollToSection(id: string, block: BlockType = "center") {
    const section = document.getElementById(id);
    section?.scrollIntoView({ behavior: "smooth", block: block });
}
