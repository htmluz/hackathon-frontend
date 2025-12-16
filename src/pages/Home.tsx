import { useNavigate } from "react-router-dom";
import {
  Megaphone,
  Calendar,
  ArrowRight,
  Wrench,
  FolderKanban,
  FileText,
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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              2 em andamento
            </span>
          </div>
          <div className="ml-auto flex gap-2">
            {/* Navigation buttons could go here if needed, simplified for now */}
            <Button variant="ghost" className="text-sm text-slate-500 hover:text-slate-900">
              Ver todos <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-slate-500 -mt-2 ml-14">
          Projetos em execução pela TIC com impacto em múltiplos setores ou toda a Senior
        </p>

        {/* Carousel Container */}
        <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex gap-6">
            {[
              {
                title: "Implantação do GitHub e Azure DevOps",
                status: "Em Execução",
                bgStatus: "bg-[#7ab035]",
                border: "border-l-[#7ab035]",
                desc: "Projeto em execução que impactará todos os times de desenvolvimento da Senior, incluindo matriz e filiais.",
                date: "ago/2025 - dez/2025",
                tag: "🚨 Impacta toda a Senior",
                tagColor: "bg-red-50 text-red-600 border-red-100",
                btnColor: "text-[#7ab035]"
              },
              {
                title: "Migração de Infraestrutura para Cloud",
                status: "Em Execução",
                bgStatus: "bg-[#7ab035]",
                border: "border-l-[#7ab035]",
                desc: "Modernização da infraestrutura com migração de servidores críticos para ambiente cloud híbrido.",
                date: "out/2025 - mar/2026",
                tag: "⚠️ Múltiplos setores",
                tagColor: "bg-amber-50 text-amber-600 border-amber-100",
                btnColor: "text-[#7ab035]"
              },
              {
                title: "Novo Sistema de Autenticação SSO",
                status: "Em Planejamento",
                bgStatus: "bg-slate-100 text-slate-500 border border-slate-200",
                border: "border-l-slate-300",
                desc: "Implementação de Single Sign-On para todos os sistemas corporativos, simplificando o acesso.",
                date: "jan/2026 - jun/2026",
                tag: "🚨 Impacta toda a Senior",
                tagColor: "bg-red-50 text-red-600 border-red-100",
                btnColor: "text-slate-500"
              },
              {
                title: "Atualização do ERP Senior X",
                status: "Agendado",
                bgStatus: "bg-blue-100 text-blue-600",
                border: "border-l-blue-500",
                desc: "Atualização programada para a nova versão estável do ERP, trazendo melhorias de performance.",
                date: "nov/2025",
                tag: "⚠️ Indisponibilidade Programada",
                tagColor: "bg-amber-50 text-amber-600 border-amber-100",
                btnColor: "text-blue-600"
              },
              {
                title: "Política de Segurança da Informação",
                status: "Em Revisão",
                bgStatus: "bg-purple-100 text-purple-600",
                border: "border-l-purple-500",
                desc: "Revisão e atualização das normas de segurança para adequação às novas diretrizes da LGPD.",
                date: "dez/2025",
                tag: "ℹ️ Informativo",
                tagColor: "bg-blue-50 text-blue-600 border-blue-100",
                btnColor: "text-purple-600"
              },
              {
                title: "Expansão da Rede Wi-Fi Corporativa",
                status: "Concluído",
                bgStatus: "bg-green-100 text-green-700",
                border: "border-l-green-600",
                desc: "Finalizada a instalação de novos pontos de acesso para cobertura total no novo prédio anexo.",
                date: "out/2025",
                tag: "✅ Infraestrutura",
                tagColor: "bg-green-50 text-green-700 border-green-100",
                btnColor: "text-green-700"
              },
              {
                title: "Treinamento em IA Generativa",
                status: "Inscrições Abertas",
                bgStatus: "bg-indigo-100 text-indigo-700",
                border: "border-l-indigo-600",
                desc: "Workshop prático para colaboradores sobre uso eficiente de ferramentas de IA no dia a dia.",
                date: "jan/2026",
                tag: "🎓 Capacitação",
                tagColor: "bg-indigo-50 text-indigo-700 border-indigo-100",
                btnColor: "text-indigo-700"
              }
            ].map((item, index) => (
              <div key={index} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0">
                <Card className={`h-full border-l-4 ${item.border} hover:shadow-md transition-all`}>
                  <CardContent className="p-5 space-y-4 h-full flex flex-col">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-slate-800 leading-snug line-clamp-2">{item.title}</h3>
                      <span className={`shrink-0 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${item.bgStatus}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">
                      {item.desc}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[10px] pt-2 mt-auto">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3 h-3" /> {item.date}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${item.tagColor}`}>
                        {item.tag}
                      </span>
                    </div>
                    <button className={`text-xs font-semibold ${item.btnColor} flex items-center hover:underline mt-2`}>
                      Saiba mais <ChevronRight className="w-3 h-3 ml-0.5" />
                    </button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
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
            onClick={() => navigate('/iniciativas?new=true')} // Assuming query param logic or just nav
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {/* Section: Quick Access */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Acesso Rápido</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <QuickAccessCard icon={Wrench} label="Listagem de Melhorias" />
            <QuickAccessCard icon={FolderKanban} label="Iniciativas de Projetos" />
            <QuickAccessCard icon={FileText} label="Listagem de Projetos" />
            <QuickAccessCard icon={BarChart3} label="Status Report" />
            <QuickAccessCard icon={Users} label="Indicadores" />
          </div>

          <div className="mt-8 relative overflow-hidden rounded-xl bg-gradient-to-r from-[#7ab035]/10 to-green-50 border border-[#7ab035]/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800">Precisa registrar uma nova iniciativa?</h3>
              <p className="text-sm text-slate-600">Cadastre agora e acompanhe o andamento em tempo real junto com a equipe de TI.</p>
            </div>
            <Button
              className="bg-[#7ab035] hover:bg-[#6a992d] text-white font-bold shadow-lg shadow-green-900/10 whitespace-nowrap"
              onClick={() => navigate('/iniciativas?new=true')}
            >
              Nova Iniciativa <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Section: FAQ */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <HelpCircle className="w-4 h-4" />
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
                <button key={i} className="w-full text-left p-4 text-xs font-medium text-slate-600 hover:text-[#7ab035] hover:bg-slate-50 transition-colors flex justify-between items-center group">
                  {item}
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-[#7ab035]" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function QuickAccessCard({ icon: Icon, label }: { icon: React.ElementType, label: string }) {
  return (
    <button className="flex flex-col items-center justify-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-[#7ab035] hover:shadow-md hover:-translate-y-1 transition-all duration-300 group h-32">
      <div className="p-3 rounded-full bg-slate-50 text-slate-500 group-hover:bg-[#7ab035] group-hover:text-white transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-medium text-slate-600 text-center group-hover:text-slate-900">
        {label}
      </span>
    </button>
  );
}
