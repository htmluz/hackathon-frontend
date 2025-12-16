import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, AlertTriangle, Play, CheckCircle, Clock, XCircle, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Reusing types from InitiativeCard for consistency, or defining locally if we want decoupling
// For now, assume a simplified structure for the list
export interface PrioritizationItemData {
    id: string;
    title: string;
    status: "Em Execução" | "Em Análise" | "Aprovada" | "Submetida" | "Devolvida" | "Reprovada";
    type: string;
    priority: "Alta" | "Média" | "Baixa"; // Criticality in print
    deadline?: string;
}

interface PrioritizationItemProps {
    id: string;
    item: PrioritizationItemData;
    index: number;
    onRequestCancellation: (id: string) => void;
}

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
    "Em Execução": { color: "text-purple-600", bg: "bg-purple-100/50", icon: Play },
    "Em Análise": { color: "text-blue-600", bg: "bg-blue-100/50", icon: Clock },
    "Aprovada": { color: "text-green-600", bg: "bg-green-100/50", icon: CheckCircle },
    "Submetida": { color: "text-amber-600", bg: "bg-amber-100/50", icon: ArrowUpRight },
    "Devolvida": { color: "text-orange-600", bg: "bg-orange-100/50", icon: ArrowUpRight },
    "Reprovada": { color: "text-red-600", bg: "bg-red-100/50", icon: XCircle },
};

const criticalityConfig: Record<string, { color: string; bg: string }> = {
    "Alta": { color: "text-red-700", bg: "bg-red-100" },
    "Média": { color: "text-amber-700", bg: "bg-amber-100" },
    "Baixa": { color: "text-green-700", bg: "bg-green-100" },
};

export function PrioritizationItem({ id, item, index, onRequestCancellation }: PrioritizationItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: isDragging ? "relative" as const : undefined,
    };

    const status = statusConfig[item.status] || statusConfig["Em Análise"];
    const StatusIcon = status.icon;
    const criticality = criticalityConfig[item.priority] || criticalityConfig["Média"];

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-lg mb-3 shadow-sm select-none",
                isDragging && "shadow-xl border-green-500 bg-green-50 scale-[1.02]"
            )}
        >
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
                <GripVertical className="w-5 h-5" />
            </div>

            <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 font-bold text-slate-700 bg-slate-50">
                {index + 1}
            </div>

            <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4 font-medium text-slate-800 truncate" title={item.title}>
                    {item.title}
                </div>

                <div className="col-span-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 inline-flex items-center gap-1.5">
                        {/* Icon for Type could be distinct, using placeholder for now */}
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {item.type}
                    </span>
                </div>

                <div className="col-span-1">
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5", criticality.bg, criticality.color)}>
                        <AlertTriangle className="w-3 h-3" />
                        {item.priority}
                    </span>
                </div>

                <div className="col-span-2">
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5", status.bg, status.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {item.status}
                    </span>
                </div>

                <div className="col-span-1 text-sm text-slate-600">
                    {item.deadline || "-"}
                </div>

                <div className="col-span-2 text-right">
                    <button
                        className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline"
                        onClick={() => onRequestCancellation(id)}
                    >
                        Solicitar Cancelamento
                    </button>
                </div>
            </div>
        </div>
    );
}
