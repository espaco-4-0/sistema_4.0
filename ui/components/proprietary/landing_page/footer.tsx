import {
  Home,
  Users,
  BookOpen,
  Lightbulb,
  Calendar,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const mapLink = "https://www.google.com/maps/search/?api=1&query=IFAL+Campus+Arapiraca";

  const whatsappLink = "https://wa.me/558597947611?text=Ol%C3%A1%2C%20professora%20Renata.%20Vim%20pelo%20site%20do%20espa%C3%A7o+4.0!!";

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
            <FooterItem
              icon={Home}
              title="Sobre"
              desc="Conheça nossa história"
              href="/#what-is"
            />
            <FooterItem
              icon={Users}
              title="Equipe"
              desc="Nossos colaboradores"
              href="/#blog"
            />
            <FooterItem
              icon={BookOpen}
              title="Cursos"
              desc="Capacitações oferecidas"
              href="/#courses"
            />
          </ul>
        </div>

        <div>
          <h4 className="text-[#FACC15] font-semibold mb-8 text-lg">
            Recursos
          </h4>
          <ul className="space-y-6">
            <FooterItem
              icon={Lightbulb}
              title="Projetos"
              desc="Conheça novidades"
              href="/#blog"
            />
            <FooterItem
              icon={Calendar}
              title="Eventos"
              desc="Participe de atividades"
              href="/calendar"
            />
          </ul>
        </div>

        <div>
          <h4 className="text-[#FACC15] font-semibold mb-8 text-lg">
            Suporte
          </h4>
          <ul className="space-y-6">
            <FooterItem
              icon={Mail}
              title="Email"
              desc="espaco4.0@ifal.edu.br"
              href="mailto:espaco4.0@ifal.edu.br"
            />

            <FooterItem
              icon={Phone}
              title="WhatsApp"
              desc="(85) 9794-7611"
              href={whatsappLink}
              external
            />

            <FooterItem
              icon={MapPin}
              title="Como Chegar"
              desc="IFAL Campus Arapiraca"
              href={mapLink}
              external
            />
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
  href: string;
  external?: boolean;
}>;

function FooterItem({ icon: Icon, title, desc, href, external = false }: FooterItemProps) {
  const target = external ? "_blank" : "_self";

  return (
    <li>
      <Link
        href={href}
        target={target}
        className="flex gap-5 items-start hover:opacity-80 transition-opacity group"
      >
        <div className="bg-[#FACC15] text-black p-4 rounded-2xl shrink-0 group-hover:scale-105 transition-transform">
          <Icon size={20} />
        </div>
        <div>
          <p className="font-medium text-base leading-tight">
            {title}
          </p>
          <p className="text-sm text-gray-400 mt-1 max-w-[200px] break-words">
            {desc}
          </p>
        </div>
      </Link>
    </li>
  );
}
