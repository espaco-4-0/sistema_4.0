import { capitalizeFirstLetter } from "@/src/ui/lib/capitalize";

interface StatsCardProps {
    label: string;
    value: number;
}

export function StatsCard({ label, value }: Readonly<StatsCardProps>) {
    return (
        <div className="relative group mb-3 lg:mb-4 2xl:mb-5">
            <div className="absolute -inset-0.5 bg-linear-to-r from-yellow-primary to-yellow-secondary-dark rounded-xl lg:rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />

            <div className="relative bg-white/90 backdrop-blur-sm rounded-xl lg:rounded-2xl border border-gray-200/50 p-4 lg:p-5 2xl:p-6 hover:border-slate-300/50 shadow-xs transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 lg:w-20 lg:h-20 2xl:w-24 2xl:h-24 bg-linear-to-br from-yellow-primary to-yellow-secondary-dark opacity-5 rounded-bl-full" />

                <span className="text-2xl lg:text-3xl 2xl:text-4xl font-bold bg-linear-to-r from-yellow-primary to-yellow-secondary-dark bg-clip-text text-transparent mb-2 lg:mb-3">
                    {value}
                </span>
                <p className="text-sm lg:text-base 2xl:text-md text-slate-600 font-medium">
                    {capitalizeFirstLetter(label)}
                </p>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-yellow-primary to-yellow-secondary-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
        </div>
    );
}
