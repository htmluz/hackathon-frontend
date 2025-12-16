import { useEffect, useState } from "react";
import { Info, Save, Loader2, Lock, Unlock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrioritizationList } from "@/components/PrioritizationList";
import { type PrioritizationItemData } from "@/components/PrioritizationItem";
import { prioritizationService, type PrioritizationData, type AdminAllPrioritizations } from "@/services/prioritizationService";
import { RequestChangeModal } from "@/components/RequestChangeModal";
import { ChangeRequestsModal } from "@/components/ChangeRequestsModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Helper for permission checking
const checkUserPermissions = () => {
    let types: any[] = [];
    const storedUserTypes = localStorage.getItem('user_types');
    const storedUser = localStorage.getItem('user');

    if (storedUserTypes) {
        try {
            types = JSON.parse(storedUserTypes);
        } catch (e) {
            console.error("Error parsing user_types", e);
        }
    }

    // Fallback: If no types found in separate key, try to find in user object
    if ((!types || types.length === 0) && storedUser) {
        try {
            const user = JSON.parse(storedUser);
            if (Array.isArray(user.user_types)) types = user.user_types;
            else if (Array.isArray(user.types)) types = user.types;
        } catch (e) {
            console.error("Error parsing user for types", e);
        }
    }

    const hasAdmin = Array.isArray(types) && types.some((t: any) => {
        const name = (typeof t === 'string' ? t : t.name) || "";
        return name.toLowerCase().includes('admin') || name.toLowerCase().includes('manager');
    });

    return hasAdmin;
};

export default function PrioritizationPage() {
    // --- State ---
    const [year, setYear] = useState(2025);
    const [items, setItems] = useState<PrioritizationItemData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(false);

    // Initialize permissions synchronously to avoid race conditions
    const [isAdmin] = useState(() => checkUserPermissions());
    const [activeTab, setActiveTab] = useState(() => checkUserPermissions() ? "global" : "my-sector");

    // Modals
    const [requestChangeModalOpen, setRequestChangeModalOpen] = useState(false);
    const [changeRequestsModalOpen, setChangeRequestsModalOpen] = useState(false);

    // --- Effects ---
    useEffect(() => {
        const fetchData = async () => {
            // Avoid double fetching by checking activeTab consistency
            if (isAdmin && activeTab === 'global') {
                await fetchGlobalPrioritization();
            } else if (isAdmin && activeTab === 'requests') {
                // Handled logic
            } else {
                await fetchMyPrioritization();
            }
        };
        fetchData();
    }, [year, activeTab, isAdmin]);
    // removed old checkPermissions effect

    // --- Helpers ---
    // (checkPermissions removed)

    const mapInitiativesToItems = (initiatives: any[]): PrioritizationItemData[] => {
        return initiatives.map((item: any) => ({
            id: String(item.id),
            title: item.title,
            type: item.type,
            priority: item.priority || "Baixa",
            status: item.status,
            deadline: item.deadline
        }));
    };

    // --- Fetchers ---
    const fetchMyPrioritization = async () => {
        setLoading(true);
        try {
            const data = await prioritizationService.getMyPrioritization(year);
            // API returns structure { success: true, data: { is_locked, initiatives: [] } } or similar
            // Adjust based on actual API response structure seen in docs
            const prioritization = data.data as PrioritizationData;

            if (prioritization) {
                setItems(mapInitiativesToItems(prioritization.initiatives || []));
                setIsLocked(prioritization.is_locked);
            } else {
                setItems([]);
                setIsLocked(false);
            }
        } catch (error) {
            console.error("Failed to fetch my prioritization", error);
            // Fallback or empty state
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchGlobalPrioritization = async () => {
        setLoading(true);
        try {
            const data = await prioritizationService.getAllPrioritizations(year);
            const result = data.data as AdminAllPrioritizations;

            // Flatten all sectors initiatives into one list for global ranking
            let allInitiatives: PrioritizationItemData[] = [];

            if (result && result.sectors) {
                result.sectors.forEach(sector => {
                    const sectorItems = mapInitiativesToItems(sector.initiatives || []).map(i => ({
                        ...i,
                        title: `[${sector.sector_name}] ${i.title}` // Prefix with sector for visibility
                    }));
                    allInitiatives = [...allInitiatives, ...sectorItems];
                });
            }
            setItems(allInitiatives);
            setIsLocked(false); // Admins never locked
        } catch (error) {
            console.error("Failed to fetch global", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---
    const handleSave = async () => {
        setLoading(true);
        try {
            const priorityOrder = items.map(i => Number(i.id));
            await prioritizationService.savePrioritization(year, priorityOrder);

            // if successful and not admin, it becomes locked
            if (!isAdmin) setIsLocked(true);

            // Show success logic/toast here
            console.log("Saved successfully");
        } catch (error) {
            console.error("Failed to save", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Render ---
    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Priorização de Backlog e Demandas</h1>
                    <p className="text-slate-500 mt-1 flex items-center gap-2">
                        Ano de Referência:
                        <span className="font-semibold text-slate-700 bg-slate-200 px-2 py-0.5 rounded text-xs">{year}</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    {isAdmin && (
                        <Button
                            variant="outline"
                            onClick={() => setChangeRequestsModalOpen(true)}
                            className="text-slate-600"
                        >
                            Solicitações de Mudança
                        </Button>
                    )}

                    {(!isLocked || isAdmin) ? (
                        <Button
                            className="bg-[#7ab035] hover:bg-[#6a992d] text-white font-semibold shadow-sm"
                            onClick={handleSave}
                            disabled={loading || items.length === 0}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Salvar Priorização
                        </Button>
                    ) : (
                        <Button
                            variant="secondary"
                            className="bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200"
                            onClick={() => setRequestChangeModalOpen(true)}
                        >
                            <Unlock className="w-4 h-4 mr-2" />
                            Solicitar Desbloqueio
                        </Button>
                    )}
                </div>
            </div>

            {/* Info Alerts */}
            {isLocked && !isAdmin ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800 text-sm animate-in fade-in slide-in-from-top-2">
                    <Lock className="w-5 h-5 flex-shrink-0 text-amber-600" />
                    <div>
                        <p className="font-semibold mb-1">Priorização Bloqueada</p>
                        <p className="leading-relaxed opacity-90">
                            A ordem das iniciativas foi salva e confirmada. Para realizar novas alterações, você precisa solicitar o desbloqueio ao gestor através do botão "Solicitar Desbloqueio".
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-[#f0fdf4] border border-green-200 rounded-lg p-4 flex gap-3 text-green-800 text-sm">
                    <Info className="w-5 h-5 flex-shrink-0 text-green-600" />
                    <p className="leading-relaxed">
                        {isAdmin
                            ? "Como Administrador/Gestor, você tem permissão total para reordenar e salvar a priorização a qualquer momento, sem restrições de bloqueio."
                            : "Arraste os itens para definir a prioridade (1º é o topo). Clique em 'Salvar Priorização' para confirmar a ordem. Atenção: ao salvar, a lista será bloqueada para edição do Usuário."
                        }
                    </p>
                </div>
            )}

            {/* Content Area */}
            {isAdmin ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                        <TabsTrigger value="global">Priorização Global (Admin)</TabsTrigger>
                        <TabsTrigger value="my-sector">Meu Setor</TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                            </div>
                        ) : (
                            <PrioritizationList
                                items={items}
                                onReorder={setItems}
                                disabled={false} // Admin never locked
                                onRequestCancellation={() => { }}
                            />
                        )}
                    </div>
                </Tabs>
            ) : (
                <div className="mt-6">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <PrioritizationList
                            items={items}
                            onReorder={setItems}
                            disabled={isLocked}
                            onRequestCancellation={() => { }} // User can only reorder here
                        />
                    )}
                </div>
            )}

            {/* Modals */}
            <RequestChangeModal
                open={requestChangeModalOpen}
                onOpenChange={setRequestChangeModalOpen}
                year={year}
                newPriorityOrder={items.map(i => Number(i.id))}
                onSuccess={() => {
                    // Maybe show a pending state or toast
                    console.log("Request sent");
                }}
            />

            <ChangeRequestsModal
                open={changeRequestsModalOpen}
                onOpenChange={setChangeRequestsModalOpen}
                onRequestProcessed={() => {
                    // Refresh data if needed
                    if (activeTab === 'global') fetchGlobalPrioritization();
                }}
            />
        </div>
    );
}
