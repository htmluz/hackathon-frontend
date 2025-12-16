import { useEffect, useState } from "react";
import { Search, Grid, List as ListIcon, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sectorsService, type Sector } from "@/services/sectorsService";

export interface FilterState {
    search: string;
    status: string;
    type: string;
    sector: string;
    priority: string;
}

export type ViewMode = "grid" | "list";

interface InitiativesFilterProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    viewMode?: ViewMode;
    onViewChange?: (mode: ViewMode) => void;
}

export function InitiativesFilter({ filters, onFilterChange, viewMode, onViewChange }: InitiativesFilterProps) {
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [canFilterSector, setCanFilterSector] = useState(false);

    useEffect(() => {
        const loadFilterData = async () => {
            try {
                // Check permissions
                const userTypes = JSON.parse(localStorage.getItem('user_types') || '[]');
                const hasPermission = userTypes.some((t: any) => t.name === 'admin' || t.name === 'manager');
                setCanFilterSector(hasPermission);

                if (hasPermission) {
                    const data = await sectorsService.getAll(true);
                    setSectors(data);
                }
            } catch (error) {
                console.error("Failed to load filter data", error);
            }
        };
        loadFilterData();
    }, []);

    const handleChange = (field: keyof FilterState, value: string) => {
        onFilterChange({ ...filters, [field]: value });
    };

    return (
        <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Filter className="w-4 h-4" />
                <span className="font-medium text-sm">Filtros</span>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por título ou descrição..."
                        className="pl-9 bg-slate-50 border-slate-200"
                        value={filters.search}
                        onChange={(e) => handleChange("search", e.target.value)}
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {/* Status Filter */}
                    <div className="relative min-w-[160px]">
                        <select
                            className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-slate-600 cursor-pointer appearance-none"
                            value={filters.status}
                            onChange={(e) => handleChange("status", e.target.value)}
                        >
                            <option value="">Todos os status</option>
                            <option value="Em Execução">Em Execução</option>
                            <option value="Em Análise">Em Análise</option>
                            <option value="Aprovada">Aprovada</option>
                            <option value="Submetida">Submetida</option>
                            <option value="Devolvida">Devolvida</option>
                            <option value="Reprovada">Reprovada</option>
                        </select>
                        <ChevronIcon />
                    </div>

                    {/* Type Filter */}
                    <div className="relative min-w-[160px]">
                        <select
                            className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-slate-600 cursor-pointer appearance-none"
                            value={filters.type}
                            onChange={(e) => handleChange("type", e.target.value)}
                        >
                            <option value="">Todos os tipos</option>
                            <option value="Automação">Automação</option>
                            <option value="Integração">Integração</option>
                            <option value="Melhoria">Melhoria</option>
                            <option value="Novo Projeto">Novo Projeto</option>
                        </select>
                        <ChevronIcon />
                    </div>

                    {/* Sector Filter - Dynamic & Restricted */}
                    {canFilterSector && (
                        <div className="relative min-w-[160px]">
                            <select
                                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-slate-600 cursor-pointer appearance-none"
                                value={filters.sector}
                                onChange={(e) => handleChange("sector", e.target.value)}
                            >
                                <option value="">Todos os setores</option>
                                {sectors.map((sector) => (
                                    <option key={sector.id} value={sector.name}>
                                        {sector.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronIcon />
                        </div>
                    )}

                    <div className="relative min-w-[160px]">
                        <select
                            className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-slate-600 cursor-pointer appearance-none"
                            value={filters.priority}
                            onChange={(e) => handleChange("priority", e.target.value)}
                        >
                            <option value="">Todas as prioridades</option>
                            <option value="Alta">Alta</option>
                            <option value="Média">Média</option>
                            <option value="Baixa">Baixa</option>
                        </select>
                        <ChevronIcon />
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-2 text-sm text-slate-500">
                <span>{/* Count moved to parent */}</span>

                {(viewMode && onViewChange) && (
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className={`h-7 w-7 shadow-sm ${viewMode === 'grid' ? 'bg-white text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
                            onClick={() => onViewChange("grid")}
                        >
                            <Grid className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className={`h-7 w-7 shadow-sm ${viewMode === 'list' ? 'bg-white text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
                            onClick={() => onViewChange("list")}
                        >
                            <ListIcon className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

function ChevronIcon() {
    return (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );
}
