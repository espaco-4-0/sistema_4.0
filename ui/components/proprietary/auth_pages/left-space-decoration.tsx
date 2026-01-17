import Image from "next/image";

export default function LeftSpaceDecoration() {
    return (
        <div className="hidden lg:flex flex-col justify-center items-center gap-50 h-lvh p-40 bg-[repeating-linear-gradient(45deg,#0b0b0b_1px,#000000_4px,#121212_7px,#0d0d05_6px)] ">
            <Image src={"espaco-logo.svg"} alt="Logo do Espaço 4.0" width="603" height="498"></Image>
            <Image
                src={"ifal-arapiraca-logo-completa.svg"}
                alt="Logo do Instituto Federal de Alagoas, Campus Arapiraca"
                width="300"
                height="75"
            ></Image>
        </div>
    );
}
