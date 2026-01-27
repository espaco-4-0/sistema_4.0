import { Calendar, Clock, MapPin, User } from "lucide-react";

const event_informatons = [
    {
        id: 1,
        icon: Calendar,
        tittle: "Data",
        description: "segunda-feira, 22/06/2026",
    },
    {
        id: 2,
        icon: Clock,
        tittle: "Horário",
        description: "14:00 - 18:00",
    },
    {
        id: 3,
        icon: User,
        tittle: "Instrutor",
        description: "Prof. João Oliveira",
    },
    {
        id: 4,
        icon: MapPin,
        tittle: "Local",
        description: "IFAL Arapiraca",
    },
];

export default function EventInformatons() {
    return (
        <div className="grid grid-cols-2 gap-4">
            {event_informatons.map(({ icon: IconComponent, id, tittle, description }) => (
                <div
                    key={id}
                    className="flex items-center flex-row gap-4 items p-4 w-full h-auto bg-gray-description-light/25 text-black rounded-lg"
                >
                    <IconComponent className="text-yellow-primary" size={20} />
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-600">{tittle}</span>
                        <span className="text-sm font-medium capitalize">{description}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
