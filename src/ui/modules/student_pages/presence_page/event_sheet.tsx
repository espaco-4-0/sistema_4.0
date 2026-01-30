import { useEffect, useState } from "react";
import { EventSituation } from "@/src/infra/modules/student/presences-mock";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/src/ui/components/ui/sheet";
import { X } from "lucide-react";
import { toast } from "sonner";

import EventInformatons from "./event_informations";
import PresenceForm from "./presence_form";
import SheetBadge from "./sheet_badge";
import StatusCard from "./status_card";

/* -------------------------------------------------------------------------- */
/*                                Event Sheet                                 */
/* -------------------------------------------------------------------------- */

interface EventSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    situation: EventSituation;
    start?: Date;
    date: string;
    instructor: string;
    location: string;
    observation: string;
    eventId?: string | number;
    onSituationChange?: (id: string | number, s: EventSituation) => void;
}

export default function EventSheet(props: Readonly<EventSheetProps>) {
    const {
        isOpen,
        onOpenChange,
        title,
        description,
        situation,
        start,
        date,
        instructor,
        location,
        observation,
        eventId,
        onSituationChange,
    } = props;

    const [state, setState] = useState<EventSituation>("pending");
    const [response, setResponse] = useState<"" | "present" | "absent">("");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [registeredAt, setRegisteredAt] = useState<string | undefined>();

    const isPast = start ? start < new Date() : false;

    useEffect(() => {
        setState(situation);
        setResponse("");
        setReason("");
        setLoading(false);
        if (situation === "pending") setRegisteredAt(undefined);
    }, [situation, isOpen]);

    const formatNow = () =>
        new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }).format(new Date());

    const updateStatus = (newStatus: EventSituation, message: () => void) => {
        setLoading(true);
        setTimeout(() => {
            setState(newStatus);
            eventId && onSituationChange?.(eventId, newStatus);
            message();
            if (newStatus !== "pending") setRegisteredAt(formatNow());
            setLoading(false);
        }, 1500);
    };

    const handleSubmit = () => {
        if (response === "present") {
            updateStatus("confirmed", () =>
                toast.success("Presença confirmada", { description: "Presença registrada com sucesso." })
            );
        } else {
            updateStatus("absent", () =>
                toast.error("Ausência registrada", { description: "Ausência registrada com sucesso." })
            );
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="w-full lg:w-140 2xl:w-140! max-w-none! [&>button:first-of-type]:hidden">
                <SheetHeader className="border-b flex flex-row items-center justify-between p-4 lg:p-5 2xl:p-6">
                    <SheetTitle className="text-lg lg:text-xl 2xl:text-2xl font-medium">Detalhes do evento</SheetTitle>
                    <SheetClose className="cursor-pointer hover:bg-gray-100 rounded-2xl transition-all p-2">
                        <X />
                    </SheetClose>
                </SheetHeader>

                <div className="p-4 lg:p-5 2xl:p-6 overflow-y-auto">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl lg:text-2xl 2xl:text-3xl font-bold">{title}</h2>
                        <SheetBadge eventSituation={state} />
                    </div>

                    <SheetDescription className="my-3 lg:my-3.5 2xl:my-4 text-sm lg:text-base">
                        {description}
                    </SheetDescription>

                    <EventInformatons
                        date={date}
                        start={start}
                        instructor={instructor}
                        location={location}
                        observation={observation}
                    />

                    <hr className="my-4 lg:my-4.5 2xl:my-5" />
                    <h3 className="text-lg lg:text-xl 2xl:text-xl font-semibold">Controle de Presença</h3>

                    {state === "pending" ? (
                        <PresenceForm
                            isPast={isPast}
                            isLoading={loading}
                            value={response}
                            absenceReason={reason}
                            onChangeValue={setResponse}
                            onChangeReason={setReason}
                            onSubmit={handleSubmit}
                            onCancel={() => onOpenChange(false)}
                        />
                    ) : (
                        <StatusCard
                            type={state}
                            canAlter={!isPast}
                            isLoading={loading}
                            registeredAt={registeredAt}
                            onAlter={() => updateStatus("pending", () => toast.info("Status alterado"))}
                            onClose={() => onOpenChange(false)}
                        />
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
