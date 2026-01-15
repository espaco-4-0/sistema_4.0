export type CourseDetails = {
    title: string;
    instructor: string;
    description: string;
    longDescription: string;
    durationWeeks: number;
    subscribes: number;
    level: string;
    startDate: string;
    cardImage: string;
    gallery: string[];
    topics: string[];
    requirements: string[];
};

export const courses: CourseDetails[] = [
    {
        title: "Introdução ao React",
        instructor: "Professor Lucas Andrade",
        description: "Fundamentos do React e componentização",
        longDescription:
            "Este curso apresenta os fundamentos do React de forma prática e progressiva. Você aprenderá a pensar em componentes, entenderá como o Virtual DOM funciona e dominará a criação de interfaces dinâmicas utilizando JSX. Ao longo das aulas, construiremos uma aplicação real, passando pelo gerenciamento de estado com useState e a comunicação entre componentes via props, estabelecendo uma base sólida para sua carreira no ecossistema JavaScript.",
        durationWeeks: 4,
        subscribes: 120,
        level: "Iniciante",
        startDate: "2026-02-01",
        cardImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80",
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
        title: "React Avançado",
        instructor: "Professor Rafael Menezes",
        description: "Hooks avançados, performance e padrões",
        longDescription:
            "Curso focado em aprofundar conhecimentos no ecossistema React para quem já domina o básico. Exploramos o uso avançado de Hooks (useMemo, useCallback, useReducer) para otimização de performance e controle de efeitos colaterais. Você aprenderá padrões de design de componentes (Design Patterns), gerenciamento de estado complexo com Context API e Redux, além de técnicas de memoização para evitar renderizações desnecessárias em aplicações de grande escala.",
        durationWeeks: 6,
        subscribes: 95,
        startDate: "2026-02-10",
        level: "Avançado",
        cardImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
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
        title: "TypeScript Essencial",
        instructor: "Professora Mariana Lopes",
        description: "Tipagem estática aplicada ao dia a dia",
        longDescription:
            "Este curso ensina TypeScript de forma aplicada, focando em como a tipagem estática pode reduzir bugs e melhorar a produtividade do desenvolvedor. Aprenda a definir interfaces, tipos customizados, enums e a poderosa utilização de Generics para criar códigos reutilizáveis e seguros. Veremos como configurar o ambiente de desenvolvimento, integrar o TS em projetos JavaScript existentes e como extrair o máximo de inteligência do VS Code durante o desenvolvimento.",
        durationWeeks: 5,
        subscribes: 180,
        level: "Iniciante",
        startDate: "2026-02-05",
        cardImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=600&q=80",
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
        title: "Next.js Fundamentals",
        instructor: "Professor Bruno Almeida",
        description: "SSR, SSG e App Router",
        longDescription:
            "Descubra por que o Next.js é o framework React favorito das empresas. Neste curso, abordamos a fundo o novo App Router, as estratégias de renderização como Server Side Rendering (SSR) e Static Site Generation (SSG), e como otimizar imagens e fontes nativamente. Você aprenderá a criar rotas dinâmicas, layouts reaproveitáveis e entenderá como o Next.js lida com SEO de forma automática para colocar seu site no topo dos mecanismos de busca.",
        durationWeeks: 4,
        subscribes: 210,
        startDate: "2026-02-12",
        level: "Intermediário",
        cardImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=800&q=80",
        ],
        topics: ["Fundamentos do Next.js", "SSR e SSG", "App Router", "Rotas e layouts", "SEO e performance"],
        requirements: ["React básico", "JavaScript intermediário", "Conhecimento de HTML e CSS"],
    },

    {
        title: "Next.js Avançado",
        instructor: "Professor Eduardo Nogueira",
        description: "Auth, middleware e otimização",
        longDescription:
            "Leve suas aplicações Next.js para o nível profissional. Este curso foca em funcionalidades críticas para produção: implementação de Middlewares para proteção de rotas, estratégias complexas de cache e revalidação de dados (ISR), e otimização extrema de performance com Server Components. Discutiremos arquitetura de software para aplicações escaláveis e como gerenciar variáveis de ambiente de forma segura em diferentes ambientes de deploy.",
        durationWeeks: 6,
        subscribes: 130,
        startDate: "2026-02-20",
        level: "Avançado",
        cardImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=600&q=80",
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
        title: "Node.js Backend",
        instructor: "Professor Diego Ramos",
        description: "APIs REST com boas práticas",
        longDescription:
            "Mergulhe no desenvolvimento backend com Node.js. Neste curso, você aprenderá a construir APIs REST robustas e escaláveis utilizando Express. Abordaremos desde o ciclo de vida de uma requisição HTTP até o tratamento centralizado de erros, passando por middlewares de autenticação, validação de dados e integração com bancos de dados. O foco é ensinar as convenções de mercado e como estruturar pastas de um projeto para que ele seja sustentável a longo prazo.",
        durationWeeks: 5,
        subscribes: 160,
        startDate: "2026-02-15",
        level: "Intermediário",
        cardImage: "https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&w=600&q=80",
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
        title: "Prisma ORM",
        instructor: "Monitora Ana Souza",
        description: "Modelagem e acesso a dados",
        longDescription:
            "Aprenda a manipular bancos de dados com a facilidade do TypeScript usando o Prisma ORM. Este curso prático ensina como modelar dados através do Prisma Schema, realizar migrações de forma segura e executar consultas complexas com máxima segurança de tipos. Veremos relacionamentos um-para-um, um-para-muitos e muitos-para-muitos, além de técnicas de 'eager loading' e 'lazy loading' para otimizar suas queries no backend.",
        durationWeeks: 3,
        subscribes: 90,
        startDate: "2026-03-01",
        level: "Intermediário",
        cardImage: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1526378722430-4f3a74f9dcb1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
        ],
        topics: ["Modelagem de dados", "Schemas e migrações", "Relacionamentos", "Consultas eficientes"],
        requirements: ["Node.js básico", "Conhecimento de banco de dados", "SQL básico"],
    },

    {
        title: "PostgreSQL para Devs",
        instructor: "Professor Carlos Tavares",
        description: "SQL, índices e performance",
        longDescription:
            "Um desenvolvedor completo precisa dominar os dados. Este curso vai além do básico do SQL e ensina como o PostgreSQL funciona 'sob o capô'. Você aprenderá a criar esquemas eficientes, utilizar índices para acelerar consultas lentas, entenderá planos de execução (EXPLAIN ANALYZE) e como garantir a integridade dos dados com constraints e transações ACID. Essencial para quem deseja construir sistemas que suportam milhares de acessos.",
        durationWeeks: 4,
        subscribes: 140,
        level: "Iniciante",
        startDate: "2026-03-05",
        cardImage: "https://images.unsplash.com/photo-1585079542156-2755d9c8a094?auto=format&fit=crop&w=600&q=80",
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
        title: "Autenticação com NextAuth",
        instructor: "Monitora Beatriz Lima",
        description: "Sessões, JWT e providers",
        longDescription:
            "Aprenda a implementar o padrão de segurança mais moderno para Next.js. Este curso foca totalmente no NextAuth.js (Auth.js), cobrindo desde o login social (Google, GitHub) até a autenticação customizada com e-mail e senha. Veremos como gerenciar sessões no cliente e no servidor, como trabalhar com JSON Web Tokens (JWT) e como proteger páginas e rotas de API de forma simples e segura.",
        durationWeeks: 3,
        subscribes: 110,
        startDate: "2026-03-08",
        level: "Intermediário",
        cardImage: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1526378722430-4f3a74f9dcb1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
        ],
        topics: ["Conceitos de autenticação", "JWT e sessões", "Providers OAuth", "Proteção de rotas"],
        requirements: ["Next.js básico", "React intermediário", "Conhecimento de APIs"],
    },

    {
        title: "Segurança Web",
        instructor: "Professor André Pacheco",
        description: "OWASP, IDOR e boas práticas",
        longDescription:
            "A segurança não deve ser um 'detalhe' no seu projeto, mas a fundação. Neste curso, abordamos as principais vulnerabilidades listadas pela OWASP, como Injeção de SQL, Cross-Site Scripting (XSS) e IDOR. Você aprenderá como hackers exploram falhas comuns e, mais importante, como se defender utilizando cabeçalhos HTTP de segurança, validação rigorosa de dados e políticas de autorização robustas.",
        durationWeeks: 4,
        subscribes: 175,
        level: "Iniciante",
        startDate: "2026-03-12",
        cardImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
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
        title: "Clean Code",
        instructor: "Professora Juliana Freitas",
        description: "Código legível e sustentável",
        longDescription:
            "Escrever código que funciona é fácil; difícil é escrever código que outros seres humanos consigam entender e manter. Este curso explora os princípios de Robert C. Martin (Uncle Bob), ensinando como dar nomes significativos a variáveis, criar funções pequenas e coesas, e como evitar comentários desnecessários através de um código autoexplicativo. Você aprenderá a identificar 'code smells' e a refatorar sistemas legados sem medo.",
        durationWeeks: 3,
        subscribes: 220,
        level: "Iniciante",
        startDate: "2026-03-15",
        cardImage: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=600&q=80",
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
        title: "Arquitetura Frontend",
        instructor: "Professor Felipe Moura",
        description: "Escalabilidade e padrões",
        longDescription:
            "Quando uma aplicação frontend cresce, a organização de arquivos e o fluxo de dados se tornam o maior desafio. Este curso ensina como estruturar grandes projetos React/Next.js, separando lógica de negócio de componentes visuais. Discutiremos padrões como Clean Architecture aplicada ao front, Modularização, uso inteligente de serviços e como escolher a melhor estratégia de gerenciamento de estado para cada cenário.",
        durationWeeks: 5,
        subscribes: 80,
        level: "Iniciante",
        startDate: "2026-03-18",
        cardImage: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80",
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
        title: "Testes com Jest",
        instructor: "Monitor Paulo Henrique",
        description: "Testes unitários e de integração",
        longDescription:
            "Durma tranquilo sabendo que seu código funciona. Este curso ensina a cultura de testes automatizados utilizando Jest e React Testing Library. Aprenderemos a criar testes unitários para funções lógicas, testes de integração para componentes e como fazer 'mocks' de chamadas de API. Você entenderá o que é cobertura de código e como o TDD (Test Driven Development) pode mudar sua forma de programar para melhor.",
        durationWeeks: 4,
        subscribes: 105,
        startDate: "2026-03-22",
        level: "Intermediário",
        cardImage: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=600&q=80",
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
