import { useState } from "react";
import { Info, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InitiativesFilter } from "@/components/InitiativesFilter"; // Reusing filter
import { PrioritizationList } from "@/components/PrioritizationList";
import { type PrioritizationItemData } from "@/components/PrioritizationItem";

// Mock Data matching the screenshot
const initialData: PrioritizationItemData[] = [
    {
        id: "1",
        title: "Automação do processo de admissão",
        type: "Automação",
        priority: "Alta",
        status: "Em Execução",
        deadline: "14/03/2024"
    },
    {
        id: "2",
        title: "Portal do colaborador mobile",
        type: "Novo Projeto",
        priority: "Média",
        status: "Devolvida",
        deadline: "-"
    },
    // Adding more items to demonstrate sorting better
    {
        id: "3",
        title: "Dashboard de vendas em tempo real",
        type: "Novo Projeto",
        priority: "Média",
        status: "Em Análise",
        deadline: "15/01/2024"
    },
    {
        id: "4",
        title: "Integração SPED Fiscal com ERP",
        type: "Integração",
        priority: "Alta",
        status: "Aprovada",
        deadline: "08/01/2024"
    }
];

export default function PrioritizationPage() {
    const [items, setItems] = useState<PrioritizationItemData[]>(initialData);

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Priorização de Backlog do Setor</h1>
                    <p className="text-slate-500 mt-1">Recursos Humanos • Ano de Referência: 2025</p>
                </div>
                <div className="flex gap-3">
                    {/* Reiniciar removed as requested */}
                    <Button className="bg-[#7ab035] hover:bg-[#6a992d] text-white font-semibold shadow-sm">
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Priorização
                    </Button>
                </div>
            </div>

            {/* Info Alert */}
            <div className="bg-[#f0fdf4] border border-green-200 rounded-lg p-4 flex gap-3 text-green-800 text-sm">
                <Info className="w-5 h-5 flex-shrink-0 text-green-600" />
                <p className="leading-relaxed">
                    Nesta tela você deve indicar a prioridade das iniciativas do seu setor para o próximo ciclo. Use o número <strong>1</strong> para a mais prioritária, depois <strong>2</strong>, <strong>3</strong>, e assim por diante. Você também pode solicitar o cancelamento de iniciativas que não fazem mais sentido, informando uma justificativa.
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 font-medium">Filtros</span>
                </div>

                {/* Simplified filter bar or reusing the existing one which fits well */}
                <InitiativesFilter />

                <div className="text-sm text-slate-500 pt-2">
                    {items.length} iniciativas ativas
                </div>
            </div>

            {/* List */}
            <PrioritizationList items={items} onReorder={setItems} />

        </div>
    );
}
