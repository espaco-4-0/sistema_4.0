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

function estimateReadingTimeInMinutes(text: string): number {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
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
            image: "/noticia-principal.png",
            date: "28 de Janeiro, 2026",
            author: "Ernany",
            about: "Ernany é pesquisador do Espaço 4.0 e escreve sobre inovação aplicada, com foco em sustentabilidade, impressão 3D e impacto social no campus.",
            content: [
                "O projeto desenvolvido no Espaço 4.0 do IFAL Campus Arapiraca conquistou o primeiro lugar na categoria de Inovação Sustentável durante o Congresso da Sociedade Brasileira de Computação (CSBC).",
                "A máquina transforma garrafas PET descartadas em filamento de alta qualidade para impressoras 3D, criando uma cadeia de reaproveitamento com rastreabilidade do material coletado.",
                "Desenvolvida por estudantes de Informática e Mecatrônica, a solução integra IoT e automação, com sensores que monitoram temperatura, velocidade de extrusão e diâmetro do filamento em tempo real.",
                "Nos testes de bancada, o equipamento alcançou estabilidade térmica e redução de custos de produção, abrindo espaço para uso em laboratórios didáticos e pequenos makerspaces.",
                "Segundo o coordenador do projeto, Prof. João Silva, a iniciativa mostra como a tecnologia pode resolver problemas ambientais e, ao mesmo tempo, gerar aprendizado aplicado para os alunos.",
                "Com o prêmio, a equipe pretende ampliar a capacidade de produção, firmar parcerias com cooperativas locais e publicar um manual aberto para replicação do protótipo.",
            ],
            tags: ["Impressão 3D", "IoT"],
        },

        {
            category: "CSBC",
            title: "O Instituto Federal de Alagoas Campus Arapiraca chegou forte na competição nacional de tecnologia",
            image: "/noticia-quartenaria.jpg",
            date: "20 de Janeiro, 2026",
            author: "Renata Imaculada",
            about: "Renata Imaculada é professora do Espaço 4.0, especializada em eventos acadêmicos e premiações de inovação tecnológica.",
            content: [
                "O IFAL Campus Arapiraca conquistou três prêmios importantes durante o Congresso da Sociedade Brasileira de Computação (CSBC), realizado em São Paulo.",
                "Os projetos do Espaço 4.0 se destacaram em Inovação Tecnológica, Sustentabilidade e Impacto Social, competindo com instituições de referência de todo o país.",
                "A delegação contou com mais de 15 estudantes, que apresentaram soluções nas áreas de IoT, robótica, inteligência artificial e desenvolvimento sustentável.",
                "Entre os projetos premiados estão um sistema de monitoramento inteligente para agricultura, uma plataforma de ensino adaptativo com IA e o equipamento de reciclagem de PET.",
                "A banca avaliadora elogiou o rigor técnico e o impacto social das soluções, destacando o potencial de aplicação direta no cotidiano das comunidades locais.",
                "A participação expressiva reforça a qualidade do ensino e a dedicação de alunos e professores em desenvolver tecnologias com propósito.",
            ],
            tags: ["Impressão 3D", "IoT"],
        },
        {
            category: "Sustentabilidade",
            title: "Alunos do IFAL Campus Arapiraca envolvidos na área de sustentabilidade desenvolvem projeto inovador",
            image: "/noticia-quinta.jpg",
            date: "18 de Janeiro, 2026",
            author: "Karol ",
            about: "Karol é pesquisadora e acompanha iniciativas de sustentabilidade e projetos de impacto ambiental, com ênfase em IoT e políticas de resíduos.",
            content: [
                "Um grupo de estudantes do Espaço 4.0 desenvolveu um sistema integrado de gestão de resíduos utilizando tecnologias de IoT e análise de dados.",
                "O projeto inclui lixeiras inteligentes equipadas com sensores que identificam o tipo de resíduo, monitoram o nível de preenchimento e indicam o melhor momento para coleta.",
                "Os dados são consolidados em uma plataforma web com dashboards e relatórios sobre padrões de descarte, ajudando a priorizar campanhas de redução de resíduos.",
                "Com a iniciativa, o campus registrou redução de 30% no envio de resíduos a aterros e aumento consistente nas taxas de reciclagem.",
                "Também foram criadas ações educativas com sinalização por cores e oficinas para orientar o descarte correto nas áreas de maior fluxo.",
                "A expansão para a comunidade local já conta com apoio da prefeitura e empresas parceiras interessadas em adotar a solução em escala municipal.",
            ],
            tags: ["Impressão 3D", "IoT"],
        },
        {
            category: "Robótica",
            title: "Projetos de robótica ganham destaque no Espaço 4.0 e conquistam prêmios regionais",
            image: "/robotica-meme.jpeg",
            date: "15 de Janeiro, 2026",
            author: "Felipe Costa",
            about: "Felipe Costa professor de robótica educacional e competições técnicas, destacando aplicações práticas desenvolvidas por estudantes.",
            content: [
                "A equipe de robótica do Espaço 4.0 conquistou o primeiro lugar na Olimpíada Regional de Robótica, superando times de 20 instituições de ensino.",
                "O robô desenvolvido pelos alunos demonstrou navegação autônoma, manipulação de objetos e colaboração com outros robôs em desafios de precisão e tempo.",
                "A solução usa visão computacional, aprendizado de máquina e sistemas embarcados, com integração de sensores para evitar obstáculos e mapear o ambiente.",
                "Além da competição, a equipe aplica a tecnologia em protótipos úteis, como um sistema automatizado para bibliotecas e assistentes robóticos para pessoas com mobilidade reduzida.",
                "Os estudantes também recebem mentoria de professores e ex-alunos do campus, fortalecendo o ciclo de inovação e formação técnica.",
                "O desempenho no torneio abriu portas para parcerias com empresas de tecnologia e oportunidades de estágio para os integrantes do projeto.",
            ],
            tags: ["Impressão 3D", "IoT"],
        },

        {
            category: "Realidade Virtual",
            title: "Projeto de realidade virtual revoluciona aprendizado no campus",
            image: "/pibic.jpeg",
            date: "10 de Janeiro, 2026",
            author: "Karina Lopes",
            about: "Karina Lopes é entusiasta de XR e educação, acompanhando projetos de realidade virtual aplicados ao ensino.",
            content: [
                "Uma plataforma de realidade virtual desenvolvida no Espaço 4.0 está transformando a forma como os alunos aprendem conceitos complexos de física, química e matemática.",
                "O ambiente virtual permite interagir com moléculas, explorar estruturas atômicas e visualizar fenômenos físicos de forma imersiva e intuitiva.",
                "Professores relatam maior engajamento e melhor compreensão de conteúdos abstratos, com turmas mais participativas durante as aulas.",
                "O projeto está sendo ampliado para simulações de laboratórios, permitindo experimentos virtuais com total segurança e baixo custo.",
                "A plataforma também está recebendo melhorias de acessibilidade e suporte a diferentes dispositivos, incluindo visores mais simples e PCs do laboratório.",
                "Instituições de outros estados já demonstraram interesse em adotar a solução, que poderá ser disponibilizada gratuitamente para escolas públicas.",
            ],
            tags: ["Impressão 3D", "IoT"],
        },
        {
            category: "Inteligência Artificial",
            title: "Laboratório de IA do Espaço 4.0 desenvolve soluções para indústria local",
            image: "/inauguracao.jpeg",
            date: "8 de Janeiro, 2026",
            author: "Gustavo Henrique",
            about: "Gustavo Henrique monitor voluntario do espaco 4.0 , analisa o impacto de soluções de IA na produtividade local, alem de novas idealizacoes ",
            content: [
                "O laboratório de inteligência artificial do Espaço 4.0 firmou parceria com indústrias locais para desenvolver soluções customizadas de otimização de processos.",
                "Com técnicas de machine learning e visão computacional, a equipe criou sistemas de controle de qualidade automatizado que identificam defeitos com 98% de precisão.",
                "As soluções já estão em operação em três fábricas da região, reduzindo desperdícios, retrabalho e tempo de inspeção.",
                "Além do impacto econômico, o projeto oferece experiência prática aos estudantes, que lidam com dados reais e desafios de produção.",
                "O time também desenvolveu protocolos de governança de dados e critérios éticos para uso de IA em ambientes industriais.",
                "A iniciativa reforça a parceria entre academia e setor produtivo, impulsionando inovação e desenvolvimento regional.",
            ],
            tags: ["Impressão 3D", "IoT"],
        },
        {
            category: "Inovação",
            title: "Workshop no Espaço 4.0 capacita estudantes em tecnologias emergentes",
            image: "/importante.jpeg",
            date: "5 de Janeiro, 2026",
            author: "Renata Imaculada",
            about: "Renata Imaculada acompanha iniciativas de inovação e formação tecnológica, incluindo workshops e programas de capacitação.",
            content: [
                "O Espaço 4.0 realizou uma série de workshops intensivos sobre tecnologias emergentes, capacitando mais de 100 estudantes em áreas como blockchain, computação quântica e edge computing.",
                "Os eventos contaram com especialistas do mercado e pesquisadores de universidades renomadas, ampliando networking, mentoria e troca de experiências.",
                "Durante as oficinas, os participantes desenvolveram projetos práticos e protótipos, aplicando os conhecimentos em desafios reais propostos por empresas parceiras.",
                "A iniciativa integra um programa contínuo de capacitação que prepara os estudantes para o mercado, com trilhas de aprendizado e certificações internas.",
                "Questionários de satisfação apontaram alta adesão e pedidos por novos temas, o que reforçou o calendário semestral de atividades.",
                "Novos workshops já estão programados, abordando Web3, realidade aumentada, computação em nuvem e segurança digital.",
            ],
            tags: ["Impressão 3D", "IoT"],
        },
        {
            category: "Impressão 3D",
            title: "Novos materiais para impressão 3D são testados em laboratório do campus",
            image: "https://images.unsplash.com/photo-1703221561813-cdaa308cf9e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwzRCUyMHByaW50aW5nJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NzAwNTI1MDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
            date: "3 de Janeiro, 2026",
            author: "Albhert Barbosa",
            about: "Albhert Barbosa pesquisa materiais avançados e divulgação científica, com foco em impressão 3D sustentável.",
            content: [
                "Pesquisadores do Espaço 4.0 estão experimentando novos materiais biodegradáveis para impressão 3D, buscando alternativas mais sustentáveis ao plástico convencional.",
                "Os testes incluem filamentos feitos a partir de resíduos agrícolas, fibras naturais e polímeros biocompatíveis, com bons resultados de resistência e durabilidade.",
                "Um dos materiais combina fibras de coco com biopolímeros, gerando um composto leve, resistente e totalmente biodegradável.",
                "Os protótipos já foram aplicados em peças de laboratório e componentes de baixo impacto, avaliando desempenho e estabilidade térmica.",
                "As pesquisas atraíram atenção internacional, com publicações em revistas científicas e convites para conferências especializadas.",
                "O objetivo é tornar a impressão 3D mais acessível e ambientalmente responsável, contribuindo para práticas de fabricação sustentável.",
            ],
            tags: ["Impressão 3D", "IoT"],
        },
        {
            category: "Automação",
            title: "Sistema automatizado de controle de estoque é implementado com sucesso",
            image: "https://images.unsplash.com/photo-1712599609774-172848255a9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJb1QlMjBhdXRvbWF0aW9uJTIwZGV2aWNlc3xlbnwxfHx8fDE3NzAxNDU5MjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
            date: "1 de Janeiro, 2026",
            author: "Karol ",
            about: "Karol acompanha projetos de automação e eficiência operacional, destacando aplicações reais em logística e estoque.",
            content: [
                "O Espaço 4.0 desenvolveu e implementou um sistema completo de automação de estoque que está sendo utilizado no próprio campus e em empresas parceiras.",
                "Com RFID, visão computacional e algoritmos de previsão de demanda, o sistema monitora níveis em tempo real e automatiza pedidos de reposição.",
                "A solução reduziu em 60% o tempo de gestão do inventário e praticamente eliminou situações de falta ou excesso de materiais.",
                "Relatórios detalhados e alertas inteligentes ajudam na tomada de decisões estratégicas, com indicadores de giro e custos por categoria.",
                "A integração com sistemas internos facilitou auditorias e reduziu erros de lançamento, aumentando a confiabilidade dos dados.",
                "Pequenas e médias empresas da região já estão adotando a tecnologia, com planos de expansão para outros setores nos próximos meses.",
            ],
            tags: ["Impressão 3D", "IoT"],
        },
        {
            category: "Tecnologia Educacional",
            title: "Plataforma digital desenvolvida no Espaço 4.0 melhora ensino de programação",
            image: "https://images.unsplash.com/photo-1758270704534-fd9715bffc0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwY2FtcHVzJTIwc3R1ZGVudHN8ZW58MXx8fHwxNzcwMTQ1OTIzfDA&ixlib=rb-4.1.0&q=80&w=1080",
            date: "29 de Dezembro, 2025",
            author: "Felipe Costa",
            about: "Felipe Costa escreve sobre tecnologia educacional, com foco em metodologias ativas e aprendizado apoiado por IA.",
            content: [
                "Uma plataforma interativa de ensino de programação desenvolvida no Espaço 4.0 está transformando a forma como os alunos aprendem a programar.",
                "O sistema utiliza gamificação, desafios progressivos e feedback em tempo real para tornar o aprendizado mais engajante e efetivo.",
                "Uma camada de IA analisa o desempenho individual e adapta o conteúdo ao ritmo de cada estudante, indicando trilhas de reforço quando necessário.",
                "Desde sua implementação, a taxa de aprovação em disciplinas de programação aumentou em 45%, com alunos demonstrando maior confiança e habilidade.",
                "Professores também contam com relatórios de progresso e sugestões de intervenção para turmas com maior dificuldade.",
                "A plataforma está sendo disponibilizada gratuitamente para escolas públicas, contribuindo para a democratização do ensino de tecnologia no país.",
            ],
            tags: ["Impressão 3D", "IoT"],
        },
    ];

    const defaultAuthor = await prisma.user.findUnique({
        where: { email: "professor@ifal.edu.br" },
        select: { id: true },
    });

    const fallbackAuthor =
        defaultAuthor ??
        (await prisma.user.findFirst({
            select: { id: true },
            orderBy: { createdAt: "asc" },
        }));

    if (!fallbackAuthor) {
        throw new Error("Nenhum usuário encontrado para vincular aos posts do blog.");
    }

    for (const post of posts) {
        const conteudoCompleto = post.content.join("\n\n");
        const slug = toSlug(post.title);
        const categoriasNomes = Array.from(
            new Set([post.category, ...post.tags].map((value) => value.trim()).filter(Boolean))
        );

        const categoriasIds = await Promise.all(categoriasNomes.map((nome) => getCategoryIdByName(prisma, nome)));

        await prisma.post.upsert({
            where: { slug },
            update: {
                titulo: post.title,
                resumo: post.about,
                conteudo: conteudoCompleto,
                tempoDeLeitura: estimateReadingTimeInMinutes(conteudoCompleto),
                publicado: true,
                capaBannerUrl: post.image,
                autorId: fallbackAuthor.id,
                categorias: {
                    set: [],
                    connect: categoriasIds.map((id) => ({ id })),
                },
            },
            create: {
                titulo: post.title,
                slug,
                resumo: post.about,
                conteudo: conteudoCompleto,
                tempoDeLeitura: estimateReadingTimeInMinutes(conteudoCompleto),
                publicado: true,
                capaBannerUrl: post.image,
                autorId: fallbackAuthor.id,
                categorias: {
                    connect: categoriasIds.map((id) => ({ id })),
                },
            },
        });
    }

    console.log("Posts e suas categorias criados");
}
