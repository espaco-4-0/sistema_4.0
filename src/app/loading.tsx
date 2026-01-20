import { Cat } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-white gap-8">
      <div className="relative flex items-center justify-center w-24 h-24">
        <div className="absolute inset-0 border-2 border-dashed border-slate-400 rounded-full animate-[spin_8s_linear_infinite]"></div>
        <div className="absolute w-20 h-20 border border-slate-100 rounded-full"></div>
        <div className="text-slate-700 animate-bounce">
          <Cat size={40} strokeWidth={1.5} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-slate-600 font-medium tracking-widest uppercase text-xs">
          Carregando
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
