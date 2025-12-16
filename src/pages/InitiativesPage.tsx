import { useEffect, useState } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InitiativeCard, type Initiative } from "@/components/InitiativeCard";
import { InitiativesFilter, type FilterState } from "@/components/InitiativesFilter";
import { NewInitiativeModal } from "@/components/NewInitiativeModal";
import { InitiativeDetailsModal } from "@/components/InitiativeDetailsModal";
import { initiativesService } from "@/services/initiativesService";
// import { toast } from "sonner"; // If we want to show errors

export default function InitiativesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [initiatives, setInitiatives] = useState<Initiative[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<FilterState>({
        search: "",
        status: "",
        type: "",
        sector: "",
        priority: ""
    });

    const fetchInitiatives = async () => {
        setLoading(true);
        try {
            // Clean empty filters before sending
            const activeFilters: Record<string, string> = {};
            Object.entries(filters).forEach(([key, value]) => {
                if (value) activeFilters[key] = value;
            });

            const data = await initiativesService.getAll(activeFilters);
            setInitiatives(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch initiatives", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search could be added here, currently sticking to useEffect dependency
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchInitiatives();
        }, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [filters]);

    const handleSuccess = () => {
        setIsModalOpen(false);
        fetchInitiatives();
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lista de Iniciativas</h1>
                    <p className="text-slate-500 mt-1">Gerencie e acompanhe as iniciativas do setor</p>
                </div>
                <Button
                    className="bg-[#7ab035] hover:bg-[#6a992d] text-white font-semibold shadow-sm"
                    onClick={() => setIsModalOpen(true)}
                >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Nova Iniciativa
                </Button>
            </div>

            {/* Filter */}
            <InitiativesFilter filters={filters} onFilterChange={setFilters} />

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            ) : (
                <>
                    <div className="text-sm text-slate-500">
                        {initiatives.length} iniciativas encontradas
                    </div>

                    {initiatives.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                            Nenhuma iniciativa encontrada.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {initiatives.map((initiative) => (
                                <InitiativeCard
                                    key={initiative.id}
                                    data={initiative}
                                    onClick={() => {
                                        setSelectedInitiative(initiative);
                                        setIsDetailsOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            <NewInitiativeModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSuccess={handleSuccess}
            />

            <InitiativeDetailsModal
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                initiative={selectedInitiative as any} // Type assertion to bypass slight mismatch
                onSuccess={handleSuccess}
            />
        </div>
    );
}
