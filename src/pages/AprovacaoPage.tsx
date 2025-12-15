import { useEffect, useState } from "react";
import { CheckSquare, Loader2, Clock } from "lucide-react";
import { InitiativeCard, type Initiative } from "@/components/InitiativeCard";
import { initiativesService } from "@/services/initiativesService";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AprovacaoPage() {
    const [initiatives, setInitiatives] = useState<Initiative[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInitiatives = async () => {
        setLoading(true);
        try {
            // Filter by status "Em Análise"
            const data = await initiativesService.getAll({ status: "Submetida" });
            setInitiatives(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch initiatives", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitiatives();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 flex items-center justify-center">
            {/* Card Container */}
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6 border-b">
                    <div className="bg-blue-100 p-2.5 rounded-xl">
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold text-slate-900">Aprovação de Iniciativas</CardTitle>
                        <CardDescription className="text-slate-500 mt-1">Iniciativas aguardando análise e aprovação</CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="pt-6">
                    {/* Info Card */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-blue-800 text-sm mb-6">
                        <Clock className="w-5 h-5 flex-shrink-0 text-blue-600" />
                        <p className="leading-relaxed">
                            As iniciativas listadas abaixo estão com status <strong>"Em Análise"</strong> e aguardam sua avaliação.
                            Revise cada uma e aprove ou devolva conforme necessário.
                        </p>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <>
                            <div className="text-sm text-slate-500 mb-4 font-medium">
                                {initiatives.length} iniciativa{initiatives.length !== 1 ? 's' : ''} aguardando análise
                            </div>

                            {initiatives.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                                    <CheckSquare className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                                    <p>Nenhuma iniciativa aguardando análise.</p>
                                    <p className="text-xs mt-1">Todas as iniciativas foram processadas!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {initiatives.map((initiative) => (
                                        <InitiativeCard key={initiative.id} data={initiative} compact />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

