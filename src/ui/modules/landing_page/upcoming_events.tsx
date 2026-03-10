import { calendarEventsMock } from "@/src/infra/modules/calendar/calendar-mock";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/src/ui/components/ui/card";
import { ArrowRight, Clock, MapPin, Users } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

import { formatMonthShort } from "../../lib/date";

const events = calendarEventsMock.slice(0, 3);

export function UpcomingEvents() {
    return (
        <section
            id="upcoming-events"
            className="flex flex-col bg-slate-900 items-center py-12 sm:py-16 lg:py-20 px-6 sm:px-10"
        >
            <div className="flex flex-col items-center w-full max-w-7xl mx-auto">
                <motion.h2
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-white"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    Próximos <span className="text-yellow-400">Eventos</span>
                </motion.h2>

                <motion.p
                    className="mt-4 mb-10 sm:mb-14 lg:mb-17 text-base sm:text-lg text-center text-gray-400"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                >
                    Participe de experiências práticas e aprenda com especialistas
                </motion.p>

                <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 w-full mb-12 sm:mb-16 lg:mb-20">
                    {events.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 32 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.15 }}
                        >
                            <Card className="group p-0 h-full w-full gap-0 overflow-hidden border-none">
                                <div className="relative w-full h-48 overflow-hidden">
                                    <Image
                                        src={event.image || ""}
                                        alt={event.title}
                                        fill
                                        className="object-cover scale-[1.02] transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="shadow-xl absolute top-4 right-4 bg-white rounded-xl flex flex-col justify-center items-center text-slate-500 text-xs font-semibold py-1.5 px-2.5 uppercase">
                                        <span className="text-2xl text-slate-800 font-semibold">
                                            {event.start.getDate()}
                                        </span>
                                        {formatMonthShort(event.start)}
                                    </div>
                                </div>
                                <CardHeader className="text-xl font-bold text-slate-900 mt-6 mb-2">
                                    <CardTitle>{event.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2 text-sm items-center text-slate-600/90 mb-1.5">
                                        <Clock size={15} className="text-yellow-secondary" /> {event.time}
                                    </div>
                                    <div className="flex gap-2 text-sm items-center text-slate-600/90 pb-4">
                                        <MapPin size={15} className="text-yellow-secondary" /> {event.local}
                                    </div>

                                    <div className="text-xs font-semibold bg-yellow-primary rounded-md text-black flex gap-1.5 w-fit py-1.5 px-3 items-center pt-1">
                                        <Users size={15} /> {event.quantidade} vagas restantes
                                    </div>
                                </CardContent>

                                <CardFooter className="px-6 pb-6 pt-5">
                                    <motion.div
                                        className="w-full"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                    >
                                        <Link
                                            href={`/calendar?day=${event.start.getDate()}&month=${formatMonthShort(event.start)}`}
                                            className="gap-2 w-full rounded-xl py-3 text-md bg-slate-900 cursor-pointer flex justify-center items-center text-white group/btn"
                                        >
                                            Inscrever-se
                                            <ArrowRight
                                                size={20}
                                                className="transition-transform duration-400 group-hover/btn:translate-x-1"
                                            />
                                        </Link>
                                    </motion.div>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    whileHover="hover"
                    whileTap={{ scale: 0.97 }}
                    variants={{
                        hidden: { opacity: 0, y: 24, scale: 1 },
                        visible: {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: {
                                opacity: { duration: 0.6, ease: "easeOut", delay: 0.2 },
                                y: { duration: 0.6, ease: "easeOut", delay: 0.2 },
                                scale: { duration: 0.2, ease: "easeOut" },
                            },
                        },
                        hover: {
                            scale: 1.04,
                            transition: { duration: 0.2, ease: "easeOut" },
                        },
                    }}
                >
                    <Link
                        href="/calendar"
                        className="border-white border-2 bg-transparent text-md text-white font-semibold hover:bg-white hover:text-slate-800 transition-all rounded-md px-7 py-3.5 flex gap-2 items-center"
                    >
                        Ver todos os Eventos
                        <motion.span
                            variants={{
                                hidden: { x: 0, rotate: 0 },
                                visible: {
                                    x: 0,
                                    rotate: 0,
                                },
                                hover: {
                                    x: [0, 3, 0],
                                    rotate: [0, 10, 0],
                                    transition: {
                                        duration: 0.6,
                                        repeat: 3,
                                        ease: "easeInOut",
                                    },
                                },
                            }}
                            className="inline-flex"
                        >
                            <ArrowRight />
                        </motion.span>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
