import { Home, ChevronRight, Clock, Calendar, Users, Book, SquareCheck } from "lucide-react";
import Link from "next/link";
import CourseCard from "./course_card";
import { useState } from "react";
import { CourseHero } from "./course_hero";
import CourseForm from "./course_form";

export const courses = [
    {
        tittle: "Introdução ao React",
        instructor: "Professor Lucas Andrade",
        description: "Fundamentos do React e componentização",
        long_description:
            "Este curso apresenta os fundamentos do React de forma prática e progressiva. Você aprenderá a pensar em componentes, entenderá como o Virtual DOM funciona e dominará a criação de interfaces dinâmicas utilizando JSX. Ao longo das aulas, construiremos uma aplicação real, passando pelo gerenciamento de estado com useState e a comunicação entre componentes via props, estabelecendo uma base sólida para sua carreira no ecossistema JavaScript.",
        duration_weeks: 4,
        subscribes: 120,
        start: "2026-02-01",
        action: "inscrever",
        level: "Iniciante",
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
        ],
        topics: [
            "Conceitos fundamentais do React",
            "JSX e renderização de componentes",
            "Props e estado",
            "Eventos e ciclo de vida básico",
            "Boas práticas de componentização",
        ],
        requirements: ["Conhecimentos básicos de HTML", "Conhecimentos básicos de CSS", "JavaScript básico"],
    },

    {
        tittle: "React Avançado",
        instructor: "Professor Rafael Menezes",
        description: "Hooks avançados, performance e padrões",
        long_description:
            "Curso focado em aprofundar conhecimentos no ecossistema React para quem já domina o básico. Exploramos o uso avançado de Hooks (useMemo, useCallback, useReducer) para otimização de performance e controle de efeitos colaterais. Você aprenderá padrões de design de componentes (Design Patterns), gerenciamento de estado complexo com Context API e Redux, além de técnicas de memoização para evitar renderizações desnecessárias em aplicações de grande escala.",
        duration_weeks: 6,
        subscribes: 95,
        start: "2026-02-10",
        action: "inscrever",
        level: "Avançado",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1555066931-bf19f8fd1085?auto=format&fit=crop&w=800&q=80",
        ],
        topics: [
            "Hooks avançados (Ex.: useMemo, useCallback ...)",
            "Context API em larga escala",
            "Performance e renderizações",
            "Padrões de componentes",
            "Arquitetura de aplicações React",
            "Gerenciamento de estado avançado",
        ],
        requirements: [
            "React intermediário",
            "JavaScript moderno",
            "Experiência com hooks básicos",
            "Conhecimento de componentização",
        ],
    },

    {
        tittle: "TypeScript Essencial",
        instructor: "Professora Mariana Lopes",
        description: "Tipagem estática aplicada ao dia a dia",
        long_description:
            "Este curso ensina TypeScript de forma aplicada, focando em como a tipagem estática pode reduzir bugs e melhorar a produtividade do desenvolvedor. Aprenda a definir interfaces, tipos customizados, enums e a poderosa utilização de Generics para criar códigos reutilizáveis e seguros. Veremos como configurar o ambiente de desenvolvimento, integrar o TS em projetos JavaScript existentes e como extrair o máximo de inteligência do VS Code durante o desenvolvimento.",
        duration_weeks: 5,
        subscribes: 180,
        start: "2026-02-05",
        action: "inscrever",
        level: "Iniciante",
        image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=600&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=800&q=80",
        ],
        topics: [
            "Tipos primitivos e avançados",
            "Interfaces e types",
            "Generics",
            "Tipagem em funções e classes",
            "Integração com projetos JavaScript",
        ],
        requirements: ["JavaScript básico", "Conhecimento de lógica de programação", "Noções de ES6+"],
    },

    {
        tittle: "Next.js Fundamentals",
        instructor: "Professor Bruno Almeida",
        description: "SSR, SSG e App Router",
        long_description:
            "Descubra por que o Next.js é o framework React favorito das empresas. Neste curso, abordamos a fundo o novo App Router, as estratégias de renderização como Server Side Rendering (SSR) e Static Site Generation (SSG), e como otimizar imagens e fontes nativamente. Você aprenderá a criar rotas dinâmicas, layouts reaproveitáveis e entenderá como o Next.js lida com SEO de forma automática para colocar seu site no topo dos mecanismos de busca.",
        duration_weeks: 4,
        subscribes: 210,
        start: "2026-02-12",
        action: "inscrever",
        level: "Intermediário",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=800&q=80",
        ],
        topics: ["Fundamentos do Next.js", "SSR e SSG", "App Router", "Rotas e layouts", "SEO e performance"],
        requirements: ["React básico", "JavaScript intermediário", "Conhecimento de HTML e CSS"],
    },

    {
        tittle: "Next.js Avançado",
        instructor: "Professor Eduardo Nogueira",
        description: "Auth, middleware e otimização",
        long_description:
            "Leve suas aplicações Next.js para o nível profissional. Este curso foca em funcionalidades críticas para produção: implementação de Middlewares para proteção de rotas, estratégias complexas de cache e revalidação de dados (ISR), e otimização extrema de performance com Server Components. Discutiremos arquitetura de software para aplicações escaláveis e como gerenciar variáveis de ambiente de forma segura em diferentes ambientes de deploy.",
        duration_weeks: 6,
        subscribes: 130,
        start: "2026-02-20",
        action: "inscrever",
        level: "Avançado",
        image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=600&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1526378722430-4f3a74f9dcb1?auto=format&fit=crop&w=800&q=80",
        ],
        topics: [
            "Autenticação e autorização",
            "Middlewares",
            "Otimização de performance",
            "Cache e revalidação",
            "Boas práticas para produção",
        ],
        requirements: ["Next.js intermediário", "React avançado", "Conhecimento de APIs", "Experiência com deploy"],
    },

    {
        tittle: "Node.js Backend",
        instructor: "Professor Diego Ramos",
        description: "APIs REST com boas práticas",
        long_description:
            "Mergulhe no desenvolvimento backend com Node.js. Neste curso, você aprenderá a construir APIs REST robustas e escaláveis utilizando Express. Abordaremos desde o ciclo de vida de uma requisição HTTP até o tratamento centralizado de erros, passando por middlewares de autenticação, validação de dados e integração com bancos de dados. O foco é ensinar as convenções de mercado e como estruturar pastas de um projeto para que ele seja sustentável a longo prazo.",
        duration_weeks: 5,
        subscribes: 160,
        start: "2026-02-15",
        action: "inscrever",
        level: "Intermediário",
        image: "https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=600&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1555949963-fcdb3fef48b0?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?auto=format&fit=crop&w=800&q=80",
        ],
        topics: [
            "Fundamentos do Node.js",
            "Criação de APIs REST",
            "Middlewares",
            "Tratamento de erros",
            "Boas práticas de backend",
        ],
        requirements: ["JavaScript intermediário", "Conhecimento de HTTP", "Noções de backend"],
    },

    {
        tittle: "Prisma ORM",
        instructor: "Monitora Ana Souza",
        description: "Modelagem e acesso a dados",
        long_description:
            "Aprenda a manipular bancos de dados com a facilidade do TypeScript usando o Prisma ORM. Este curso prático ensina como modelar dados através do Prisma Schema, realizar migrações de forma segura e executar consultas complexas com máxima segurança de tipos. Veremos relacionamentos um-para-um, um-para-muitos e muitos-para-muitos, além de técnicas de 'eager loading' e 'lazy loading' para otimizar suas queries no backend.",
        duration_weeks: 3,
        subscribes: 90,
        start: "2026-03-01",
        action: "inscrever",
        level: "Intermediário",
        image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1526378722430-4f3a74f9dcb1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
        ],
        topics: ["Modelagem de dados", "Schemas e migrações", "Relacionamentos", "Consultas eficientes"],
        requirements: ["Node.js básico", "Conhecimento de banco de dados", "SQL básico"],
    },

    {
        tittle: "PostgreSQL para Devs",
        instructor: "Professor Carlos Tavares",
        description: "SQL, índices e performance",
        long_description:
            "Um desenvolvedor completo precisa dominar os dados. Este curso vai além do básico do SQL e ensina como o PostgreSQL funciona 'sob o capô'. Você aprenderá a criar esquemas eficientes, utilizar índices para acelerar consultas lentas, entenderá planos de execução (EXPLAIN ANALYZE) e como garantir a integridade dos dados com constraints e transações ACID. Essencial para quem deseja construir sistemas que suportam milhares de acessos.",
        duration_weeks: 4,
        subscribes: 140,
        start: "2026-03-05",
        action: "inscrever",
        level: "Iniciante",
        image: "https://images.unsplash.com/photo-1585079542156-2755d9c8a094?auto=format&fit=crop&w=600&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1526378722430-4f3a74f9dcb1?auto=format&fit=crop&w=800&q=80",
        ],
        topics: [
            "Fundamentos de SQL",
            "Criação de tabelas",
            "Índices e performance",
            "Consultas avançadas",
            "Boas práticas",
        ],
        requirements: ["Lógica de programação", "Conhecimento básico de backend", "Interesse em banco de dados"],
    },

    {
        tittle: "Autenticação com NextAuth",
        instructor: "Monitora Beatriz Lima",
        description: "Sessões, JWT e providers",
        long_description:
            "Aprenda a implementar o padrão de segurança mais moderno para Next.js. Este curso foca totalmente no NextAuth.js (Auth.js), cobrindo desde o login social (Google, GitHub) até a autenticação customizada com e-mail e senha. Veremos como gerenciar sessões no cliente e no servidor, como trabalhar com JSON Web Tokens (JWT) e como proteger páginas e rotas de API de forma simples e segura.",
        duration_weeks: 3,
        subscribes: 110,
        start: "2026-03-08",
        action: "inscrever",
        level: "Intermediário",
        image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1526378722430-4f3a74f9dcb1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
        ],
        topics: ["Conceitos de autenticação", "JWT e sessões", "Providers OAuth", "Proteção de rotas"],
        requirements: ["Next.js básico", "React intermediário", "Conhecimento de APIs"],
    },

    {
        tittle: "Segurança Web",
        instructor: "Professor André Pacheco",
        description: "OWASP, IDOR e boas práticas",
        long_description:
            "A segurança não deve ser um 'detalhe' no seu projeto, mas a fundação. Neste curso, abordamos as principais vulnerabilidades listadas pela OWASP, como Injeção de SQL, Cross-Site Scripting (XSS) e IDOR. Você aprenderá como hackers exploram falhas comuns e, mais importante, como se defender utilizando cabeçalhos HTTP de segurança, validação rigorosa de dados e políticas de autorização robustas.",
        duration_weeks: 4,
        subscribes: 175,
        start: "2026-03-12",
        action: "inscrever",
        level: "Iniciante",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1510511450818-9e4a9f3f4a4b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80",
        ],
        topics: [
            "Princípios de segurança web",
            "OWASP Top 10",
            "Autorização e autenticação",
            "Boas práticas de proteção",
        ],
        requirements: ["Conhecimento básico de web", "Noções de backend", "Interesse em segurança"],
    },

    {
        tittle: "Clean Code",
        instructor: "Professora Juliana Freitas",
        description: "Código legível e sustentável",
        long_description:
            "Escrever código que funciona é fácil; difícil é escrever código que outros seres humanos consigam entender e manter. Este curso explora os princípios de Robert C. Martin (Uncle Bob), ensinando como dar nomes significativos a variáveis, criar funções pequenas e coesas, e como evitar comentários desnecessários através de um código autoexplicativo. Você aprenderá a identificar 'code smells' e a refatorar sistemas legados sem medo.",
        duration_weeks: 3,
        subscribes: 220,
        start: "2026-03-15",
        action: "inscrever",
        level: "Iniciante",
        image: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=600&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80",
        ],
        topics: ["Princípios do Clean Code", "Nomenclatura e organização", "Refatoração", "Boas práticas gerais"],
        requirements: [
            "Conhecimento básico de programação",
            "Experiência com qualquer linguagem",
            "Interesse em qualidade de código",
        ],
    },

    {
        tittle: "Arquitetura Frontend",
        instructor: "Professor Felipe Moura",
        description: "Escalabilidade e padrões",
        long_description:
            "Quando uma aplicação frontend cresce, a organização de arquivos e o fluxo de dados se tornam o maior desafio. Este curso ensina como estruturar grandes projetos React/Next.js, separando lógica de negócio de componentes visuais. Discutiremos padrões como Clean Architecture aplicada ao front, Modularização, uso inteligente de serviços e como escolher a melhor estratégia de gerenciamento de estado para cada cenário.",
        duration_weeks: 5,
        subscribes: 80,
        start: "2026-03-18",
        action: "inscrever",
        level: "Iniciante",
        image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=800&q=80",
        ],
        topics: [
            "Princípios de arquitetura",
            "Padrões frontend",
            "Organização de projetos",
            "Escalabilidade",
            "Manutenção de código",
        ],
        requirements: ["React básico", "JavaScript intermediário", "Conhecimento de projetos frontend"],
    },

    {
        tittle: "Testes com Jest",
        instructor: "Monitor Paulo Henrique",
        description: "Testes unitários e de integração",
        long_description:
            "Durma tranquilo sabendo que seu código funciona. Este curso ensina a cultura de testes automatizados utilizando Jest e React Testing Library. Aprenderemos a criar testes unitários para funções lógicas, testes de integração para componentes e como fazer 'mocks' de chamadas de API. Você entenderá o que é cobertura de código e como o TDD (Test Driven Development) pode mudar sua forma de programar para melhor.",
        duration_weeks: 4,
        subscribes: 105,
        start: "2026-03-22",
        action: "inscrever",
        level: "Intermediário",
        image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=600&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1555066931-bf19f8fd1085?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?auto=format&fit=crop&w=800&q=80",
        ],
        topics: [
            "Fundamentos de testes",
            "Jest na prática",
            "Mocks e spies",
            "Testes de integração",
            "Boas práticas de testes",
        ],
        requirements: ["JavaScript intermediário", "Conhecimento de projetos frontend ou backend", "Noções de testes"],
    },
];

function formatDateBR(dateISO: string): string {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(dateISO));
}

export default function CoursesMainPage() {
    const [openCourse, setOpenCourse] = useState(false);
    const [actualTittle, setActualTittle] = useState("");
    const [actualDescription, setActualDescription] = useState("");
    const [actualLongDescription, setActualLongDescription] = useState("");
    const [actualDuration, setActualDuration] = useState("");
    const [actualLevel, setActualLevel] = useState("");
    const [actualStart, setActualStart] = useState("");
    const [actualStudents, setActualStudents] = useState(0);
    const [actualInsctructor, setActualInsctructor] = useState("");
    const [actualLearnings, setActualLearnings] = useState<string[]>(["", "", "", "", ""]);
    const [actualRequirements, setActualRequirements] = useState<string[]>(["", "", "", "", ""]);
    const [actualGallery, setActualGallery] = useState<string[]>(["", "", ""]);

    function showNewCourse(
        tittle: string,
        description: string,
        longDescription: string,
        durationWeeks: number,
        level: string,
        start: string,
        students: number,
        instructor: string,
        learnings: string[],
        requirements: string[],
        gallery: string[]
    ) {
        setOpenCourse(true);
        setActualTittle(tittle);
        setActualDescription(description);
        setActualLongDescription(longDescription);
        setActualLevel(level);
        setActualDuration(durationWeeks.toString());
        setActualStart(start);
        setActualStudents(students);
        setActualInsctructor(instructor);
        setActualLearnings(learnings);
        setActualRequirements(requirements);
        setActualGallery(gallery);
    }

    const rightInformations = [
        {
            icon: Clock,
            title: "Duração",
            description: actualDuration,
        },
        {
            icon: Calendar,
            title: "Carga Horária Flexível",
            description: actualStudents,
        },
        {
            icon: Users,
            title: "Instrutores Especialistas",
            description: actualInsctructor,
        },
        {
            icon: Book,
            title: "Certificação",
            description: actualStart,
        },
    ] as const;

    return (
        <section className="min-h-screen bg-gray-50 py-7 font-sans">
            <div className="mx-auto w-full">
                <div className="ml-2 flex h-auto min-h-12 flex-wrap items-center gap-1 p-2 px-4 pb-4 text-xs font-medium text-yellow-600 lg:px-20 2xl:px-80">
                    <Link href="/" className="flex items-center gap-1 text-gray-400 hover:underline">
                        <Home className="h-3 w-3" />
                        Home
                    </Link>
                    <ChevronRight size={12} className="text-gray-400" />
                    {!openCourse ? (
                        <span>Cursos do Espaço 4.0</span>
                    ) : (
                        <div className="flex flex-wrap items-center gap-1">
                            <button
                                className="cursor-pointer text-gray-400 hover:underline"
                                onClick={() => setOpenCourse(false)}
                            >
                                Cursos do Espaço 4.0
                            </button>
                            <ChevronRight size={12} className="text-gray-400" />
                            <span className="break-all">{actualTittle}</span>
                        </div>
                    )}
                </div>

                {!openCourse ? (
                    <>
                        <div className="flex min-h-60 flex-col justify-center bg-yellow-400 px-4 py-10 text-white lg:h-60 lg:px-20 2xl:px-80">
                            <h1 className="text-3xl font-semibold lg:text-5xl">Nossos cursos</h1>
                            <p className="mt-4 max-w-3xl text-lg lg:mt-8 lg:text-xl">
                                Descubra nossos cursos de tecnologia e transforme sua carreira.
                            </p>
                        </div>

                        <div className="mt-10 px-4 lg:px-20 2xl:px-80">
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2 lg:gap-15 2xl:grid-cols-3">
                                {courses.map((course, index) => (
                                    <CourseCard
                                        key={index}
                                        {...course}
                                        start={formatDateBR(course.start)}
                                        onAction={() =>
                                            showNewCourse(
                                                course.tittle,
                                                course.description,
                                                course.long_description,
                                                course.duration_weeks,
                                                course.level,
                                                course.start,
                                                course.subscribes,
                                                course.instructor,
                                                course.topics,
                                                course.requirements,
                                                course.gallery
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full">
                        <div className="w-full">
                            <CourseHero
                                title={actualTittle}
                                description={actualDescription}
                                level={actualLevel}
                                instructor={actualInsctructor}
                                students={actualStudents}
                                images={actualGallery}
                            />
                        </div>

                        <div className="mt-8 flex flex-col justify-center gap-8 px-4 lg:mt-12 lg:flex-row lg:px-20 2xl:px-80">
                            <div className="order-2 w-full lg:order-1 lg:flex-1">
                                <CourseForm course={actualTittle} setCloseCourse={setOpenCourse} />
                            </div>

                            <div className="order-1 flex w-full flex-col gap-4 lg:order-2 lg:w-96">
                                {rightInformations.map(({ icon: Icon, title, description }, index) => (
                                    <div
                                        key={index}
                                        className="flex h-auto min-h-20 w-full gap-4 rounded-xl bg-white p-5 shadow-lg transition-all hover:shadow-xl"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-yellow-100">
                                            <Icon className="h-6 w-6 text-yellow-500" />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <span className="text-sm font-semibold text-gray-600">{title}</span>
                                            <span className="text-muted-foreground text-xs">{description}</span>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex w-full flex-col gap-3 rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
                                    <h5 className="font-bold">Sobre o Curso</h5>
                                    <p className="text-sm text-gray-500">{actualLongDescription}</p>
                                </div>

                                <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
                                    <h5 className="text-md mb-2 font-bold">O que você vai aprender</h5>
                                    {actualLearnings.map((learning, index) => (
                                        <div
                                            key={index}
                                            className="flex w-full items-center gap-2 rounded-xl border border-green-300 bg-green-100 p-3 text-sm text-green-900"
                                        >
                                            <Book className="h-4 w-4 shrink-0" /> {learning}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex w-full flex-col gap-4 rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
                                    <h5 className="text-md mb-2 font-bold">Requisitos</h5>
                                    {actualRequirements.map((req, index) => (
                                        <div
                                            key={index}
                                            className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-gray-100 p-3 text-sm"
                                        >
                                            <SquareCheck className="h-4 w-4 shrink-0 text-yellow-400" /> {req}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
