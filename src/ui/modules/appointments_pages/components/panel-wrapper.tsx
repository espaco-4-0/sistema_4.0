import React from "react";

export const PanelWrapper = ({ children, align }: { children: React.ReactNode; align: "center" | "start" }) => (
    <div
        className={`h-full min-h-138 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col ${align === "center" ? "items-center justify-center" : "items-start"}`}
    >
        {children}
    </div>
);
