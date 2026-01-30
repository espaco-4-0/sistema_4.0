import { EventSituation } from "@/src/infra/modules/student/presences-mock";
import { Badge } from "@/src/ui/components/ui/badge";
import { AlertCircleIcon, Check, CircleX } from "lucide-react";

interface BadgeConfig {
    icon: React.ComponentType<{ size: number; className?: string }>;
    text: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
}

const getBadgeConfig = (situation: EventSituation): BadgeConfig => {
    const configs: Record<EventSituation, BadgeConfig> = {
        confirmed: {
            icon: Check,
            text: "Presença confirmada",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            textColor: "text-green-700",
        },
        absent: {
            icon: CircleX,
            text: "Ausência registrada",
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
            textColor: "text-red-700",
        },
        pending: {
            icon: AlertCircleIcon,
            text: "Aguardando confirmação",
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-200",
            textColor: "text-yellow-700",
        },
    };
    return configs[situation];
};

interface SheetBadgeProps {
    eventSituation: EventSituation;
}

export default function SheetBadge({ eventSituation }: Readonly<SheetBadgeProps>) {
    const badge = getBadgeConfig(eventSituation);

    return (
        <Badge
            className={`h-8 w-auto flex gap-2 ${badge.bgColor} text-xs ${badge.textColor} border-2 ${badge.borderColor}`}
        >
            <badge.icon size={16} />
            {badge.text}
        </Badge>
    );
}
