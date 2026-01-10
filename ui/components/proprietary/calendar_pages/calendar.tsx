"use client"

import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer, SlotInfo } from 'react-big-calendar';
import { format, isSameDay, parse, startOfWeek, getDay, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { useForm, Controller } from 'react-hook-form';
import { Calendar as CalendarIcon, MapPin, Clock, CheckCircle2, Loader2, ChevronRight, User, School, ArrowLeft, Plus, Users, Phone } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Link from 'next/link';

interface IEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    type: 'agendado' | 'aprovado';
    description: string;
    time: string;
    local: string;
    whatsapp?: string;
    quantidade?: string | number;
    professor?: string;
}

interface IFormInput {
    instituicao: string;
    professor: string;
    email: string;
    whatsapp: string;
    quantidade: string;
    hora: string;
    horaSaida: string;
    mensagem: string;
}

const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const timeOptions = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

export default function AllCalendar() {
    const [viewDate, setViewDate] = useState<Date>(new Date(2026, 5, 1));
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [step, setStep] = useState<'idle' | 'list' | 'form' | 'detail' | 'loading' | 'success'>('idle');
    const [selectedEventId, setSelectedEventId] = useState<number>(0);

    const { control, handleSubmit, reset } = useForm<IFormInput>({
        defaultValues: {
            instituicao: '',
            professor: '',
            email: '',
            whatsapp: '',
            quantidade: '',
            hora: '09:00',
            horaSaida: '10:00',
            mensagem: ''
        }
    });

    const [events, setEvents] = useState<IEvent[]>([
        {
            id: 1,
            title: 'Workshop de Impressão 3D',
            start: new Date(2026, 5, 15, 14, 0),
            end: new Date(2026, 5, 15, 16, 0),
            type: 'agendado',
            description: 'Aprenda os fundamentos e tecnologias de impressão 3D.',
            time: '14:00 - 16:00',
            local: 'Espaço 4.0',
            quantidade: '20',
            whatsapp: '(00) 00000-0000'
        }
    ]);

    const onSubmit = (data: IFormInput) => {
        setStep('loading');
        setTimeout(() => {
            const [startHour, startMin] = data.hora.split(':').map(Number);
            const [endHour, endMin] = data.horaSaida.split(':').map(Number);

            const startDate = setMinutes(setHours(new Date(selectedDate), startHour), startMin);
            const endDate = setMinutes(setHours(new Date(selectedDate), endHour), endMin);

            const finalEndDate = endDate < startDate ? startDate : endDate;

            const newEvent: IEvent = {
                id: Date.now(),
                title: `Visita: ${data.instituicao}`,
                start: startDate,
                end: finalEndDate,
                type: 'aprovado',
                description: data.mensagem || 'Solicitação de visita técnica.',
                time: `${data.hora} - ${data.horaSaida}`,
                local: 'Espaço 4.0',
                professor: data.professor,
                whatsapp: data.whatsapp,
                quantidade: data.quantidade
            };
            setEvents([...events, newEvent]);
            setStep('success');
        }, 1500);
    };

    const handleSelectSlot = (slotInfo: SlotInfo) => {
        const date = slotInfo.start;
        if (!date) return;

        setSelectedDate(date);
        const dayEvents = events.filter(e => isSameDay(e.start, date));
        setStep(dayEvents.length > 0 ? 'list' : 'form');
    };

    const dayPropGetter = (date: Date) => {
        const dayEvents = events.filter(e => isSameDay(e.start, date));
        const isSelected = isSameDay(selectedDate, date);
        let className = "transition-all duration-200 ";

        if (dayEvents.some(e => e.type === 'aprovado')) className += "!bg-green-50";
        else if (isSelected) className += "!bg-blue-50";
        else if (dayEvents.some(e => e.type === 'agendado')) className += "!bg-amber-50";

        return { className };
    };

    const activeEvent = events.find(e => e.id === selectedEventId);

    return (
        <section className="bg-gray-50 min-h-screen py-8 px-4 md:px-20 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className='text-yellow-600 p-2 pb-4 flex items-center gap-1 text-xs font-medium'>
                    <Link href="/" className="text-gray-400 hover:underline">Home</Link>
                    <ChevronRight size={12} className="text-gray-400"/>
                    <span>Calendário Espaço 4.0</span>
                </div>

                <header className="mb-6">
                    <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight">
                        Programação do <span className="text-[#fdc700]">Espaço 4.0</span>
                    </h2>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-8 bg-white border rounded-xl p-4 shadow-sm">
                        <Calendar
                            localizer={localizer}
                            events={events}
                            date={viewDate}
                            onNavigate={(date) => setViewDate(date)}
                            selectable
                            onSelectSlot={handleSelectSlot}
                            onSelectEvent={(ev) => {
                                setSelectedDate(ev.start);
                                setStep('list');
                            }}
                            style={{ height: 480 }}
                            culture='pt-BR'
                            views={['month']}
                            dayPropGetter={dayPropGetter}
                            eventPropGetter={(event) => ({
                                className: event.type === 'agendado'
                                    ? '!bg-[#fcc700] !text-black !text-[10px] font-bold border-none rounded px-1'
                                    : '!bg-green-500 !text-white !text-[10px] font-bold border-none rounded px-1'
                            })}
                            messages={{ next: ">", previous: "<", today: "Hoje" }}
                        />
                    </div>

                    <aside className="lg:col-span-4 min-h-[520px]">
                        {step === 'idle' && (
                            <PanelWrapper>
                                <CalendarIcon className="w-12 h-12 text-gray-200 mb-3" />
                                <p className="text-gray-400 text-sm text-center">Selecione uma data para interagir</p>
                            </PanelWrapper>
                        )}

                        {step === 'list' && (
                            <PanelWrapper align="start">
                                <div className="flex items-center justify-between w-full mb-4 border-b pb-2">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase">{format(selectedDate, 'dd/MM/yyyy')}</h3>
                                    <button onClick={() => setStep('form')} className="p-1.5 bg-yellow-400 hover:bg-yellow-500 rounded-full transition-colors" title="Agendar Visita">
                                        <Plus size={16} className="text-black"/>
                                    </button>
                                </div>
                                <div className="w-full space-y-2 overflow-y-auto max-h-75 pr-1">
                                    {events.filter(e => isSameDay(e.start, selectedDate)).map(e => (
                                        <div key={e.id} onClick={() => { setSelectedEventId(e.id); setStep('detail'); }} className="p-2.5 border border-gray-100 rounded-lg hover:border-yellow-300 cursor-pointer bg-white flex items-center gap-3 transition-all shadow-sm">
                                            <div className={`w-1 h-6 rounded-full ${e.type === 'agendado' ? 'bg-yellow-400' : 'bg-green-500'}`}></div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-[11px] font-bold text-gray-800 uppercase truncate">{e.title}</p>
                                                <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5"><Clock size={10}/> {e.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {events.filter(e => isSameDay(e.start, selectedDate)).length === 0 && (
                                        <p className="text-xs text-gray-400 text-center py-4">Nenhum evento neste dia.</p>
                                    )}
                                </div>
                                <button onClick={() => setStep('idle')} className="mt-auto w-full py-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-gray-600 transition-colors">Fechar Painel</button>
                            </PanelWrapper>
                        )}

                        {step === 'form' && (
                            <PanelWrapper align="start">
                                <div className="flex items-center gap-2 mb-4">
                                    <button onClick={() => setStep('idle')} className="text-gray-400 hover:text-black transition-colors"><ArrowLeft size={16}/></button>
                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Nova Solicitação</span>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-3">
                                    <div className="grid gap-2.5">
                                        <div className="relative">
                                            <School className="absolute left-2.5 top-2.5 text-gray-400" size={14}/>
                                            <input {...control.register('instituicao', { required: true })} className="w-full border border-gray-200 rounded-md py-2 pl-8 pr-2 text-xs outline-none focus:border-yellow-400" placeholder="Instituição" />
                                        </div>
                                        <div className="relative">
                                            <User className="absolute left-2.5 top-2.5 text-gray-400" size={14}/>
                                            <input {...control.register('professor', { required: true })} className="w-full border border-gray-200 rounded-md py-2 pl-8 pr-2 text-xs outline-none focus:border-yellow-400" placeholder="Professor Responsável" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="relative">
                                                <Phone className="absolute left-2.5 top-2.5 text-gray-400" size={14}/>
                                                <input {...control.register('whatsapp', { required: true })} className="w-full border border-gray-200 rounded-md py-2 pl-8 pr-2 text-xs outline-none focus:border-yellow-400" placeholder="WhatsApp" />
                                            </div>
                                            <div className="relative">
                                                <Users className="absolute left-2.5 top-2.5 text-gray-400" size={14}/>
                                                <input {...control.register('quantidade', { required: true })} type="number" className="w-full border border-gray-200 rounded-md py-2 pl-8 pr-2 text-xs outline-none focus:border-yellow-400" placeholder="Pessoas" />
                                            </div>
                                        </div>

                                        <input {...control.register('email', { required: true })} type="email" className="w-full border border-gray-200 rounded-md py-2 px-3 text-xs outline-none focus:border-yellow-400" placeholder="Email para contato" />

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">Início</span>
                                                <Controller
                                                    name="hora"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger className="w-full h-9 border-gray-200 text-xs bg-white">
                                                                <SelectValue placeholder="Início" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-white max-h-40">
                                                                {timeOptions.map((t) => (
                                                                    <SelectItem key={`start-${t}`} value={t} className="text-xs">{t}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">Fim</span>
                                                <Controller
                                                    name="horaSaida"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger className="w-full h-9 border-gray-200 text-xs bg-white">
                                                                <SelectValue placeholder="Fim" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-white max-h-40">
                                                                {timeOptions.map((t) => (
                                                                    <SelectItem key={`end-${t}`} value={t} className="text-xs">{t}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <textarea {...control.register('mensagem')} className="w-full border border-gray-200 rounded-md p-2 text-xs outline-none focus:border-yellow-400 resize-none" placeholder="Objetivo da visita (opcional)" rows={2} />
                                    </div>
                                    <button type="submit" className="w-full bg-black text-white hover:bg-gray-800 font-bold py-2.5 rounded-md text-[11px] uppercase transition-all shadow-sm">Confirmar Agendamento</button>
                                </form>
                            </PanelWrapper>
                        )}

                        {step === 'detail' && activeEvent && (
                            <PanelWrapper align="start">
                                <button onClick={() => setStep('list')} className="text-[10px] font-bold text-gray-400 mb-4 flex items-center gap-1 uppercase hover:text-black">
                                    <ArrowLeft size={12}/> Voltar
                                </button>
                                <div className="w-full">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${activeEvent.type === 'agendado' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                        {activeEvent.type === 'agendado' ? 'Workshop' : 'Visita Técnica'}
                                    </span>
                                    <h3 className="text-base font-bold text-gray-800 mt-2 mb-1">{activeEvent.title}</h3>
                                    <p className="text-[11px] text-gray-500 leading-relaxed mb-4">{activeEvent.description}</p>

                                    <div className="space-y-2.5 border-t pt-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                            <Clock size={14} className="text-yellow-500"/> {activeEvent.time}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                            <MapPin size={14} className="text-yellow-500"/> {activeEvent.local}
                                        </div>
                                        {activeEvent.quantidade && (
                                            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                                <Users size={14} className="text-yellow-500"/> {activeEvent.quantidade} pessoas
                                            </div>
                                        )}
                                        {activeEvent.whatsapp && (
                                            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                                <Phone size={14} className="text-yellow-500"/> {activeEvent.whatsapp}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => setStep('idle')} className="mt-auto w-full bg-gray-50 text-gray-400 font-bold py-2 rounded-md text-[10px] uppercase hover:bg-gray-100 transition-all">Fechar</button>
                            </PanelWrapper>
                        )}

                        {step === 'loading' && (
                            <PanelWrapper>
                                <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                                <p className="text-[11px] font-bold text-gray-400 uppercase mt-2">Processando...</p>
                            </PanelWrapper>
                        )}

                        {step === 'success' && (
                            <PanelWrapper>
                                <div className="bg-green-50 p-3 rounded-full mb-3">
                                    <CheckCircle2 size={32} className="text-green-500" />
                                </div>
                                <h3 className="text-green-600 font-bold text-sm uppercase">Agendado!</h3>
                                <p className="text-[10px] text-gray-400 mt-1 text-center">Aguardamos vocês no Espaço 4.0</p>
                                <button onClick={() => { setStep('idle'); reset(); }} className="mt-6 text-[10px] font-bold text-black border-b-2 border-yellow-400 uppercase">Voltar</button>
                            </PanelWrapper>
                        )}
                    </aside>
                </div>
            </div>
        </section>
    );
}

interface PanelWrapperProps {
    children: React.ReactNode;
    align?: "center" | "start";
}

const PanelWrapper = ({ children, align = "center" }: PanelWrapperProps) => (
    <div className={`h-full min-h-[520px] bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col ${align === 'center' ? 'items-center justify-center' : 'items-start'}`}>
        {children}
    </div>
);
