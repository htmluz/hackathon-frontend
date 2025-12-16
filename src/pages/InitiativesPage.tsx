import { useEffect, useState } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InitiativeCard } from "@/components/InitiativeCard";
import { InitiativesFilter, type FilterState, type ViewMode } from "@/components/InitiativesFilter";
import { NewInitiativeModal } from "@/components/NewInitiativeModal";
import { InitiativeDetailsModal } from "@/components/InitiativeDetailsModal";
import { ReviewCancellationModal } from "@/components/ReviewCancellationModal";
import { initiativesService, type Initiative } from "@/services/initiativesService";

export default function InitiativesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [initiatives, setInitiatives] = useState<Initiative[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [filters, setFilters] = useState<FilterState>({
        search: "",
        status: "",
        type: "",
        sector: "",
        priority: ""
    });

    // Review Modal State
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewAction, setReviewAction] = useState<{ requestId: number; approved: boolean } | null>(null);

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

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchInitiatives();
        }, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [filters]);

    const handleSuccess = () => {
        setIsModalOpen(false);
        setIsDetailsOpen(false);
        fetchInitiatives();
    };

    const handleOpenReview = (requestId: number, approved: boolean) => {
        setReviewAction({ requestId, approved });
        setIsReviewOpen(true);
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
            <InitiativesFilter
                filters={filters}
                onFilterChange={setFilters}
                viewMode={viewMode}
                onViewChange={setViewMode}
            />

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
                        <div className={viewMode === 'grid'
                            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                            : "flex flex-col gap-3"
                        }>
                            {initiatives.map((initiative) => (
                                <InitiativeCard
                                    key={initiative.id}
                                    data={initiative}
                                    compact={viewMode === 'list'}
                                    onClick={() => {
                                        setSelectedInitiative(initiative);
                                        setIsDetailsOpen(true);
                                    }}
                                    onReviewCancellation={handleOpenReview}
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
                initiative={selectedInitiative}
                onSuccess={handleSuccess}
                onReviewCancellation={handleOpenReview}
            />

            <ReviewCancellationModal
                open={isReviewOpen}
                onOpenChange={setIsReviewOpen}
                requestId={reviewAction?.requestId ?? null}
                approved={reviewAction?.approved ?? false}
                onSuccess={() => {
                    fetchInitiatives();
                    setIsDetailsOpen(false); // Close details if open
                }}
            />
        </div>
    );
}
