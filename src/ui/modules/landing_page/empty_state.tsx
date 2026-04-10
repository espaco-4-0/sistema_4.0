import Image from "next/image";

export function EmptyState({ title, description }: Readonly<{ title: string; description: string }>) {
    return (
        <div className="flex justify-center items-center flex-col gap-1">
            <Image src="/robot-confused.png" alt="Imagem de robô confuso" width={400} height={400} />
            <span className="text-3xl font-semibold text-gray-500 mt-4 text-center">{title}</span>
            <p className="text-lg tracking-wide text-gray-400 text-center">{description}</p>
        </div>
    );
}
