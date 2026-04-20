import React from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

export interface InputWithIconProps {
    icon?: React.ReactNode;
    register: UseFormRegisterReturn;
    type?: string;
    placeholder?: string;
    min?: number;
    max?: number;
    className?: string;
    "aria-label"?: string;
}

export const InputWithIcon: React.FC<InputWithIconProps> = ({
    icon,
    register,
    type = "text",
    placeholder = "",
    min,
    max,
    className = "",
    "aria-label": ariaLabel,
}) => {
    return (
        <div className={`relative ${className}`}>
            {icon && <div className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none">{icon}</div>}
            <input
                {...register}
                type={type}
                min={min}
                max={max}
                aria-label={ariaLabel}
                className={`w-full border border-gray-200 rounded-md py-2 pl-8 pr-2 text-xs outline-none focus:border-yellow-primary ${icon ? "" : "pl-3"}`}
                placeholder={placeholder}
            />
        </div>
    );
};

export default InputWithIcon;
