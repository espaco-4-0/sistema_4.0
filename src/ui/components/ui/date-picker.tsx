"use client";

import * as React from "react";
import { Button } from "@/src/ui/components/ui/button";
import { Calendar } from "@/src/ui/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/ui/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ChevronDownIcon } from "lucide-react";

interface DatePickerProps {
    date?: Date;
    onDateChange: (date: Date | undefined) => void;
    placeholder?: string;
    className?: string;
    onBlur?: () => void;
}

export function DatePicker({
    date,
    onDateChange,
    placeholder = "Selecione uma data",
    className,
    onBlur,
}: Readonly<DatePickerProps>) {
    const [open, setOpen] = React.useState(false);

    return (
        <Popover
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);
                if (!nextOpen) {
                    onBlur?.();
                }
            }}
        >
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    data-empty={!date}
                    className={`data-[empty=true]:text-muted-foreground w-full justify-between text-left font-normal ${className}`}
                    onBlur={onBlur}
                >
                    {date ? format(date, "PPP", { locale: ptBR }) : <span>{placeholder}</span>}
                    <ChevronDownIcon className="size-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={onDateChange}
                    defaultMonth={date}
                    locale={ptBR}
                    captionLayout="dropdown"
                />
            </PopoverContent>
        </Popover>
    );
}
