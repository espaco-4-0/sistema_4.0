"use client"

import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, isSameDay, parse, startOfWeek, getDay, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { useForm, Controller, UseFormReturn, UseFormRegisterReturn, Control } from 'react-hook-form';
import { Calendar as CalendarIcon, MapPin, Clock, CheckCircle2, Loader2, ChevronRight, User, School, ArrowLeft, Plus, Users, Phone, Home } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface IEvent {
    id: number; title: string; start: Date; end: Date; type: 'agendado' | 'aprovado';
    description: string; time: string; local: string; whatsapp?: string; quantidade?: string | number; professor?: string;
}

interface IFormInput {
    instituicao: string; professor: string; email: string; whatsapp: string;
    quantidade: string; hora: string; horaSaida: string; mensagem: string;
}

const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const timeOptions = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const monthMap: { [key: string]: number } = { 'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5, 'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11 };

const initialEvents: IEvent[] = [
    { id: 1, title: 'Workshop de Impressão 3D', start: new Date(2026, 5, 15, 14, 0), end: new Date(2026, 5, 15, 16, 0), type: 'agendado', description: 'Aprenda os fundamentos e tecnologias da impressão 3D.', time: '14:00 - 16:00', local: 'Espaço 4.0', quantidade: '20' },
    { id: 2, title: 'Introdução à Robótica Educacional', start: new Date(2026, 5, 18, 15, 0), end: new Date(2026, 5, 18, 17, 0), type: 'agendado', description: 'Explore conceitos básicos de robótica com atividades práticas.', time: '15:00 - 17:00', local: 'Espaço 4.0', quantidade: '15' },
    { id: 3, title: 'Curso Básico de Programação', start: new Date(2026, 5, 22, 14, 0), end: new Date(2026, 5, 22, 16, 0), type: 'agendado', description: 'Aprenda lógica de programação e desenvolvimento de software.', time: '14:00 - 16:00', local: 'Espaço 4.0', quantidade: '20' },
    { id: 4, title: 'Oficina de Tecnologia e Criatividade', start: new Date(2026, 5, 28, 16, 0), end: new Date(2026, 5, 28, 18, 0), type: 'agendado', description: 'Desenvolva projetos criativos utilizando tecnologia.', time: '16:00 - 18:00', local: 'Espaço 4.0', quantidade: '25' }
];

export default function AllCalendar() {
    const searchParams = useSearchParams();

    const getInitialState = () => {
        const day = searchParams.get('day');
        const month = searchParams.get('month');
        if (day && month && monthMap[month.toLowerCase()] !== undefined) {
            const target = new Date(2026, monthMap[month.toLowerCase()], Number.parseInt(day));
            return { date: target, step: 'list' as const };
        }
        return { date: new Date(2026, 5, 1), step: 'idle' as const };
    };

    const initialState = getInitialState();

    const [viewDate, setViewDate] = useState<Date>(initialState.date);
    const [selectedDate, setSelectedDate] = useState<Date>(initialState.date);
    const [step, setStep] = useState<'idle' | 'list' | 'form' | 'detail' | 'loading' | 'success'>(initialState.step);

    const [selectedEventId, setSelectedEventId] = useState<number>(0);
    const [events, setEvents] = useState<IEvent[]>(initialEvents);

    const formMethods = useForm<IFormInput>({ defaultValues: { instituicao: '', professor: '', email: '', whatsapp: '', quantidade: '', hora: '09:00', horaSaida: '10:00', mensagem: '' } });

    const handleFormSubmit = (data: IFormInput) => {
        setStep('loading');
        setTimeout(() => {
            const [sh, sm] = data.hora.split(':').map(Number);
            const [eh, em] = data.horaSaida.split(':').map(Number);
            const start = setMinutes(setHours(new Date(selectedDate), sh), sm);
            let end = setMinutes(setHours(new Date(selectedDate), eh), em);
            if (end < start) end = start;

            const newEvent: IEvent = {
                id: Date.now(), title: `Visita: ${data.instituicao}`, start, end, type: 'aprovado',
                description: data.mensagem || 'Solicitação de visita.', time: `${data.hora} - ${data.horaSaida}`,
                local: 'Espaço 4.0', professor: data.professor, whatsapp: data.whatsapp, quantidade: data.quantidade
            };
            setEvents([...events, newEvent]);
            setStep('success');
            formMethods.reset();
        }, 1500);
    };

    const activeEvent = events.find(e => e.id === selectedEventId);
    const dayEvents = events.filter(e => isSameDay(e.start, selectedDate));

    return (
        <section className="bg-gray-50 min-h-screen py-8 px-4 md:px-20 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className='text-yellow-600 p-2 pb-4 flex items-center gap-1 text-xs font-medium'>
                    <Link href="/" className="text-gray-400 hover:underline flex gap-1"><Home className='h-3 w-3'/>Home</Link>
                    <ChevronRight size={12} className="text-gray-400"/> <span>Calendário Espaço 4.0</span>
                </div>

                <header className="mb-6"><h2 className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight">Programação do <span className="text-[#fdc700]">Espaço 4.0</span></h2></header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-8 bg-white border rounded-xl p-4 shadow-sm">
                        <Calendar
                            localizer={localizer} events={events} date={viewDate} onNavigate={setViewDate}
                            selectable onSelectSlot={(slot) => { setSelectedDate(slot.start); setStep(events.some(e => isSameDay(e.start, slot.start)) ? 'list' : 'form'); }}
                            onSelectEvent={(ev) => { setSelectedDate(ev.start); setStep('list'); }}
                            style={{ height: 480 }} culture='pt-BR' views={['month']}
                            dayPropGetter={(date) => {
                                const hasEv = events.filter(e => isSameDay(e.start, date));
                                let cls = "transition-all ";
                                if (hasEv.some(e => e.type === 'aprovado')) cls += "!bg-green-50";
                                else if (isSameDay(selectedDate, date)) cls += "!bg-blue-50";
                                else if (hasEv.some(e => e.type === 'agendado')) cls += "!bg-amber-50";
                                return { className: cls };
                            }}
                            eventPropGetter={(ev) => ({ className: ev.type === 'agendado' ? '!bg-[#fcc700] !text-black !text-[10px] font-bold border-none' : '!bg-green-500 !text-white !text-[10px] font-bold border-none' })}
                            messages={{ next: ">", previous: "<", today: "Hoje" }}
                        />
                    </div>

                    <aside className="lg:col-span-4 min-h-[520px]">
                        <PanelWrapper align={step === 'list' || step === 'form' || step === 'detail' ? 'start' : 'center'}>
                            {step === 'idle' && <IdleState />}
                            {step === 'list' && <EventList date={selectedDate} events={dayEvents} onAdd={() => setStep('form')} onSelect={(id) => { setSelectedEventId(id); setStep('detail'); }} onClose={() => setStep('idle')} />}
                            {step === 'form' && <BookingForm methods={formMethods} onSubmit={handleFormSubmit} onCancel={() => setStep('idle')} />}
                            {step === 'detail' && activeEvent && <EventDetail event={activeEvent} onBack={() => setStep('list')} onClose={() => setStep('idle')} />}
                            {step === 'loading' && <LoadingState />}
                            {step === 'success' && <SuccessState onBack={() => { setStep('idle'); formMethods.reset(); }} />}
                        </PanelWrapper>
                    </aside>
                </div>
            </div>
        </section>
    );
}

const PanelWrapper = ({ children, align }: { children: React.ReactNode, align: "center" | "start" }) => (
    <div className={`h-full min-h-[520px] bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col ${align === 'center' ? 'items-center justify-center' : 'items-start'}`}>{children}</div>
);

const IdleState = () => (
    <>
        <CalendarIcon className="w-12 h-12 text-gray-200 mb-3" />
        <p className="text-gray-400 text-sm text-center">Selecione uma data para interagir</p>
    </>
);

const LoadingState = () => (
    <>
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
        <p className="text-[11px] font-bold text-gray-400 uppercase mt-2">Processando...</p>
    </>
);

const SuccessState = ({ onBack }: { onBack: () => void }) => (
    <>
        <div className="bg-green-50 p-3 rounded-full mb-3"><CheckCircle2 size={32} className="text-green-500" /></div>
        <h3 className="text-green-600 font-bold text-sm uppercase">Agendado!</h3>
        <button onClick={onBack} className="mt-6 text-[10px] font-bold text-black border-b-2 border-yellow-400 uppercase">Voltar</button>
    </>
);

const EventList = ({ date, events, onAdd, onSelect, onClose }: { date: Date, events: IEvent[], onAdd: () => void, onSelect: (id: number) => void, onClose: () => void }) => (
    <>
        <div className="flex items-center justify-between w-full mb-4 border-b pb-2">
            <h3 className="text-sm font-bold text-gray-700 uppercase">{format(date, 'dd/MM/yyyy')}</h3>
            <button onClick={onAdd} className="p-1.5 bg-yellow-400 hover:bg-yellow-500 rounded-full"><Plus size={16} className="text-black"/></button>
        </div>
        <div className="w-full space-y-2 overflow-y-auto max-h-75 pr-1">
            {events.length > 0 ? events.map(e => (
                <button
                    key={e.id}
                    type="button"
                    onClick={() => onSelect(e.id)}
                    className="w-full text-left p-2.5 border border-gray-100 rounded-lg hover:border-yellow-300 cursor-pointer bg-white flex items-center gap-3 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                    <div className={`w-1 h-6 rounded-full ${e.type === 'agendado' ? 'bg-yellow-400' : 'bg-green-500'}`}></div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-[11px] font-bold text-gray-800 uppercase truncate">{e.title}</p>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5"><Clock size={10}/> {e.time}</p>
                    </div>
                </button>
            )) : <p className="text-xs text-gray-400 text-center py-4">Nenhum evento neste dia.</p>}
        </div>
        <button onClick={onClose} className="mt-auto w-full py-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-gray-600">Fechar Painel</button>
    </>
);

const EventDetail = ({ event, onBack, onClose }: { event: IEvent, onBack: () => void, onClose: () => void }) => (
    <>
        <button onClick={onBack} className="text-[10px] font-bold text-gray-400 mb-4 flex items-center gap-1 uppercase hover:text-black"><ArrowLeft size={12}/> Voltar</button>
        <div className="w-full">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${event.type === 'agendado' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{event.type === 'agendado' ? 'Workshop' : 'Visita Técnica'}</span>
            <h3 className="text-base font-bold text-gray-800 mt-2 mb-1">{event.title}</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed mb-4">{event.description}</p>
            <div className="space-y-2.5 border-t pt-4">
                <InfoRow icon={<Clock size={14}/>} text={event.time} />
                <InfoRow icon={<MapPin size={14}/>} text={event.local} />
                {event.quantidade && <InfoRow icon={<Users size={14}/>} text={`${event.quantidade} pessoas`} />}
                {event.whatsapp && <InfoRow icon={<Phone size={14}/>} text={event.whatsapp} />}
            </div>
        </div>
        <button onClick={onClose} className="mt-auto w-full bg-gray-50 text-gray-400 font-bold py-2 rounded-md text-[10px] uppercase hover:bg-gray-100">Fechar</button>
    </>
);

const InfoRow = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <div className="flex items-center gap-2 text-xs text-gray-600 font-medium"><span className="text-yellow-500">{icon}</span> {text}</div>
);

const BookingForm = ({ methods, onSubmit, onCancel }: { methods: UseFormReturn<IFormInput>, onSubmit: (d: IFormInput) => void, onCancel: () => void }) => (
    <>
        <div className="flex items-center gap-2 mb-4">
            <button onClick={onCancel} className="text-gray-400 hover:text-black"><ArrowLeft size={16}/></button>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Nova Solicitação</span>
        </div>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="w-full space-y-3">
            <div className="grid gap-2.5">
                <InputWithIcon icon={<School size={14}/>} register={methods.register('instituicao', { required: true })} placeholder="Instituição" />
                <InputWithIcon icon={<User size={14}/>} register={methods.register('professor', { required: true })} placeholder="Professor Responsável" />
                <div className="grid grid-cols-2 gap-2">
                    <InputWithIcon icon={<Phone size={14}/>} register={methods.register('whatsapp', { required: true })} placeholder="WhatsApp" />
                    <InputWithIcon icon={<Users size={14}/>} register={methods.register('quantidade', { required: true })} type="number" placeholder="Pessoas" />
                </div>
                <input {...methods.register('email', { required: true })} type="email" className="w-full border border-gray-200 rounded-md py-2 px-3 text-xs outline-none focus:border-yellow-400" placeholder="Email" />
                <div className="grid grid-cols-2 gap-2">
                    <TimeSelect label="Início" name="hora" control={methods.control} />
                    <TimeSelect label="Fim" name="horaSaida" control={methods.control} />
                </div>
                <textarea {...methods.register('mensagem')} className="w-full border border-gray-200 rounded-md p-2 text-xs outline-none focus:border-yellow-400 resize-none" placeholder="Objetivo (opcional)" rows={2} />
            </div>
            <button type="submit" className="w-full bg-black text-white hover:bg-gray-800 font-bold py-2.5 rounded-md text-[11px] uppercase shadow-sm">Confirmar</button>
        </form>
    </>
);

interface InputWithIconProps {
    icon: React.ReactNode;
    register: UseFormRegisterReturn;
    type?: string;
    placeholder: string;
}

const InputWithIcon = ({ icon, register, type = "text", placeholder }: InputWithIconProps) => (
    <div className="relative">
        <div className="absolute left-2.5 top-2.5 text-gray-400">{icon}</div>
        <input {...register} type={type} className="w-full border border-gray-200 rounded-md py-2 pl-8 pr-2 text-xs outline-none focus:border-yellow-400" placeholder={placeholder} />
    </div>
);

interface TimeSelectProps {
    label: string;
    name: keyof IFormInput;
    control: Control<IFormInput>;
}

const TimeSelect = ({ label, name, control }: TimeSelectProps) => (
    <div className="space-y-1">
        <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">{label}</span>
        <Controller name={name} control={control} render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full h-9 border-gray-200 text-xs bg-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white max-h-40">{timeOptions.map((t) => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
            </Select>
        )} />
    </div>
);
