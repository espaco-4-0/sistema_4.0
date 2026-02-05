import { format } from "date-fns";
import { Calendar, Clock, Info, MapPin, User } from "lucide-react";

interface EventInformatonsProps {
    date: string;
    start?: Date;
    instructor: string;
    location: string;
    observation: string;
}

export default function EventInformatons({
    date,
    start,
    instructor,
    location,
    observation,
}: Readonly<EventInformatonsProps>) {
    const time = start ? format(start, "HH:mm") : "—";
    const informations = [
        {
            id: 1,
            icon: Calendar,
            title: "Data",
            description: date || "—",
        },
        {
            id: 2,
            icon: Clock,
            title: "Horário",
            description: time,
        },
        {
            id: 3,
            icon: User,
            title: "Instrutor",
            description: instructor || "—",
        },
        {
            id: 4,
            icon: MapPin,
            title: "Local",
            description: location || "—",
        },
        {
            id: 5,
            icon: Info,
            title: "Observação",
            description: observation || "—",
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4">
            {informations.map(({ icon: IconComponent, id, title, description }) => (
                <div
                    key={id}
                    className={`flex items-center flex-row gap-4 items p-4 w-full h-auto bg-gray-description-light/10 border-gray-description-light/60 border text-black rounded-xl ${title === "Observação" && "col-span-2"}`}
                >
                    <IconComponent className="text-yellow-600 bg-yellow-back-icon p-1 rounded-md" size={30} />
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-600">{title}</span>
                        <span className="text-sm font-medium">{description}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
