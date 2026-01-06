import {Home,Users,BookOpen,Box, Lightbulb,Calendar, Headphones, Mail, MapPin,} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer id="footer" className="bg-black text-white px-6 py-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-16 lg:grid-cols-4">

        <div className="space-y-10">
          <div className="flex items-start gap-6">
            <div className="flex items-center relative w-24 h-24">
              <Image
			  	  src="/logosuperior.svg"
                  fill
                  alt="Instituto Federal de Alagoas"
                  className="object-contain"
			  	/>
            </div>

            <div className="pt-1">
              <h3 className="text-xl font-semibold text-[#FACC15] leading-tight">
                Espaço 4.0
              </h3>
              <p className="text-gray-500 text-[14px]">
                Laboratório de inovação
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14">
                <Image
                  src="/if.svg"
                  fill
                  alt="Instituto Federal de Alagoas"
                  className="object-contain"
                />
              </div>

              <div className="text-sm leading-tight">
                <p className="font-semibold text-[#FACC15]">
                  INSTITUTO FEDERAL
                </p>
                <p className="text-[#FACC15]">Alagoas</p>
                <p className="text-[#FACC15]">Campus Arapiraca</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-[#FACC15] font-semibold mb-8 text-lg">
            Navegação
          </h4>
          <ul className="space-y-6">
            <FooterItem icon={Home} title="Sobre" desc="Conheça nossa história" />
            <FooterItem icon={Users} title="Equipe" desc="Nossos colaboradores" />
            <FooterItem icon={BookOpen} title="Cursos" desc="Capacitações oferecidas" />
          </ul>
        </div>

        {/* RECURSOS */}
        <div>
          <h4 className="text-[#FACC15] font-semibold mb-8 text-lg">
            Recursos
          </h4>
          <ul className="space-y-6">
            <FooterItem icon={Box} title="Reserva de Equipamentos" desc="Agende recursos" />
            <FooterItem icon={Lightbulb} title="Projetos" desc="Desenvolva suas ideias" />
            <FooterItem icon={Calendar} title="Eventos" desc="Participe de atividades" />
          </ul>
        </div>

        <div>
          <h4 className="text-[#FACC15] font-semibold mb-8 text-lg">
            Suporte
          </h4>
          <ul className="space-y-6">
            <FooterItem icon={Headphones} title="Central de Ajuda" desc="Tire suas dúvidas" />
            <FooterItem icon={Mail} title="Fale Conosco" desc="espaco4.0@ifal.edu.br" />
            <FooterItem icon={MapPin} title="Como Chegar" desc="IFAL Campus Arapiraca" />
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 mt-20 pt-6 text-center text-sm text-gray-500">
        © 2026 Espaço 4.0 – IFAL Campus Arapiraca. Todos os direitos reservados.
      </div>
    </footer>
  );
}

type FooterItemProps = Readonly<{
  icon: LucideIcon;
  title: string;
  desc: string;
}>;

function FooterItem({ icon: Icon, title, desc }: FooterItemProps) {
  return (
    <li className="flex gap-5 items-start">
      <div className="bg-[#FACC15] text-black p-4 rounded-2xl shrink-0">
        <Icon size={20} />
      </div>
      <div>
        <p className="font-medium text-base leading-tight">
          {title}
        </p>
        <p className="text-sm text-gray-400">
          {desc}
        </p>
      </div>
    </li>
  );
}
