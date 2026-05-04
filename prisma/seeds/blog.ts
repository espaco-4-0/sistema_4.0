import { estimateReadingTimeInMinutes } from "@/src/lib/reading-time";

import { PrismaClient } from "../../src/generated/prisma/client";

interface PostSeed {
    category: string;
    title: string;
    image: string;
    date: string;
    author: string;
    about: string;
    content: string[];
    tags: string[];
}

function toSlug(value: string): string {
    return value
        .normalize("NFD")
        .replaceAll(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replaceAll(/[^a-z0-9\s-]/g, "")
        .replaceAll(/\s+/g, "-")
        .replaceAll(/-+/g, "-");
}

async function getCategoryIdByName(prisma: PrismaClient, nome: string): Promise<string> {
    const existing = await prisma.postCategoria.findFirst({
        where: { nome },
        select: { id: true },
    });

    if (existing) {
        return existing.id;
    }

    const created = await prisma.postCategoria.create({
        data: { nome },
        select: { id: true },
    });

    return created.id;
}

export async function seedBlog(prisma: PrismaClient): Promise<void> {
    const posts: PostSeed[] = [
        {
            category: "IOT E AUTOMAÇÃO",
            title: "Máquina que reutiliza garrafa PET como filamento para impressão 3D ganha prêmio no CSBC",
            image: "https://rllnjjtrzwizgrndgfep.supabase.co/storage/v1/object/public/public-uploads/199e0e45-fd12-4f63-99bf-8ead18896051-postsoutraasdao.jpeg",
            date: "28 de Janeiro, 2026",
            author: "Ernany",
            about: "Ernany é pesquisador do Espaço 4.0 e escreve sobre inovação aplicada, com foco em sustentabilidade, impressão 3D e impacto social no campus.",
            content: [
                "O projeto desenvolvido no Espaço 4.0 do IFAL Campus Arapiraca conquistou o primeiro lugar na categoria de Inovação Sustentável durante o Congresso da Sociedade Brasileira de Computação (CSBC).",
                "A máquina transforma garrafas PET descartadas em filamento de alta qualidade para impressoras 3D, criando uma cadeia de reaproveitamento com rastreabilidade do material coletado.",
                "Desenvolvida por estudantes de Informática e Mecatrônica, a solução integra IoT e automação, com sensores que monitoram temperatura, velocidade de extrusão e diâmetro do filamento em tempo real.",
            ],
            tags: ["Impressão 3D", "IoT"],
        },
        {
            category: "CSBC",
            title: "O Instituto Federal de Alagoas Campus Arapiraca chegou forte na competição nacional de tecnologia",
            image: "https://rllnjjtrzwizgrndgfep.supabase.co/storage/v1/object/public/public-uploads/199e0e45-fd12-4f63-99bf-8ead18896051-postsoutraasdao.jpeg",
            date: "20 de Janeiro, 2026",
            author: "Renata Imaculada",
            about: "Renata Imaculada é professora do Espaço 4.0, especializada em eventos acadêmicos e premiações de inovação tecnológica.",
            content: [
                "O IFAL Campus Arapiraca conquistou três prêmios importantes durante o Congresso da Sociedade Brasileira de Computação (CSBC), realizado em São Paulo.",
                "Os projetos do Espaço 4.0 se destacaram em Inovação Tecnológica, Sustentabilidade e Impacto Social, competindo com instituições de referência de todo o país.",
            ],
            tags: ["Premiação", "Inovação"],
        },
        {
            category: "Sustentabilidade",
            title: "Alunos do IFAL Campus Arapiraca desenvolvem lixeira inteligente com IoT",
            image: "https://rllnjjtrzwizgrndgfep.supabase.co/storage/v1/object/public/public-uploads/199e0e45-fd12-4f63-99bf-8ead18896051-postsoutraasdao.jpeg",
            date: "18 de Janeiro, 2026",
            author: "Karol",
            about: "Karol é pesquisadora e acompanha iniciativas de sustentabilidade e projetos de impacto ambiental.",
            content: [
                "Um grupo de estudantes do Espaço 4.0 desenvolveu um sistema integrado de gestão de resíduos utilizando tecnologias de IoT.",
                "O projeto inclui lixeiras inteligentes equipadas com sensores que monitoram o nível de preenchimento.",
            ],
            tags: ["Sustentabilidade", "IoT"],
        },
        {
            category: "Robótica",
            title: "Equipe de robótica do Espaço 4.0 conquista primeiro lugar em olimpíada regional",
            image: "https://rllnjjtrzwizgrndgfep.supabase.co/storage/v1/object/public/public-uploads/199e0e45-fd12-4f63-99bf-8ead18896051-postsoutraasdao.jpeg",
            date: "15 de Janeiro, 2026",
            author: "Felipe Costa",
            about: "Felipe Costa é professor de robótica educacional e competições técnicas.",
            content: [
                "A equipe de robótica do Espaço 4.0 superou times de 20 instituições de ensino na última Olimpíada Regional.",
                "O robô desenvolvido demonstrou navegação autônoma e manipulação de objetos com precisão.",
            ],
            tags: ["Robótica", "Competição"],
        },
        {
            category: "Realidade Virtual",
            title: "Projeto de realidade virtual revoluciona o ensino de física no campus",
            image: "https://rllnjjtrzwizgrndgfep.supabase.co/storage/v1/object/public/public-uploads/199e0e45-fd12-4f63-99bf-8ead18896051-postsoutraasdao.jpeg",
            date: "10 de Janeiro, 2026",
            author: "Karina Lopes",
            about: "Karina Lopes é entusiasta de XR e educação imersiva.",
            content: [
                "Uma plataforma de realidade virtual desenvolvida no Espaço 4.0 está transformando o aprendizado de conceitos complexos.",
                "O ambiente virtual permite interagir com fenômenos físicos de forma intuitiva.",
            ],
            tags: ["RV", "Educação"],
        },
        {
            category: "Inteligência Artificial",
            title: "Laboratório de IA desenvolve sistema de controle de qualidade para indústrias",
            image: "https://rllnjjtrzwizgrndgfep.supabase.co/storage/v1/object/public/public-uploads/199e0e45-fd12-4f63-99bf-8ead18896051-postsoutraasdao.jpeg",
            date: "8 de Janeiro, 2026",
            author: "Gustavo Henrique",
            about: "Gustavo Henrique é monitor voluntário e entusiasta de IA.",
            content: [
                "O laboratório de IA do Espaço 4.0 criou um sistema de visão computacional que identifica defeitos em tempo real.",
                "A solução já está sendo testada em fábricas da região de Arapiraca.",
            ],
            tags: ["IA", "Indústria"],
        },
        {
            category: "Inovação",
            title: "Workshop de tecnologias emergentes capacita mais de 100 estudantes",
            image: "https://rllnjjtrzwizgrndgfep.supabase.co/storage/v1/object/public/public-uploads/199e0e45-fd12-4f63-99bf-8ead18896051-postsoutraasdao.jpeg",
            date: "5 de Janeiro, 2026",
            author: "Renata Imaculada",
            about: "Renata Imaculada acompanha iniciativas de formação tecnológica.",
            content: [
                "O Espaço 4.0 realizou uma série de workshops sobre blockchain, computação quântica e edge computing.",
                "O evento contou com mentoria de especialistas do mercado.",
            ],
            tags: ["Inovação", "Workshop"],
        },
        {
            category: "Impressão 3D",
            title: "Pesquisa testa filamentos biodegradáveis feitos a partir de resíduos de coco",
            image: "https://rllnjjtrzwizgrndgfep.supabase.co/storage/v1/object/public/public-uploads/199e0e45-fd12-4f63-99bf-8ead18896051-postsoutraasdao.jpeg",
            date: "3 de Janeiro, 2026",
            author: "Albhert Barbosa",
            about: "Albhert Barbosa pesquisa materiais avançados e sustentáveis.",
            content: [
                "Pesquisadores do campus estão experimentando novos materiais para tornar a impressão 3D mais ecológica.",
                "O uso de resíduos agrícolas locais é um dos destaques da pesquisa.",
            ],
            tags: ["Impressão 3D", "Materiais"],
        },
        {
            category: "Automação",
            title: "Sistema de automação de estoque reduz desperdícios em 60%",
            image: "https://rllnjjtrzwizgrndgfep.supabase.co/storage/v1/object/public/public-uploads/199e0e45-fd12-4f63-99bf-8ead18896051-postsoutraasdao.jpeg",
            date: "1 de Janeiro, 2026",
            author: "Karol",
            about: "Karol acompanha projetos de eficiência operacional.",
            content: [
                "O novo sistema de monitoramento via RFID automatiza a reposição de materiais no laboratório.",
                "A tecnologia já despertou o interesse de empresas de logística locais.",
            ],
            tags: ["Automação", "Logística"],
        },
        {
            category: "Tecnologia Educacional",
            title: "Plataforma interativa de programação aumenta aprovação em 45%",
            image: "https://rllnjjtrzwizgrndgfep.supabase.co/storage/v1/object/public/public-uploads/199e0e45-fd12-4f63-99bf-8ead18896051-postsoutraasdao.jpeg",
            date: "29 de Dezembro, 2025",
            author: "Felipe Costa",
            about: "Felipe Costa escreve sobre metodologias ativas de ensino.",
            content: [
                "Uma plataforma gamificada desenvolvida no IFAL Arapiraca está ajudando alunos iniciantes em programação.",
                "O sistema adapta os desafios ao ritmo de cada estudante usando IA.",
            ],
            tags: ["Educação", "Programação"],
        },
        {
            category: "Inovação",
            title: "Espaço 4.0 recebe nova cortadora a laser de alta precisão",
            image: "https://rllnjjtrzwizgrndgfep.supabase.co/storage/v1/object/public/public-uploads/199e0e45-fd12-4f63-99bf-8ead18896051-postsoutraasdao.jpeg",
            date: "25 de Dezembro, 2025",
            author: "Ernany",
            about: "Ernany é pesquisador do Espaço 4.0 e focado em fabricação digital.",
            content: [
                "O laboratório acaba de ser equipado com uma nova cortadora a laser que permitirá prototipagens mais rápidas.",
                "Alunos de diversos cursos poderão agendar o uso do equipamento para seus projetos.",
            ],
            tags: ["Fabricação Digital", "Equipamentos"],
        },
        {
            category: "Competição",
            title: "Hackathon Arapiraca 2026: Soluções para o agronegócio local",
            image: "https://rllnjjtrzwizgrndgfep.supabase.co/storage/v1/object/public/public-uploads/199e0e45-fd12-4f63-99bf-8ead18896051-postsoutraasdao.jpeg",
            date: "20 de Dezembro, 2025",
            author: "Carlos Pesqueira",
            about: "Carlos Pesqueira acompanha maratonas de programação e inovação.",
            content: [
                "Durante 48 horas, estudantes desenvolveram apps para ajudar produtores de fumo e mandioca da região.",
                "O projeto vencedor propõe um marketplace direto entre produtor e consumidor final.",
            ],
            tags: ["Hackathon", "Agrotech"],
        },
        {
            category: "Educação",
            title: "Inscrições abertas para curso de Python para Ciência de Dados",
            image: "https://rllnjjtrzwizgrndgfep.supabase.co/storage/v1/object/public/public-uploads/199e0e45-fd12-4f63-99bf-8ead18896051-postsoutraasdao.jpeg",
            date: "15 de Dezembro, 2025",
            author: "Maria Monitor",
            about: "Maria Monitor ajuda na organização de cursos de extensão no campus.",
            content: [
                "O curso é voltado para a comunidade e não exige conhecimentos prévios avançados.",
                "As aulas ocorrerão aos sábados no laboratório de informática do IFAL.",
            ],
            tags: ["Python", "Dados"],
        },
        {
            category: "Intercâmbio",
            title: "Estudantes visitam Porto Digital em Recife em viagem técnica",
            image: "https://rllnjjtrzwizgrndgfep.supabase.co/storage/v1/object/public/public-uploads/199e0e45-fd12-4f63-99bf-8ead18896051-postsoutraasdao.jpeg",
            date: "10 de Dezembro, 2025",
            author: "Renata Imaculada",
            about: "Renata Imaculada organiza visitas técnicas para expandir o horizonte dos alunos.",
            content: [
                "A comitiva visitou empresas de grande porte e conheceu o ecossistema de inovação de Pernambuco.",
                "A experiência servirá como base para novos projetos no Espaço 4.0.",
            ],
            tags: ["Viagem Técnica", "Inovação"],
        },
        {
            category: "Mercado de Trabalho",
            title: "IFAL Arapiraca firma parceria com empresas de TI para estágios",
            image: "https://rllnjjtrzwizgrndgfep.supabase.co/storage/v1/object/public/public-uploads/199e0e45-fd12-4f63-99bf-8ead18896051-postsoutraasdao.jpeg",
            date: "5 de Dezembro, 2025",
            author: "Roberto Técnico",
            about: "Roberto Técnico atua na ponte entre o ensino técnico e o mercado.",
            content: [
                "A nova parceria garante vagas exclusivas para estudantes do IFAL em empresas de desenvolvimento de software.",
                "O foco é na inserção imediata de talentos locais no mercado de tecnologia.",
            ],
            tags: ["Estágio", "Carreira"],
        },
        {
            category: "Acessibilidade",
            title: "App desenvolvido no campus auxilia deficientes visuais na navegação",
            image: "https://rllnjjtrzwizgrndgfep.supabase.co/storage/v1/object/public/public-uploads/199e0e45-fd12-4f63-99bf-8ead18896051-postsoutraasdao.jpeg",
            date: "1 de Dezembro, 2025",
            author: "Fernanda Lima",
            about: "Fernanda Lima pesquisa tecnologias assistivas e inclusão.",
            content: [
                "O aplicativo utiliza sensores ultrassônicos e feedback sonoro para alertar sobre obstáculos.",
                "O protótipo foi testado por alunos com deficiência visual do próprio campus.",
            ],
            tags: ["Acessibilidade", "Mobile"],
        },
        {
            category: "Energia",
            title: "Monitoramento de energia solar via IoT é implementado no bloco A",
            image: "https://rllnjjtrzwizgrndgfep.supabase.co/storage/v1/object/public/public-uploads/199e0e45-fd12-4f63-99bf-8ead18896051-postsoutraasdao.jpeg",
            date: "25 de Novembro, 2025",
            author: "Gustavo Henrique",
            about: "Gustavo Henrique acompanha projetos de eficiência energética.",
            content: [
                "Um dashboard em tempo real agora mostra a geração e consumo de energia das placas solares do campus.",
                "Os dados serão usados em pesquisas acadêmicas sobre eficiência energética no Nordeste.",
            ],
            tags: ["Sustentabilidade", "IoT"],
        },
        {
            category: "Open Source",
            title: "Estudantes contribuem para grandes projetos de código aberto",
            image: "https://rllnjjtrzwizgrndgfep.supabase.co/storage/v1/object/public/public-uploads/199e0e45-fd12-4f63-99bf-8ead18896051-postsoutraasdao.jpeg",
            date: "20 de Novembro, 2025",
            author: "Lucas Almeida",
            about: "Lucas Almeida é um entusiasta de software livre e colaborador open source.",
            content: [
                "Participando do Hacktoberfest, alunos do IFAL enviaram melhorias para bibliotecas famosas de JavaScript e Python.",
                "A iniciativa promove o aprendizado colaborativo e a visibilidade internacional.",
            ],
            tags: ["Open Source", "Comunidade"],
        },
        {
            category: "Carreira",
            title: "Treinamento de Soft Skills prepara alunos para entrevistas técnicas",
            image: "https://rllnjjtrzwizgrndgfep.supabase.co/storage/v1/object/public/public-uploads/199e0e45-fd12-4f63-99bf-8ead18896051-postsoutraasdao.jpeg",
            date: "15 de Novembro, 2025",
            author: "Beatriz Costa",
            about: "Beatriz Costa foca no desenvolvimento integral dos estudantes de tecnologia.",
            content: [
                "Comunicação, trabalho em equipe e resolução de problemas foram os temas centrais do workshop.",
                "Simulações de entrevistas reais ajudaram a diminuir a ansiedade dos formandos.",
            ],
            tags: ["Soft Skills", "Carreira"],
        },
        {
            category: "Evento",
            title: "ExpoTech 2026: Conheça os projetos que serão apresentados no Espaço 4.0",
            image: "https://rllnjjtrzwizgrndgfep.supabase.co/storage/v1/object/public/public-uploads/199e0e45-fd12-4f63-99bf-8ead18896051-postsoutraasdao.jpeg",
            date: "10 de Novembro, 2025",
            author: "Rafael Externo",
            about: "Rafael Externo é visitante frequente e entusiasta dos eventos do campus.",
            content: [
                "A exposição anual reunirá mais de 50 protótipos desenvolvidos ao longo do ano.",
                "O evento é aberto ao público e contará com oficinas gratuitas de robótica.",
            ],
            tags: ["Evento", "Tecnologia"],
        },
    ];

    await prisma.comentario.deleteMany();
    await prisma.curtida.deleteMany();
    await prisma.post.deleteMany();
    await prisma.postCategoria.deleteMany();

    const users = await prisma.user.findMany({
        select: { id: true, nomeCompleto: true },
    });

    if (users.length === 0) {
        throw new Error("Nenhum usuário encontrado para vincular aos posts do blog.");
    }

    const fallbackAuthor = users[0];

    const commentsPool = [
        "Incrível ver o impacto desses projetos!",
        "Parabéns aos envolvidos, excelente iniciativa.",
        "Como posso participar do próximo workshop?",
        "O Espaço 4.0 está transformando o campus.",
        "Tecnologia e sustentabilidade andando juntas, sensacional.",
        "Muito orgulho desses estudantes.",
        "Isso sim é educação de qualidade.",
        "Interessante o uso de IoT nesse contexto.",
        "A impressão 3D tem um potencial enorme.",
        "Arapiraca se destacando na tecnologia nacional.",
        "Qual o pré-requisito para o curso de Python?",
        "Excelente artigo, muito bem explicado.",
        "Sempre bom ver o IFAL inovando.",
        "Quero levar meu filho para conhecer o laboratório.",
        "Projetos assim inspiram as futuras gerações.",
    ];

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const conteudoCompleto = post.content.join("\n\n");
        const slug = toSlug(post.title);
        const categoriasNomes = Array.from(
            new Set([post.category, ...post.tags].map((value) => value.trim()).filter(Boolean))
        );

        const categoriasIds = await Promise.all(categoriasNomes.map((nome) => getCategoryIdByName(prisma, nome)));

        const author = users.find((u) => u.nomeCompleto.includes(post.author)) || fallbackAuthor;

        const savedPost = await prisma.post.create({
            data: {
                titulo: post.title,
                slug,
                resumo: post.about,
                conteudo: conteudoCompleto,
                tempoDeLeitura: estimateReadingTimeInMinutes(conteudoCompleto),
                publicado: true,
                autor: {
                    connect: { id: author.id },
                },
                categoria: {
                    connect: { id: categoriasIds[0] },
                },
                foto: {
                    create: {
                        url: post.image,
                        destaque: true,
                    },
                },
            },
            select: { id: true },
        });

        const numLikes = Math.floor(Math.random() * 15) + 5;
        const shuffledUsersForLikes = [...users].sort(() => 0.5 - Math.random());
        const likers = shuffledUsersForLikes.slice(0, Math.min(numLikes, users.length));

        for (const liker of likers) {
            await prisma.curtida.create({
                data: {
                    userId: liker.id,
                    postId: savedPost.id,
                },
            });
        }

        // Adicionar Comentários - Alguns com 12 como pedido
        let numComments = Math.floor(Math.random() * 8); // Padrão entre 0 e 7
        if (i % 6 === 0) numComments = 12; // A cada 6 posts, um terá 12 comentários

        const shuffledCommenters = [...users].sort(() => 0.5 - Math.random());

        for (let j = 0; j < numComments; j++) {
            const commenter = shuffledCommenters[j % users.length];
            const content = commentsPool[j % commentsPool.length];

            await prisma.comentario.create({
                data: {
                    conteudo: content,
                    autorId: commenter.id,
                    postId: savedPost.id,
                },
            });
        }
    }

    console.log("20 posts, fotos, curtidas e comentários do blog criados com sucesso!");
}
