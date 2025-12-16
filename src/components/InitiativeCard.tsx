import { useState, useEffect } from "react";
import { Calendar, User, Building2, AlertTriangle, Play, Clock, CheckCircle, FileText, XCircle, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Initiative } from "@/services/initiativesService";

export type InitiativeStatus = "Em Execução" | "Em Análise" | "Aprovada" | "Submetida" | "Devolvida" | "Reprovada";

export interface InitiativeCardProps {
  data: Initiative;
  compact?: boolean;
  onClick?: () => void;
  onReviewCancellation?: (requestId: number, approved: boolean) => void;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType; bg: string }> = {
  "Em Execução": { color: "text-purple-600", bg: "bg-purple-50", icon: Play },
  "Em Análise": { color: "text-blue-600", bg: "bg-blue-50", icon: Clock },
  "Aprovada": { color: "text-green-600", bg: "bg-green-50", icon: CheckCircle },
  "Submetida": { color: "text-amber-600", bg: "bg-amber-50", icon: ArrowUpRight },
  "Devolvida": { color: "text-orange-600", bg: "bg-orange-50", icon: ArrowUpRight },
  "Reprovada": { color: "text-red-600", bg: "bg-red-50", icon: XCircle },
};

const priorityConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  "Alta": { color: "text-red-600", bg: "bg-red-50", icon: AlertTriangle },
  "Média": { color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
  "Baixa": { color: "text-green-600", bg: "bg-green-50", icon: CheckCircle },
};

export function InitiativeCard({ data, compact = false, onClick, onReviewCancellation }: InitiativeCardProps) {
  const initiative = data;
  const status = statusConfig[initiative.status] || statusConfig["Em Análise"];
  const priority = priorityConfig[initiative.priority] || priorityConfig["Média"];
  const StatusIcon = status.icon;

  const hasPendingCancellation = initiative.cancellation_request && initiative.cancellation_request.status === 'Pendente';

  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    const storedUserTypes = localStorage.getItem('user_types');
    if (storedUserTypes) {
      try {
        const types = JSON.parse(storedUserTypes);
        const hasPermission = Array.isArray(types) && types.some((t: any) => {
          const name = (t.name || "").toLowerCase();
          return name.includes('admin') || name.includes('gestor') || name.includes('manager');
        });
        setCanReview(hasPermission);
      } catch (error) {
        console.error("Failed to parse user types", error);
        setCanReview(false);
      }
    } else {
      setCanReview(false);
    }
  }, []);

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full",
        compact && "shadow-none border-slate-200 hover:shadow-md h-auto"
      )}
    >
      <CardHeader className={cn("pb-3", compact && "p-4 pb-2")}>
        <div className="flex justify-between items-start gap-4">
          <CardTitle className={cn("font-bold text-slate-800 leading-tight", compact ? "text-base" : "text-lg")}>
            {initiative.title}
          </CardTitle>
          <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0", status.bg, status.color, compact && "px-2 py-0.5 text-[10px]")}>
            <StatusIcon className={cn("w-3.5 h-3.5", compact && "w-3 h-3")} />
            <span>{initiative.status}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn("pb-4 space-y-4 flex-grow", compact && "p-4 pt-0 pb-3 space-y-2")}>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            <FileText className="w-3.5 h-3.5" />
            <span>{initiative.type}</span>
          </div>
          <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", priority.bg, priority.color)}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{initiative.priority}</span>
          </div>
        </div>

        <p className={cn("text-slate-600", compact ? "text-xs line-clamp-2" : "text-sm line-clamp-3")}>
          {initiative.description}
        </p>

        {hasPendingCancellation && initiative.cancellation_request && (
          <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2 text-red-700 text-xs font-semibold mb-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Solicitação de Cancelamento</span>
            </div>
            <p className="text-xs text-red-600 line-clamp-2 italic mb-2">
              "{initiative.cancellation_request.reason}"
            </p>

            {canReview && onReviewCancellation && (
              <div className="flex gap-2 justify-end pt-1 border-t border-red-100/50">
                <Button
                  size="sm"
                  className="h-7 bg-green-600 hover:bg-green-700 text-white text-xs px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReviewCancellation(initiative.cancellation_request!.id, true);
                  }}
                >
                  <CheckCircle className="w-3 h-3 mr-1" /> Aprovar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 text-xs px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReviewCancellation(initiative.cancellation_request!.id, false);
                  }}
                >
                  <XCircle className="w-3 h-3 mr-1" /> Reprovar
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className={cn("pt-0 text-xs text-slate-500 flex items-start gap-4 mt-auto border-t pt-4", compact ? "p-4 pt-0 gap-x-4 border-t-0 mt-0" : "")}>
        <div className="flex items-center gap-1.5 min-w-0">
          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">{initiative.sector}</span>
        </div>
        {(initiative.owner || initiative.owner_name) && (
          <div className="flex items-center gap-1.5 min-w-0">
            <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{initiative.owner_name || initiative.owner}</span>
          </div>
        )}
        {(initiative.date || initiative.created_at) && (
          <div className="flex items-center gap-1.5 ml-auto whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{initiative.date || (initiative.created_at ? new Date(initiative.created_at).toLocaleDateString() : '')}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
