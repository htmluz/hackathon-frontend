import { Search, Grid, List as ListIcon, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function InitiativesFilter() {
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
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {/* Mock Selects using standard HTML select styled as Input */}
                    {["Todos os status", "Todos os tipos", "Todos os setores", "Todas"].map((placeholder, i) => (
                        <div key={i} className="relative min-w-[140px]">
                            <select
                                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 text-slate-600 cursor-pointer appearance-none"
                                defaultValue=""
                            >
                                <option value="" disabled hidden>{placeholder}</option>
                                <option value="option1">Opção 1</option>
                                <option value="option2">Opção 2</option>
                            </select>
                            {/* Chevron down icon could be added here absolutely positioned if appearance-none is used */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between items-center pt-2 text-sm text-slate-500">
                <span>7 iniciativas encontradas</span>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <Button variant="ghost" size="icon-sm" className="h-7 w-7 bg-white shadow-sm text-slate-700">
                        <Grid className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-slate-400 hover:text-slate-600">
                        <ListIcon className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
