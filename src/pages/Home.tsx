import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Megaphone,
  Calendar,
  ArrowRight,
  BarChart3,
  HelpCircle,
  ChevronRight,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import dashboardImg from '@/assets/home/dashboard.png';
import registrationImg from '@/assets/home/registration.png';
import teamImg from '@/assets/home/team.png';

import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { initiativesService, type Initiative } from "@/services/initiativesService";
import { Loader2 } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [emblaRef] = useEmblaCarousel({ loop: true, dragFree: true }, [
    AutoScroll({
      playOnInit: true,
      stopOnMouseEnter: true,
      stopOnInteraction: false,
      speed: 1
    })
  ]);

  const [notices, setNotices] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        // Fetch initiatives that are "In Execution" to show as notices/impacts
        // In a real scenario you might have a specific 'is_notice' flag or separate type
        const data = await initiativesService.getAll({ status: 'Em Execução' });
        setNotices(data);
      } catch (error) {
        console.error("Failed to fetch home notices", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Em Execução': return { bg: "bg-[#7ab035]", border: "border-l-[#7ab035]", btn: "text-[#7ab035]" };
      case 'Em Planejamento': return { bg: "bg-slate-100 text-slate-500 border border-slate-200", border: "border-l-slate-300", btn: "text-slate-500" };
      case 'Agendado': return { bg: "bg-blue-100 text-blue-600", border: "border-l-blue-500", btn: "text-blue-600" };
      case 'Em Revisão': return { bg: "bg-purple-100 text-purple-600", border: "border-l-purple-500", btn: "text-purple-600" };
      default: return { bg: "bg-slate-100 text-slate-500", border: "border-l-slate-300", btn: "text-slate-500" };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-8 pb-20">
      {/* Section: Corporate Impact Notices */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg text-green-700">
            <Megaphone className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Avisos de Impacto Corporativo</h2>
            {!loading && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                {notices ? notices.length : 0} em andamento
              </span>
            )}
          </div>
          <div className="ml-auto flex gap-2">
            <Button
              variant="ghost"
              className="text-sm text-slate-500 hover:text-slate-900"
              onClick={() => navigate('/iniciativas?status=Em Execução')}
            >
              Ver todos <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-slate-500 -mt-2 ml-14">
          Projetos em execução pela TIC com impacto em múltiplos setores ou toda a Senior
        </p>

        {/* Carousel Container */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
          </div>
        ) : !notices || notices.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-dashed">
            Nenhum aviso ou iniciativa em execução no momento.
          </div>
        ) : (
          <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
            <div className="flex gap-6">
              {notices.map((item, index) => {
                const styles = getStatusStyle(item.status);
                let dateStr = "";
                try {
                  if (item.deadline) {
                    dateStr = new Date(item.deadline).toLocaleDateString('pt-BR');
                    if (dateStr === "Invalid Date") dateStr = "";
                  }
                } catch (e) { console.error("Invalid date", item.deadline); }

                return (
                  <div key={index} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0">
                    <Card className={`h-full border-l-4 ${styles.border} hover:shadow-md transition-all`}>
                      <CardContent className="p-5 space-y-4 h-full flex flex-col">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-slate-800 leading-snug line-clamp-2">{item.title}</h3>
                          <span className={`shrink-0 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${styles.bg}`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">
                          {item.description}
                        </p>
                        <div className="flex flex-wrap gap-2 text-[10px] pt-2 mt-auto">
                          {dateStr && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Calendar className="w-3 h-3" /> {dateStr}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full border font-medium whitespace-nowrap bg-amber-50 text-amber-600 border-amber-100`}>
                            {item.sector || 'Geral'}
                          </span>
                        </div>
                        <button
                          className={`text-xs font-semibold ${styles.btn} flex items-center hover:underline mt-2`}
                          onClick={() => navigate(`/iniciativas?id=${item.id}`)} // Or open modal
                        >
                          Saiba mais <ChevronRight className="w-3 h-3 ml-0.5" />
                        </button>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {/* Section: Visual Navigation (Hero Cards) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[400px]">
        {/* Large Main Card */}
        <div
          onClick={() => navigate('/iniciativas')}
          className="lg:col-span-7 relative group rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
          <img
            src={dashboardImg}
            alt="Listagem Geral"
            className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute bottom-0 left-0 p-8 z-20 w-3/4">
            <div className="mb-3 inline-flex items-center justify-center p-2 bg-[#7ab035]/20 backdrop-blur-md rounded-lg text-[#7ab035] border border-[#7ab035]/30">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Listagem Geral e Status</h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-6 opacity-90">
              Acompanhe todas as iniciativas de TI em um só lugar. Visualize status, prioridades e prazos com dashboards em tempo real.
            </p>
            <span className="inline-flex items-center gap-2 text-[#7ab035] font-semibold text-sm group-hover:gap-4 transition-all uppercase tracking-wider">
              Acessar listagem <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Right Column Cards */}
        <div className="lg:col-span-5 flex flex-col gap-6 h-full">
          {/* Top Card */}
          <div
            onClick={() => navigate('/iniciativas?new=true')}
            className="flex-1 relative group rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/20 to-transparent z-10" />
            <img
              src={registrationImg}
              alt="Cadastro"
              className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 p-6 z-20 flex flex-col justify-center items-end text-right">
              <h3 className="text-2xl font-bold text-white mb-2">Formulário de Cadastro</h3>
              <p className="text-slate-300 text-xs w-2/3 mb-4">Acesso exclusivo para os Key Users registrarem novas demandas.</p>
              <span className="inline-flex items-center gap-2 text-white/80 text-xs font-semibold group-hover:text-[#7ab035] transition-colors">
                Cadastrar iniciativa <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Bottom Card */}
          <div className="flex-1 relative group rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10" />
            <img
              src={teamImg}
              alt="Key Users"
              className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-0 left-0 p-6 z-20">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-[#7ab035]" />
                <h3 className="text-xl font-bold text-white">Key Users</h3>
              </div>
              <p className="text-slate-400 text-xs">Responsáveis pelos sistemas corporativos e aprovações.</p>
              <span className="inline-flex items-center gap-2 text-white/60 text-xs mt-3 group-hover:text-white transition-colors">
                Ver equipe <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="pt-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-slate-500 mb-4 justify-center">
          <HelpCircle className="w-5 h-5" />
          <h2 className="font-bold text-sm uppercase tracking-wide">FAQ - Perguntas Frequentes</h2>
        </div>

        <Card className="bg-white shadow-sm border-slate-100">
          <div className="divide-y divide-slate-100">
            {[
              "FAQ - Andamento de Demandas",
              "FAQ - Cadastro de Iniciativas",
              "Qual a diferença entre iniciativa, melhoria e projeto?",
              "Como funciona a esteira de projetos da TI Corporativa?",
              "Quanto tempo leva para qualificar uma iniciativa?"
            ].map((item, i) => (
              <button key={i} className="w-full text-left p-4 text-sm font-medium text-slate-600 hover:text-[#7ab035] hover:bg-slate-50 transition-colors flex justify-between items-center group">
                {item}
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#7ab035]" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
