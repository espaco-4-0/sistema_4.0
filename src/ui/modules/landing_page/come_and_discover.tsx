import { motion } from "framer-motion";
import { BookOpen, Calendar, CheckCircle2, Eye, Mail } from "lucide-react";
import Link from "next/link";

// retirar e colocar no .env
const WHATSAPP_NUMBER = "558597947611";
const MotionLink = motion.create(Link);

export default function ComeAndDiscover() {
    const steps = [
        {
            number: "01",
            icon: Eye,
            title: "Veja o espaço",
            description: "Faça um tour virtual ou presencial para conhecer nossas instalações e tecnologias",
            color: "from-yellow-400 to-orange-500",
        },
        {
            number: "02",
            icon: BookOpen,
            title: "Entenda como funciona",
            description: "Conheça nossa metodologia e veja como integrar o Espaço 4.0 ao seu plano de aula",
            color: "from-orange-400 to-yellow-600",
        },
        {
            number: "03",
            icon: Calendar,
            title: "Agende sua visita",
            description: "Escolha data e horário que melhor se adequam à sua turma e venha experimentar",
            color: "from-amber-500 to-orange-600",
        },
    ];

    return (
        <section
            id="come-and-discover"
            className="py-32 bg-linear-to-br from-yellow-400 via-yellow-500 to-orange-500 relative overflow-hidden"
        >
            <div className="absolute inset-0  opacity-20" />
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                        <span className="text-black font-semibold">Para Educadores</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold text-black mb-6">
                        Sou Professor, Como Levar
                        <br />
                        Minha Turma?
                    </h2>
                    <p className="text-xl text-black/80 max-w-3xl mx-auto">
                        Transforme suas aulas com experiências práticas em tecnologia.
                        <br />É simples, rápido e completamente adaptado ao seu planejamento.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className="relative"
                        >
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-20 left-[60%] w-[80%] h-1 bg-white/30">
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        whileInView={{ scaleX: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                                        className="h-full bg-white origin-left"
                                    />
                                </div>
                            )}

                            <div className="group bg-white/10 backdrop-blur-sm p-8 rounded-3xl border-2 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                                    <span
                                        className={`text-2xl font-bold bg-linear-to-br ${step.color} bg-clip-text text-transparent`}
                                    >
                                        {step.number}
                                    </span>
                                </div>

                                <div
                                    className={`inline-flex items-center justify-center w-14 h-14 bg-linear-to-br ${step.color} rounded-2xl mb-6 shadow-lg group-hover:rotate-12 transition-transform duration-300`}
                                >
                                    <step.icon className="w-7 h-7 text-white" />
                                </div>

                                <h3 className="text-2xl font-bold text-black mb-4">{step.title}</h3>
                                <p className="text-black/80 leading-relaxed">{step.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-3xl p-8 md:p-12 mb-12"
                >
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            "Gratuito para escolas públicas",
                            "Horários flexíveis",
                            "Suporte pedagógico completo",
                            "Materiais didáticos inclusos",
                            "Transporte facilitado",
                            "Certificado de participação",
                        ].map((benefit, index) => (
                            <motion.div
                                key={benefit}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                                className="flex items-center gap-3"
                            >
                                <CheckCircle2 className="w-6 h-6 text-black shrink-0" />
                                <span className="text-black font-medium">{benefit}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="text-center flex flex-col items-center gap-4"
                >
                    {/* Botão Agendar: calendário gira e seta avança no hover, escala no click */}
                    <MotionLink
                        href="/calendar"
                        variants={{
                            rest: { scale: 1 },
                            hover: { scale: 1.04 },
                        }}
                        initial="rest"
                        animate="rest"
                        whileHover="hover"
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="px-12 py-6 bg-slate-900 text-white font-bold text-lg rounded-2xl shadow-2xl inline-flex items-center gap-3"
                    >
                        <motion.span
                            variants={{
                                rest: { rotate: 0 },
                                hover: { rotate: 360, transition: { duration: 0.6, ease: "easeInOut" } },
                            }}
                        >
                            <Calendar className="w-6 h-6" />
                        </motion.span>
                        Agendar Visita para Minha Turma
                        <motion.span
                            animate={{ x: [0, 6, 0] }}
                            transition={{ duration: 1.4, repeat: 3, ease: "easeInOut" }}
                        >
                            →
                        </motion.span>
                    </MotionLink>

                    <p className="text-xl font-semibold text-black/60">Ou</p>

                    <motion.a
                        title="Email"
                        href={"mailto:espaco4.0.arapiraca@ifal.edu.br"}
                        target="_blank"
                        rel="noopener noreferrer"
                        variants={{
                            rest: { scale: 1 },
                            hover: { scale: 1.04 },
                        }}
                        initial="rest"
                        animate="rest"
                        whileHover="hover"
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="px-12 py-6 bg-slate-900 text-white font-bold text-lg rounded-2xl shadow-2xl inline-flex items-center gap-3"
                    >
                        <motion.span
                            variants={{
                                rest: { rotate: 0 },
                                hover: {
                                    rotate: [0, -20, 20, -18, 18, -10, 10, 0],
                                    transition: { duration: 0.6, ease: "easeInOut" },
                                },
                            }}
                        >
                            <Mail className="w-6 h-6" />
                        </motion.span>
                        Entre Em Contato Conosco
                    </motion.a>
                </motion.div>
            </div>
        </section>
    );
}
