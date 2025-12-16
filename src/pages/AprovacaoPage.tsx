import { useEffect, useState } from "react";
import { CheckSquare, Loader2, Clock, AlertOctagon, CheckCircle, XCircle } from "lucide-react";
import { InitiativeCard } from "@/components/InitiativeCard";
import { initiativesService, type CancellationRequest, type Initiative } from "@/services/initiativesService";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { InitiativeDetailsModal } from "@/components/InitiativeDetailsModal";
import { ReviewCancellationModal } from "@/components/ReviewCancellationModal";
import { ReviewInitiativeModal } from "@/components/ReviewInitiativeModal";
import { Button } from "@/components/ui/button";

export default function AprovacaoPage() {
    const [initiatives, setInitiatives] = useState<Initiative[]>([]);
    const [cancellations, setCancellations] = useState<CancellationRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal & Selection state
    const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
    const [selectedCancellation, setSelectedCancellation] = useState<CancellationRequest | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Review Cancellation Modal State
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewAction, setReviewAction] = useState<{ requestId: number; approved: boolean } | null>(null);

    // Review Initiative Modal State
    const [isReviewInitiativeOpen, setIsReviewInitiativeOpen] = useState(false);
    const [reviewInitiativeAction, setReviewInitiativeAction] = useState<{ initiativeId: number; approved: boolean } | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Parallel fetch of initiatives and cancellations
            const [initiativesData, cancellationsData] = await Promise.all([
                initiativesService.getSubmitted(),
                initiativesService.getCancellationRequests()
            ]);

            const filteredInitiatives = (Array.isArray(initiativesData) ? initiativesData : []).filter(
                (init: Initiative) => !init.cancellation_request || init.cancellation_request.status !== 'Pendente'
            );
            setInitiatives(filteredInitiatives);
            setCancellations(Array.isArray(cancellationsData.data) ? cancellationsData.data : []);
        } catch (error) {
            console.error("Failed to fetch approvals page data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSuccess = () => {
        fetchData();
    };

    const handleCancellationClick = async (request: CancellationRequest) => {
        if (!request.initiative_id) return;

        setSelectedCancellation(request);
        // Try to fetch full initiative details if possible
        try {
            const fullInitiative = await initiativesService.getById(request.initiative_id);
            setSelectedInitiative(fullInitiative);
            setIsDetailsOpen(true);
        } catch (error) {
            console.error("Could not fetch initiative details", error);
        }
    };

    const handleOpenReview = (requestId: number, approved: boolean) => {
        setReviewAction({ requestId, approved });
        setIsReviewOpen(true);
    };

    const handleOpenReviewInitiative = (initiativeId: number, approved: boolean) => {
        setReviewInitiativeAction({ initiativeId, approved });
        setIsReviewInitiativeOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 flex justify-center">
            <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                {/* Pending Initiatives Column */}
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6 border-b">
                        <div className="bg-blue-100 p-2.5 rounded-xl">
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-900">Aprovação de Iniciativas</CardTitle>
                            <CardDescription className="text-slate-500 mt-1">Iniciativas aguardando análise</CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6">
                        {/* Info Card */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-blue-800 text-sm mb-6">
                            <Clock className="w-5 h-5 flex-shrink-0 text-blue-600" />
                            <p className="leading-relaxed">
                                As iniciativas listadas abaixo estão com status <strong>"Submetida"</strong> e aguardam sua avaliação.
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
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {initiatives.map((initiative) => (
                                            <InitiativeCard
                                                key={initiative.id}
                                                data={initiative}
                                                compact
                                                onClick={() => {
                                                    setSelectedInitiative(initiative);
                                                    setSelectedCancellation(null); // Clear cancellation context
                                                    setIsDetailsOpen(true);
                                                }}
                                                onReviewCancellation={handleOpenReview}
                                                onReviewInitiative={handleOpenReviewInitiative}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Cancellation Requests Column */}
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6 border-b">
                        <div className="bg-red-100 p-2.5 rounded-xl">
                            <AlertOctagon className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-900">Solicitações de Cancelamento</CardTitle>
                            <CardDescription className="text-slate-500 mt-1">Pedidos de cancelamento pendentes</CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6">
                        {/* Info Card */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 text-red-800 text-sm mb-6">
                            <AlertOctagon className="w-5 h-5 flex-shrink-0 text-red-600" />
                            <p className="leading-relaxed">
                                Revise as justificativas abaixo para aprovar ou rejeitar o cancelamento das iniciativas.
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
                                    {cancellations.length} solicitação{cancellations.length !== 1 ? 'ões' : ''} pendente{cancellations.length !== 1 ? 's' : ''}
                                </div>

                                {cancellations.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                                        <AlertOctagon className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                                        <p>Nenhuma solicitação de cancelamento.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {cancellations.map((request) => (
                                            <div
                                                key={request.id}
                                                className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                                onClick={() => handleCancellationClick(request)}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-semibold text-slate-800 line-clamp-1" title={request.initiative_title}>
                                                        {request.initiative_title}
                                                    </span>
                                                    <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                                        {request.time_ago}
                                                    </span>
                                                </div>

                                                <div className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                                                    <span>Solicitado por:</span>
                                                    <span className="font-medium text-slate-700">{request.requested_by_name}</span>
                                                </div>

                                                <div className="bg-slate-50 p-3 rounded-md text-sm text-slate-600 italic border border-slate-100 mb-4">
                                                    "{request.reason}"
                                                </div>

                                                <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 rounded-full bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenReview(request.id, true);
                                                        }}
                                                        title="Aprovar Cancelamento"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenReview(request.id, false);
                                                        }}
                                                        title="Reprovar Cancelamento"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

            </div>

            <InitiativeDetailsModal
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                initiative={selectedInitiative as any}
                cancellationRequest={selectedCancellation}
                onReviewCancellation={handleOpenReview}
                onSuccess={handleSuccess}
            />

            <ReviewCancellationModal
                open={isReviewOpen}
                onOpenChange={setIsReviewOpen}
                requestId={reviewAction?.requestId ?? null}
                approved={reviewAction?.approved ?? false}
                onSuccess={() => {
                    fetchData();
                    setIsDetailsOpen(false);
                }}
            />

            <ReviewInitiativeModal
                open={isReviewInitiativeOpen}
                onOpenChange={setIsReviewInitiativeOpen}
                initiativeId={reviewInitiativeAction?.initiativeId ?? null}
                approved={reviewInitiativeAction?.approved ?? false}
                onSuccess={() => {
                    fetchData();
                    setIsDetailsOpen(false);
                }}
            />
        </div>
    );
}
