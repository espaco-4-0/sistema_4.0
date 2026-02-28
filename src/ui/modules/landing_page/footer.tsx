import { BookOpen, Calendar, Home, Lightbulb, Mail, MapPin, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    const mapLink = "https://www.google.com/maps/search/?api=1&query=IFAL+Campus+Arapiraca";

    return (
        <footer id="footer" className="bg-black text-white px-6 py-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 gap-16 lg:grid-cols-4">
                <motion.div
                    className="space-y-10"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0 }}
                >
                    <div className="flex items-start gap-6">
                        <div className="flex items-center relative w-24 h-24">
                            <Image
                                src="/logosuperior.svg"
                                fill
                                alt="Instituto Federal de Alagoas"
                                className="object-contain"
                            />
                        </div>
                        <div className="pt-1">
                            <h3 className="text-xl font-semibold text-yellow-primary leading-tight">Espaço 4.0</h3>
                            <p className="text-gray-500 text-[14px]">Laboratório de inovação</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="relative w-14 h-14">
                                <Image
                                    src="/if.svg"
                                    fill
                                    alt="Instituto Federal de Alagoas"
                                    className="object-contain"
                                />
                            </div>
                            <div className="text-sm leading-tight">
                                <p className="font-semibold text-yellow-primary">INSTITUTO FEDERAL</p>
                                <p className="text-yellow-primary">Alagoas</p>
                                <p className="text-yellow-primary">Campus Arapiraca</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                >
                    <h4 className="text-yellow-primary font-semibold mb-8 text-lg">Navegação</h4>
                    <ul className="space-y-6">
                        <FooterItem icon={Home} title="Sobre" desc="Conheça nossa história" href="/#what-is" />
                        <FooterItem icon={Users} title="Equipe" desc="Nossos colaboradores" href="/#blog" />
                        <FooterItem icon={BookOpen} title="Cursos" desc="Capacitações oferecidas" href="/#courses" />
                    </ul>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                >
                    <h4 className="text-yellow-primary font-semibold mb-8 text-lg">Recursos</h4>
                    <ul className="space-y-6">
                        <FooterItem icon={Lightbulb} title="Projetos" desc="Conheça novidades" href="/#blog" />
                        <FooterItem icon={Calendar} title="Eventos" desc="Participe de atividades" href="/calendar" />
                    </ul>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                >
                    <h4 className="text-yellow-primary font-semibold mb-8 text-lg">Suporte</h4>
                    <ul className="space-y-6">
                        <FooterItem
                            icon={Mail}
                            title="Email"
                            desc="espaco4.0.arapiraca@ifal.edu.br"
                            href="mailto:espaco4.0.arapiraca@ifal.edu.br"
                        />
                        <FooterItem
                            icon={MapPin}
                            title="Como Chegar"
                            desc="IFAL Campus Arapiraca"
                            href={mapLink}
                            external
                        />
                    </ul>
                </motion.div>
            </div>
            <motion.div
                className="border-t border-white/10 mt-20 pt-6 text-center text-sm text-gray-500"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            >
                © 2026 Espaço 4.0 – IFAL Campus Arapiraca. Todos os direitos reservados.
            </motion.div>
        </footer>
    );
}

type FooterItemProps = Readonly<{
    icon: LucideIcon;
    title: string;
    desc: string;
    href: string;
    external?: boolean;
}>;

function FooterItem({ icon: Icon, title, desc, href, external = false }: FooterItemProps) {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!href.includes("#")) return;
        e.preventDefault();
        const id = href.slice(2);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <motion.li whileHover="hovered" whileTap="tapped" initial="rest">
            <Link
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                onClick={handleClick}
                className="flex gap-5 items-start"
            >
                <motion.div
                    className="bg-yellow-primary text-black p-4 rounded-2xl shrink-0"
                    variants={{
                        rest: { scale: 1, rotate: 0 },
                        hovered: { scale: 1.1, rotate: -5 },
                        tapped: { scale: 0.9, rotate: 5 },
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 22 }}
                >
                    <Icon size={20} />
                </motion.div>
                <motion.div
                    variants={{
                        rest: { opacity: 0.75, x: 0 },
                        hovered: { opacity: 1, x: 3 },
                        tapped: { opacity: 1, x: 6 },
                    }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                >
                    <p className="font-medium text-base leading-tight">{title}</p>
                    <p className="text-sm text-gray-400 mt-1 max-w-55 wrap-break-word">{desc}</p>
                </motion.div>
            </Link>
        </motion.li>
    );
}
