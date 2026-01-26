import { PlusCircle } from "lucide-react";


export default function Recursos(){


	return(
		<div className="space-y-6 p-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between">
				<h2 className="text-xl font-semibold text-gray-800">Visao geral de Recursos</h2>
				<div className="gap-2">
					<button className=" flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition shadow-sm text-sm font-medium">
						<PlusCircle size={18} /> Importar Recursos
					</button>
				</div>
			</div>

		</div>
	)
}
