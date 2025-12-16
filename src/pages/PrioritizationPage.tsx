import { useEffect, useState } from "react";
import { Info, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InitiativesFilter, type FilterState } from "@/components/InitiativesFilter";
import { PrioritizationList } from "@/components/PrioritizationList";
import { type PrioritizationItemData } from "@/components/PrioritizationItem";
import { initiativesService } from "@/services/initiativesService";

export default function PrioritizationPage() {
    // State
    const [items, setItems] = useState<PrioritizationItemData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<FilterState>({
        search: "",
        status: "",
        type: "",
        sector: "",
        priority: ""
    });

    // Fetch Data
    const fetchInitiatives = async () => {
        setLoading(true);
        try {
            // Clean empty filters before sending
            const activeFilters: Record<string, string> = {};
            Object.entries(filters).forEach(([key, value]) => {
                if (value) activeFilters[key] = value;
            });

            const data = await initiativesService.getAll(activeFilters);

            // Transform API data to PrioritizationItemData
            if (Array.isArray(data)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mappedItems: PrioritizationItemData[] = data.map((item: any) => ({
                    id: String(item.id),
                    title: item.title,
                    type: item.type,
                    priority: item.priority || "Baixa",
                    status: item.status,
                    deadline: item.deadline || "-"
                }));
                setItems(mappedItems);
            } else {
                setItems([]);
            }
        } catch (error) {
            console.error("Failed to fetch initiatives", error);
        } finally {
            setLoading(false);
        }
    };

    // Effects
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchInitiatives();
        }, 300);
        return () => clearTimeout(timer);
    }, [filters]);

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Priorização de Backlog do Setor</h1>
                    <p className="text-slate-500 mt-1">Recursos Humanos • Ano de Referência: 2025</p>
                </div>
                <div className="flex gap-3">
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

                <InitiativesFilter
                    filters={filters}
                    onFilterChange={setFilters}
                />

                <div className="text-sm text-slate-500 pt-2">
                    {items.length} iniciativas ativas
                </div>
            </div>

            {/* List or Loading */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            ) : (
                <PrioritizationList items={items} onReorder={setItems} />
            )}

        </div>
    );
}
