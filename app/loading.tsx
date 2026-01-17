

export default function loading(){
	return(
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
			<div className="flex flex-col items-center gap-4">
				<div className="h-16 w-16 animate-spin rounded-full border-4 border-black border-t-yellow-400"></div>
				<p className="text-sm font-bold uppercase tracking-widset text-yellow drop-shadow-md">
					Carregando...
				</p>
			</div>
		</div>
	)
}
