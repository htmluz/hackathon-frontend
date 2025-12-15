import { Calendar, User, Building2, AlertTriangle, Play, Clock, CheckCircle, FileText, XCircle, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type InitiativeStatus = "Em Execução" | "Em Análise" | "Aprovada" | "Submetida" | "Devolvida" | "Reprovada";

export interface Initiative {
  id: string | number;
  title: string;
  status: InitiativeStatus;
  type: string;
  priority: "Alta" | "Média" | "Baixa";
  description: string;
  sector: string;
  owner?: string;
  date?: string;
}

interface InitiativeCardProps {
  data: Initiative;
}

const statusConfig: Record<InitiativeStatus, { color: string; icon: React.ElementType; bg: string }> = {
  "Em Execução": { color: "text-purple-600", bg: "bg-purple-50", icon: Play },
  "Em Análise": { color: "text-blue-600", bg: "bg-blue-50", icon: Clock },
  "Aprovada": { color: "text-green-600", bg: "bg-green-50", icon: CheckCircle },
  "Submetida": { color: "text-amber-600", bg: "bg-amber-50", icon: ArrowUpRight }, // Using ArrowUpRight as placeholder for 'send'
  "Devolvida": { color: "text-orange-600", bg: "bg-orange-50", icon: ArrowUpRight }, // Orange for return
  "Reprovada": { color: "text-red-600", bg: "bg-red-50", icon: XCircle },
};

const priorityConfig = {
  "Alta": { color: "text-red-600", bg: "bg-red-50", icon: AlertTriangle },
  "Média": { color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
  "Baixa": { color: "text-green-600", bg: "bg-green-50", icon: CheckCircle },
};

export function InitiativeCard({ data }: InitiativeCardProps) {
  const initiative = data;
  const status = statusConfig[initiative.status] || statusConfig["Em Análise"];
  const priority = priorityConfig[initiative.priority] || priorityConfig["Média"];
  const StatusIcon = status.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-lg font-bold text-slate-800 leading-tight">
            {initiative.title}
          </CardTitle>
          <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap", status.bg, status.color)}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{initiative.status}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4 space-y-4">
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

        <p className="text-sm text-slate-600 line-clamp-3">
          {initiative.description}
        </p>
      </CardContent>
      <CardFooter className="pt-0 text-xs text-slate-500 flex flex-col items-start gap-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400" />
          <span>{initiative.sector}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          <span>{initiative.owner}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{initiative.date}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
