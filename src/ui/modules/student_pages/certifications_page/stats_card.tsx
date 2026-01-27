import { capitalizeFirstLetter } from "@/src/ui/lib/capitalize";

interface StatsCardProps {
    label: string;
    value: number;
}

export function StatsCard({ label, value }: Readonly<StatsCardProps>) {
    return (
        <div className="relative group my-5">
            <div className="absolute -inset-0.5 bg-linear-to-r from-yellow-primary to-yellow-secondary-dark rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />

            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 hover:border-slate-300/50 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-yellow-primary to-yellow-secondary-dark opacity-5 rounded-bl-full" />

                <div className="relative ">
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-4xl font-bold bg-linear-to-r from-yellow-primary to-yellow-secondary-dark bg-clip-text text-transparent">
                            {value}
                        </span>
                    </div>
                    <p className="text-md text-slate-600 font-medium">{capitalizeFirstLetter(label)}</p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-yellow-primary to-yellow-secondary-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
        </div>
    );
}
