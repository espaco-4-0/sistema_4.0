export type CourseDetails = {
    id: number;
    title: string;
    instructor: string;
    description: string;
    longDescription: string;
    durationWeeks: number;
    subscribes: number;
    maxSubscribes: number;
    level: string;
    category: "progamacao" | "dados" | "design" | "marketing";
    startDate: string;
    endDate: string;
    weekDays: string[];
    schedule: string;
    location: string;
    cardImage: string;
    gallery: {
        id: number;
        url: string;
        alt?: string;
    }[];

    topics: {
        id: number;
        title: string;
    }[];

    requirements: {
        id: number;
        label: string;
    }[];
};

export const courses: CourseDetails[] = [
    {
        id: 1,
        title: "Introdução ao React",
        instructor: "Professor Lucas Andrade",
        description: "Fundamentos do React e componentização",
        longDescription:
            "Este curso apresenta os fundamentos do React de forma prática e progressiva. Você aprenderá a pensar em componentes, entenderá como o Virtual DOM funciona e dominará a criação de interfaces dinâmicas utilizando JSX. Ao longo das aulas, construiremos uma aplicação real, passando pelo gerenciamento de estado com useState e a comunicação entre componentes via props, estabelecendo uma base sólida para sua carreira no ecossistema JavaScript.",
        durationWeeks: 4,
        subscribes: 24,
        maxSubscribes: 150,
        level: "Iniciante",
        category: "progamacao",
        startDate: "2026-02-01",
        endDate: "2026-03-01",
        weekDays: ["Segunda", "Quarta"],
        schedule: "14:00 - 16:00",
        location: "IFAL - Sala 01",
        cardImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80",
        gallery: [
            {
                id: 1,
                url: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=800&q=80",
                alt: "Aula React",
            },
            {
                id: 2,
                url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80",
                alt: "Componentes",
            },
            {
                id: 3,
                url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
                alt: "Trabalho em equipe",
            },
        ],
        topics: [
            { id: 1, title: "Conceitos fundamentais do React" },
            { id: 2, title: "JSX e renderização de componentes" },
            { id: 3, title: "Props e estado" },
            { id: 4, title: "Eventos e ciclo de vida básico" },
            { id: 5, title: "Boas práticas de componentização" },
        ],
        requirements: [
            { id: 1, label: "Conhecimentos básicos de HTML" },
            { id: 2, label: "Conhecimentos básicos de CSS" },
            { id: 3, label: "JavaScript básico" },
        ],
    },

    {
        id: 2,
        title: "React Avançado",
        instructor: "Professor Rafael Menezes",
        description: "Hooks avançados, performance e padrões",
        longDescription:
            "Curso focado em aprofundar conhecimentos no ecossistema React para quem já domina o básico. Exploramos o uso avançado de Hooks (useMemo, useCallback, useReducer) para otimização de performance e controle de efeitos colaterais. Você aprenderá padrões de design de componentes (Design Patterns), gerenciamento de estado complexo com Context API e Redux, além de técnicas de memoização para evitar renderizações desnecessárias em aplicações de grande escala.",
        durationWeeks: 6,
        subscribes: 18,
        maxSubscribes: 120,
        level: "Avançado",
        category: "progamacao",
        startDate: "2026-02-10",
        endDate: "2026-03-24",
        weekDays: ["Terça", "Quinta"],
        schedule: "18:00 - 20:00",
        location: "IFAL - Sala 02",
        cardImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        gallery: [
            {
                id: 1,
                url: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80",
                alt: "Padrões avançados",
            },
            {
                id: 2,
                url: "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?auto=format&fit=crop&w=800&q=80",
                alt: "Otimização",
            },
            {
                id: 3,
                url: "https://images.unsplash.com/photo-1555066931-bf19f8fd1085?auto=format&fit=crop&w=800&q=80",
                alt: "Hooks",
            },
        ],
        topics: [
            { id: 1, title: "Hooks avançados (Ex.: useMemo, useCallback ...)" },
            { id: 2, title: "Context API em larga escala" },
            { id: 3, title: "Performance e renderizações" },
            { id: 4, title: "Padrões de componentes" },
            { id: 5, title: "Arquitetura de aplicações React" },
            { id: 6, title: "Gerenciamento de estado avançado" },
        ],
        requirements: [
            { id: 1, label: "React intermediário" },
            { id: 2, label: "JavaScript moderno" },
            { id: 3, label: "Experiência com hooks básicos" },
            { id: 4, label: "Conhecimento de componentização" },
        ],
    },

    {
        id: 3,
        title: "TypeScript Essencial",
        instructor: "Professora Mariana Lopes",
        description: "Tipagem estática aplicada ao dia a dia",
        longDescription:
            "Este curso ensina TypeScript de forma aplicada, focando em como a tipagem estática pode reduzir bugs e melhorar a produtividade do desenvolvedor. Aprenda a definir interfaces, tipos customizados, enums e a poderosa utilização de Generics para criar códigos reutilizáveis e seguros. Veremos como configurar o ambiente de desenvolvimento, integrar o TS em projetos JavaScript existentes e como extrair o máximo de inteligência do VS Code durante o desenvolvimento.",
        durationWeeks: 5,
        subscribes: 30,
        maxSubscribes: 200,
        level: "Iniciante",
        category: "progamacao",
        startDate: "2026-02-05",
        endDate: "2026-03-12",
        weekDays: ["Segunda", "Quarta", "Sexta"],
        schedule: "15:00 - 17:00",
        location: "IFAL - Sala 03",
        cardImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=600&q=80",
        gallery: [
            {
                id: 1,
                url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80",
                alt: "TypeScript",
            },
            {
                id: 2,
                url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80",
                alt: "Tipos",
            },
            {
                id: 3,
                url: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=800&q=80",
                alt: "IDE",
            },
        ],
        topics: [
            { id: 1, title: "Tipos primitivos e avançados" },
            { id: 2, title: "Interfaces e types" },
            { id: 3, title: "Generics" },
            { id: 4, title: "Tipagem em funções e classes" },
            { id: 5, title: "Integração com projetos JavaScript" },
        ],
        requirements: [
            { id: 1, label: "JavaScript básico" },
            { id: 2, label: "Conhecimento de lógica de programação" },
            { id: 3, label: "Noções de ES6+" },
        ],
    },

    {
        id: 4,
        title: "Next.js Fundamentals",
        instructor: "Professor Bruno Almeida",
        description: "SSR, SSG e App Router",
        longDescription:
            "Descubra por que o Next.js é o framework React favorito das empresas. Neste curso, abordamos a fundo o novo App Router, as estratégias de renderização como Server Side Rendering (SSR) e Static Site Generation (SSG), e como otimizar imagens e fontes nativamente. Você aprenderá a criar rotas dinâmicas, layouts reaproveitáveis e entenderá como o Next.js lida com SEO de forma automática para colocar seu site no topo dos mecanismos de busca.",
        durationWeeks: 4,
        subscribes: 26,
        maxSubscribes: 250,
        level: "Intermediário",
        category: "progamacao",
        startDate: "2026-02-12",
        endDate: "2026-03-12",
        weekDays: ["Terça", "Quinta"],
        schedule: "16:00 - 18:30",
        location: "IFAL - Sala 04",
        cardImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
        gallery: [
            {
                id: 1,
                url: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=800&q=80",
                alt: "Next.js",
            },
            {
                id: 2,
                url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
                alt: "SSR/SSG",
            },
            {
                id: 3,
                url: "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=800&q=80",
                alt: "Performance",
            },
        ],
        topics: [
            { id: 1, title: "Fundamentos do Next.js" },
            { id: 2, title: "SSR e SSG" },
            { id: 3, title: "App Router" },
            { id: 4, title: "Rotas e layouts" },
            { id: 5, title: "SEO e performance" },
        ],
        requirements: [
            { id: 1, label: "React básico" },
            { id: 2, label: "JavaScript intermediário" },
            { id: 3, label: "Conhecimento de HTML e CSS" },
        ],
    },

    {
        id: 5,
        title: "Next.js Avançado",
        instructor: "Professor Eduardo Nogueira",
        description: "Auth, middleware e otimização",
        longDescription:
            "Leve suas aplicações Next.js para o nível profissional. Este curso foca em funcionalidades críticas para produção: implementação de Middlewares para proteção de rotas, estratégias complexas de cache e revalidação de dados (ISR), e otimização extrema de performance com Server Components. Discutiremos arquitetura de software para aplicações escaláveis e como gerenciar variáveis de ambiente de forma segura em diferentes ambientes de deploy.",
        durationWeeks: 6,
        subscribes: 21,
        maxSubscribes: 160,
        level: "Avançado",
        category: "progamacao",
        startDate: "2026-02-20",
        endDate: "2026-04-03",
        weekDays: ["Segunda", "Quarta"],
        schedule: "19:00 - 21:00",
        location: "IFAL - Sala 05",
        cardImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=600&q=80",
        gallery: [
            {
                id: 1,
                url: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=800&q=80",
                alt: "Middlewares",
            },
            {
                id: 2,
                url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
                alt: "Cache",
            },
            {
                id: 3,
                url: "https://images.unsplash.com/photo-1526378722430-4f3a74f9dcb1?auto=format&fit=crop&w=800&q=80",
                alt: "Produção",
            },
        ],
        topics: [
            { id: 1, title: "Autenticação e autorização" },
            { id: 2, title: "Middlewares" },
            { id: 3, title: "Otimização de performance" },
            { id: 4, title: "Cache e revalidação" },
            { id: 5, title: "Boas práticas para produção" },
        ],
        requirements: [
            { id: 1, label: "Next.js intermediário" },
            { id: 2, label: "React avançado" },
            { id: 3, label: "Conhecimento de APIs" },
            { id: 4, label: "Experiência com deploy" },
        ],
    },

    {
        id: 6,
        title: "Node.js Backend",
        instructor: "Professor Diego Ramos",
        description: "APIs REST com boas práticas",
        longDescription:
            "Mergulhe no desenvolvimento backend com Node.js. Neste curso, você aprenderá a construir APIs REST robustas e escaláveis utilizando Express. Abordaremos desde o ciclo de vida de uma requisição HTTP até o tratamento centralizado de erros, passando por middlewares de autenticação, validação de dados e integração com bancos de dados. O foco é ensinar as convenções de mercado e como estruturar pastas de um projeto para que ele seja sustentável a longo prazo.",
        durationWeeks: 5,
        subscribes: 28,
        maxSubscribes: 180,
        level: "Intermediário",
        category: "progamacao",
        startDate: "2026-02-15",
        endDate: "2026-03-22",
        weekDays: ["Terça", "Quinta"],
        schedule: "14:00 - 17:00",
        location: "IFAL - Sala 06",
        cardImage: "https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=600&q=80",
        gallery: [
            {
                id: 1,
                url: "https://images.unsplash.com/photo-1555949963-fcdb3fef48b0?auto=format&fit=crop&w=800&q=80",
                alt: "API REST",
            },
            {
                id: 2,
                url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
                alt: "Express",
            },
            {
                id: 3,
                url: "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?auto=format&fit=crop&w=800&q=80",
                alt: "Backend",
            },
        ],
        topics: [
            { id: 1, title: "Fundamentos do Node.js" },
            { id: 2, title: "Criação de APIs REST" },
            { id: 3, title: "Middlewares" },
            { id: 4, title: "Tratamento de erros" },
            { id: 5, title: "Boas práticas de backend" },
        ],
        requirements: [
            { id: 1, label: "JavaScript intermediário" },
            { id: 2, label: "Conhecimento de HTTP" },
            { id: 3, label: "Noções de backend" },
        ],
    },

    {
        id: 7,
        title: "Prisma ORM",
        instructor: "Monitora Ana Souza",
        description: "Modelagem e acesso a dados",
        longDescription:
            "Aprenda a manipular bancos de dados com a facilidade do TypeScript usando o Prisma ORM. Este curso prático ensina como modelar dados através do Prisma Schema, realizar migrações de forma segura e executar consultas complexas com máxima segurança de tipos. Veremos relacionamentos um-para-um, um-para-muitos e muitos-para-muitos, além de técnicas de 'eager loading' e 'lazy loading' para otimizar suas queries no backend.",
        durationWeeks: 3,
        subscribes: 12,
        maxSubscribes: 100,
        level: "Intermediário",
        category: "dados",
        startDate: "2026-03-01",
        endDate: "2026-03-22",
        weekDays: ["Segunda", "Quarta"],
        schedule: "15:00 - 17:00",
        location: "IFAL - Sala 07",
        cardImage: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80",
        gallery: [
            {
                id: 1,
                url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
                alt: "Prisma",
            },
            {
                id: 2,
                url: "https://images.unsplash.com/photo-1526378722430-4f3a74f9dcb1?auto=format&fit=crop&w=800&q=80",
                alt: "ORM",
            },
            {
                id: 3,
                url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
                alt: "Banco de dados",
            },
        ],
        topics: [
            { id: 1, title: "Modelagem de dados" },
            { id: 2, title: "Schemas e migrações" },
            { id: 3, title: "Relacionamentos" },
            { id: 4, title: "Consultas eficientes" },
        ],
        requirements: [
            { id: 1, label: "Node.js básico" },
            { id: 2, label: "Conhecimento de banco de dados" },
            { id: 3, label: "SQL básico" },
        ],
    },

    {
        id: 8,
        title: "PostgreSQL para Devs",
        instructor: "Professor Carlos Tavares",
        description: "SQL, índices e performance",
        longDescription:
            "Um desenvolvedor completo precisa dominar os dados. Este curso vai além do básico do SQL e ensina como o PostgreSQL funciona 'sob o capô'. Você aprenderá a criar esquemas eficientes, utilizar índices para acelerar consultas lentas, entenderá planos de execução (EXPLAIN ANALYZE) e como garantir a integridade dos dados com constraints e transações ACID. Essencial para quem deseja construir sistemas que suportam milhares de acessos.",
        durationWeeks: 4,
        subscribes: 16,
        maxSubscribes: 170,
        level: "Iniciante",
        category: "dados",
        startDate: "2026-03-05",
        endDate: "2026-04-02",
        weekDays: ["Terça", "Quinta"],
        schedule: "16:00 - 18:00",
        location: "IFAL - Sala 08",
        cardImage: "https://images.unsplash.com/photo-1585079542156-2755d9c8a094?auto=format&fit=crop&w=600&q=80",
        gallery: [
            {
                id: 1,
                url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80",
                alt: "PostgreSQL",
            },
            {
                id: 2,
                url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
                alt: "SQL",
            },
            {
                id: 3,
                url: "https://images.unsplash.com/photo-1526378722430-4f3a74f9dcb1?auto=format&fit=crop&w=800&q=80",
                alt: "Performance",
            },
        ],
        topics: [
            { id: 1, title: "Fundamentos de SQL" },
            { id: 2, title: "Criação de tabelas" },
            { id: 3, title: "Índices e performance" },
            { id: 4, title: "Consultas avançadas" },
            { id: 5, title: "Boas práticas" },
        ],
        requirements: [
            { id: 1, label: "Lógica de programação" },
            { id: 2, label: "Conhecimento básico de backend" },
            { id: 3, label: "Interesse em banco de dados" },
        ],
    },

    {
        id: 9,
        title: "Autenticação com NextAuth",
        instructor: "Monitora Beatriz Lima",
        description: "Sessões, JWT e providers",
        longDescription:
            "Aprenda a implementar o padrão de segurança mais moderno para Next.js. Este curso foca totalmente no NextAuth.js (Auth.js), cobrindo desde o login social (Google, GitHub) até a autenticação customizada com e-mail e senha. Veremos como gerenciar sessões no cliente e no servidor, como trabalhar com JSON Web Tokens (JWT) e como proteger páginas e rotas de API de forma simples e segura.",
        durationWeeks: 3,
        subscribes: 27,
        maxSubscribes: 130,
        level: "Intermediário",
        category: "progamacao",
        startDate: "2026-03-08",
        endDate: "2026-03-29",
        weekDays: ["Segunda", "Quarta", "Sexta"],
        schedule: "17:00 - 19:00",
        location: "IFAL - Sala 09",
        cardImage: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80",
        gallery: [
            {
                id: 1,
                url: "https://images.unsplash.com/photo-1526378722430-4f3a74f9dcb1?auto=format&fit=crop&w=800&q=80",
                alt: "NextAuth",
            },
            {
                id: 2,
                url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
                alt: "OAuth",
            },
            {
                id: 3,
                url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
                alt: "Sessões",
            },
        ],
        topics: [
            { id: 1, title: "Conceitos de autenticação" },
            { id: 2, title: "JWT e sessões" },
            { id: 3, title: "Providers OAuth" },
            { id: 4, title: "Proteção de rotas" },
        ],
        requirements: [
            { id: 1, label: "Next.js básico" },
            { id: 2, label: "React intermediário" },
            { id: 3, label: "Conhecimento de APIs" },
        ],
    },

    {
        id: 10,
        title: "Segurança Web",
        instructor: "Professor André Pacheco",
        description: "OWASP, IDOR e boas práticas",
        longDescription:
            "A segurança não deve ser um 'detalhe' no seu projeto, mas a fundação. Neste curso, abordamos as principais vulnerabilidades listadas pela OWASP, como Injeção de SQL, Cross-Site Scripting (XSS) e IDOR. Você aprenderá como hackers exploram falhas comuns e, mais importante, como se defender utilizando cabeçalhos HTTP de segurança, validação rigorosa de dados e políticas de autorização robustas.",
        durationWeeks: 4,
        subscribes: 22,
        maxSubscribes: 200,
        level: "Iniciante",
        category: "progamacao",
        startDate: "2026-03-12",
        endDate: "2026-04-09",
        weekDays: ["Terça", "Quinta"],
        schedule: "18:00 - 20:00",
        location: "IFAL - Sala 10",
        cardImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
        gallery: [
            {
                id: 1,
                url: "https://images.unsplash.com/photo-1510511450818-9e4a9f3f4a4b?auto=format&fit=crop&w=800&q=80",
                alt: "Segurança web",
            },
            {
                id: 2,
                url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
                alt: "Proteção",
            },
            {
                id: 3,
                url: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80",
                alt: "OWASP",
            },
        ],
        topics: [
            { id: 1, title: "Princípios de segurança web" },
            { id: 2, title: "OWASP Top 10" },
            { id: 3, title: "Autorização e autenticação" },
            { id: 4, title: "Boas práticas de proteção" },
        ],
        requirements: [
            { id: 1, label: "Conhecimento básico de web" },
            { id: 2, label: "Noções de backend" },
            { id: 3, label: "Interesse em segurança" },
        ],
    },

    {
        id: 11,
        title: "Clean Code",
        instructor: "Professora Juliana Freitas",
        description: "Código legível e sustentável",
        longDescription:
            "Escrever código que funciona é fácil; difícil é escrever código que outros seres humanos consigam entender e manter. Este curso explora os princípios de Robert C. Martin (Uncle Bob), ensinando como dar nomes significativos a variáveis, criar funções pequenas e coesas, e como evitar comentários desnecessários através de um código autoexplicativo. Você aprenderá a identificar 'code smells' e a refatorar sistemas legados sem medo.",
        durationWeeks: 3,
        subscribes: 15,
        maxSubscribes: 250,
        level: "Iniciante",
        category: "progamacao",
        startDate: "2026-03-15",
        endDate: "2026-04-05",
        weekDays: ["Segunda", "Quarta"],
        schedule: "19:00 - 21:00",
        location: "IFAL - Sala 11",
        cardImage: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=600&q=80",
        gallery: [
            {
                id: 1,
                url: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=800&q=80",
                alt: "Clean Code",
            },
            {
                id: 2,
                url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
                alt: "Refatoração",
            },
            {
                id: 3,
                url: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80",
                alt: "Qualidade",
            },
        ],
        topics: [
            { id: 1, title: "Princípios do Clean Code" },
            { id: 2, title: "Nomenclatura e organização" },
            { id: 3, title: "Refatoração" },
            { id: 4, title: "Boas práticas gerais" },
        ],
        requirements: [
            { id: 1, label: "Conhecimento básico de programação" },
            { id: 2, label: "Experiência com qualquer linguagem" },
            { id: 3, label: "Interesse em qualidade de código" },
        ],
    },

    {
        id: 12,
        title: "Arquitetura Frontend",
        instructor: "Professor Felipe Moura",
        description: "Escalabilidade e padrões",
        longDescription:
            "Quando uma aplicação frontend cresce, a organização de arquivos e o fluxo de dados se tornam o maior desafio. Este curso ensina como estruturar grandes projetos React/Next.js, separando lógica de negócio de componentes visuais. Discutiremos padrões como Clean Architecture aplicada ao front, Modularização, uso inteligente de serviços e como escolher a melhor estratégia de gerenciamento de estado para cada cenário.",
        durationWeeks: 5,
        subscribes: 9,
        maxSubscribes: 100,
        level: "Iniciante",
        category: "design",
        startDate: "2026-03-18",
        endDate: "2026-04-22",
        weekDays: ["Terça", "Quinta"],
        schedule: "14:00 - 16:30",
        location: "IFAL - Sala 12",
        cardImage: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80",
        gallery: [
            {
                id: 1,
                url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
                alt: "Arquitetura",
            },
            {
                id: 2,
                url: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80",
                alt: "Estrutura",
            },
            {
                id: 3,
                url: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=800&q=80",
                alt: "Escalabilidade",
            },
        ],
        topics: [
            { id: 1, title: "Princípios de arquitetura" },
            { id: 2, title: "Padrões frontend" },
            { id: 3, title: "Organização de projetos" },
            { id: 4, title: "Escalabilidade" },
            { id: 5, title: "Manutenção de código" },
        ],
        requirements: [
            { id: 1, label: "React básico" },
            { id: 2, label: "JavaScript intermediário" },
            { id: 3, label: "Conhecimento de projetos frontend" },
        ],
    },

    {
        id: 13,
        title: "Testes com Jest",
        instructor: "Monitor Paulo Henrique",
        description: "Testes unitários e de integração",
        longDescription:
            "Durma tranquilo sabendo que seu código funciona. Este curso ensina a cultura de testes automatizados utilizando Jest e React Testing Library. Aprenderemos a criar testes unitários para funções lógicas, testes de integração para componentes e como fazer 'mocks' de chamadas de API. Você entenderá o que é cobertura de código e como o TDD (Test Driven Development) pode mudar sua forma de programar para melhor.",
        durationWeeks: 4,
        subscribes: 19,
        maxSubscribes: 120,
        level: "Intermediário",
        category: "progamacao",
        startDate: "2026-03-22",
        endDate: "2026-04-19",
        weekDays: ["Segunda", "Quarta", "Sexta"],
        schedule: "16:00 - 18:00",
        location: "IFAL - Sala 13",
        cardImage: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=600&q=80",
        gallery: [
            {
                id: 1,
                url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80",
                alt: "Jest",
            },
            {
                id: 2,
                url: "https://images.unsplash.com/photo-1555066931-bf19f8fd1085?auto=format&fit=crop&w=800&q=80",
                alt: "Testes",
            },
            {
                id: 3,
                url: "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?auto=format&fit=crop&w=800&q=80",
                alt: "Cobertura",
            },
        ],
        topics: [
            { id: 1, title: "Fundamentos de testes" },
            { id: 2, title: "Jest na prática" },
            { id: 3, title: "Mocks e spies" },
            { id: 4, title: "Testes de integração" },
            { id: 5, title: "Boas práticas de testes" },
        ],
        requirements: [
            { id: 1, label: "JavaScript intermediário" },
            { id: 2, label: "Conhecimento de projetos frontend ou backend" },
            { id: 3, label: "Noções de testes" },
        ],
    },
];
