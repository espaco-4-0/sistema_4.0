"use client"
import { useState, useEffect } from "react";
import { Cog } from "lucide-react";

export default function Loading() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (i >= 100) return;

    const timer = setTimeout(() => {
      setI(i + 1);
    }, 30);

    return () => clearTimeout(timer);
  }, [i]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center backdrop-blur-md gap-8">
      <div className="relative flex items-center justify-center w-24 h-24">
        <div className="absolute inset-0 border-2 border-dashed border-black rounded-full animate-[spin_8s_linear_infinite]"></div>
        <div className="absolute w-20 h-20 border border-slate-100 rounded-full"></div>
        <div className="text-yellow-icon-light animate-[spin_8s_linear_infinite]">
          <Cog size={40} strokeWidth={1.5} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-slate-600 font-medium tracking-widest uppercase text-xs">
          Carregando
        </span>

        <span className="text-slate-800 font-mono font-bold text-lg">
          {i}%
        </span>

        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
        </div>
      </div>
    </div>
  );
}
