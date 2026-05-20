"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import { cn } from "@/src/ui/lib/utils";

export function Field({
    label,
    children,
    className,
}: {
    label: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("space-y-2", className)}>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">{label}</label>
            {children}
        </div>
    );
}

export function TextInput({
    value,
    onChange,
    placeholder,
    maxLength,
    minLength,
    mono = false,
    className,
    ...props
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    maxLength?: number;
    minLength?: number;
    mono?: boolean;
    className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
    const isBelowMin = minLength && value.length < minLength;
    const isFull = maxLength && value.length >= maxLength;

    return (
        <div className={cn("relative group", className)}>
            <input
                type="text"
                placeholder={placeholder}
                maxLength={maxLength}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    "w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-yellow-400 focus:bg-white transition-all text-gray-800 placeholder:text-gray-300 font-medium",
                    mono && "font-mono text-xs py-3",
                    isBelowMin && value.length > 0 && "border-orange-200"
                )}
                {...props}
            />
            {(maxLength || minLength) && (
                <span
                    className={cn(
                        "absolute right-4 bottom-4 text-[10px] font-bold transition-colors",
                        isBelowMin ? "text-orange-400" : (isFull ? "text-red-400" : "text-gray-300 group-focus-within:text-yellow-500")
                    )}
                >
                    {isBelowMin ? `${value.length} / mínimo ${minLength}` : `${value.length}${maxLength ? ` / ${maxLength}` : ""}`}
                </span>
            )}
        </div>
    );
}

export function TextArea({
    value,
    onChange,
    placeholder,
    maxLength,
    minLength,
    minHeight = "100px",
    className,
    ...props
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    maxLength?: number;
    minLength?: number;
    minHeight?: string;
    className?: string;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">) {
    const isBelowMin = minLength && value.length < minLength;
    const isFull = maxLength && value.length >= maxLength;

    return (
        <div className={cn("relative group", className)}>
            <textarea
                placeholder={placeholder}
                maxLength={maxLength}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{ minHeight }}
                className={cn(
                    "w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-yellow-400 focus:bg-white transition-all text-gray-800 placeholder:text-gray-300 font-medium resize-none",
                    isBelowMin && value.length > 0 && "border-orange-200"
                )}
                {...props}
            />
            {(maxLength || minLength) && (
                <span
                    className={cn(
                        "absolute right-4 bottom-4 text-[10px] font-bold transition-colors",
                        isBelowMin ? "text-orange-400" : (isFull ? "text-red-400" : "text-gray-300 group-focus-within:text-yellow-500")
                    )}
                >
                    {isBelowMin ? `${value.length} / mínimo ${minLength}` : `${value.length}${maxLength ? ` / ${maxLength}` : ""}`}
                </span>
            )}
        </div>
    );
}

export function SimpleSelect({
    value,
    onValueChange,
    placeholder,
    items,
    className,
}: {
    value: string;
    onValueChange: (v: string) => void;
    placeholder?: string;
    items: { key: string; value: string; label: string }[];
    className?: string;
}) {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger
                className={cn(
                    "w-full px-5 py-6 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-0 focus:border-yellow-400 focus:bg-white transition-all text-gray-800 font-medium shadow-none",
                    className
                )}
            >
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-gray-100 rounded-2xl shadow-xl p-2">
                {items.length > 0 ? (
                    items.map(({ key, value, label }) => (
                        <SelectItem
                            key={key}
                            value={value}
                            className="rounded-xl py-3 focus:bg-yellow-50 focus:text-yellow-900 cursor-pointer"
                        >
                            {label}
                        </SelectItem>
                    ))
                ) : (
                    <SelectItem value="none" disabled className="text-gray-400 italic">
                        Nenhum item encontrado
                    </SelectItem>
                )}
            </SelectContent>
        </Select>
    );
}
