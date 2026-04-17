# Estrutura do Projeto e Arquitetura

Este projeto utiliza uma adaptação da Arquitetura Hexagonal (Ports & Adapters) com foco no princípio KISS (Keep It Simple, Stupid). O objetivo é desacoplar as regras de negócio (Domain) da interface visual (UI) e dos dados (Infra), facilitando testes, manutenção e escalabilidade.

## Estrutura de Diretórios

Todo o código fonte reside na pasta `src/`. Abaixo está a descrição da responsabilidade de cada diretório.

```
src/
├── domain/                      # O CÉREBRO (Regras de Negócio puras)
│   ├── entities/                # Definição de Tipos e Interfaces (ex: User, Course)
│   ├── gateways/                # Contratos/Interfaces do que o app precisa buscar fora
│   └── use-cases/               # A Lógica do que o app faz (ex: get-all-courses.ts)
│
├── infra/                       # O MUNDO EXTERNO (Dados e Integrações)
│   ├── http/                    # Configurações de Rede (Axios/Fetch wrappers)
│   └── modules/                 # Implementações dos Gateways (dividido por funcionalidade)
│       ├── auth/
│       └── courses/
│           ├── course-mock.ts   # Dados Mockados (Desenvolvimento)
│           └── course-api.ts    # Chamadas Reais à API (Produção)
│
├── ui/                          # O VISUAL (Camada React)
│   ├── components/              # Componentes Genéricos
│   │   ├── ui/                  # Shadcn UI (Button, Card, Input...)
│   │   └── form/                # Componentes base de formulário
│   ├── lib/                     # Ajudantes Visuais (Utils)
│   │   ├── utils.ts             # Helper de classes CSS (cn)
│   │   └── date.ts              # Formatadores de data
│   ├── hooks/                   # Hooks Globais (ex: useDebounce)
│   ├── providers/               # Contextos Globais (Theme, AuthContext)
│   └── modules/                 # Componentes de Funcionalidade (Features)
│       ├── auth/                # ex: LoginForm
│       └── courses/             # ex: CourseList, CourseItem
│
└── app/                         # O ROTEADOR (Next.js App Router)
    ├── (auth)/                  # Rotas públicas/auth
    ├── courses/                 # Rota /courses
    └── layout.tsx               # Entrypoint (Providers são injetados aqui)
```

---

## Guia de Migração (De -> Para)

Utilize esta tabela como referência para mover arquivos da estrutura antiga para a nova arquitetura proposta.

| Localização Antiga           | Nova Localização (src/...) | Motivo / Responsabilidade                                                                 |
| :--------------------------- | :------------------------- | :---------------------------------------------------------------------------------------- |
| components/ui/\* (Shadcn)    | ui/components/ui/\*        | Componentes visuais genéricos devem ser isolados da lógica de negócio.                    |
| ui/components/proprietary/\* | ui/modules/\*              | Componentes que conhecem o negócio (ex: Login, Lista) são módulos de UI.                  |
| mock/\* (ou dados soltos)    | infra/modules/\*/mock.ts   | Dados falsos simulam o backend, portanto pertencem à camada de Infraestrutura.            |
| types ou interfaces soltas   | domain/entities/\*         | Definições de dados são globais, inalteráveis e pertencem ao Domínio.                     |
| lib/utils.ts                 | ui/lib/utils.ts            | Utilitários de classe CSS (cn) são auxiliares exclusivamente visuais.                     |
| hooks/\*                     | ui/hooks/\*                | Hooks representam lógica de estado do React (UI), não regras de domínio.                  |
| providers/\*                 | ui/providers/\*            | Configurações globais do contexto do React.                                               |
| app/slow-page                | app/slow-page              | O diretório app gerencia apenas as rotas. A lógica deve ser extraída para use-cases e ui. |

---

## Glossário das Camadas

### 1. Domain (Domínio)

- **O que é:** O núcleo do software. Não possui dependências do React ou de bibliotecas de requisição.
- **Regra:** Deve conter apenas TypeScript puro.
- **Contém:** Entidades (Modelos de dados), Interfaces de Repositório (Gateways) e Casos de Uso (Regras de negócio).

### 2. Infra (Infraestrutura)

- **O que é:** A camada responsável por buscar e persistir dados.
- **Regra:** É o único local permitido para realizar chamadas fetch, axios ou importar arquivos JSON estáticos.
- **Contém:** Configuração de clientes HTTP, Mocks de dados e Implementações reais de API.

### 3. UI (User Interface)

- **O que é:** A camada de apresentação com a qual o usuário interage.
- **Regra:** Responsável apenas por exibir dados e capturar eventos. Solicita dados para os Casos de Uso ou Infraestrutura, mas não contém regras de negócio complexas.
- **Contém:** Design System (Shadcn), Componentes de Funcionalidade, Hooks, Providers e Utils de formatação.

### 4. App (Application Layer)

- **O que é:** O roteador do Next.js (App Router).
- **Regra:** Serve apenas para definir rotas e realizar a Injeção de Dependência (conectar a Infraestrutura à UI).
- **Contém:** Arquivos page.tsx, layout.tsx, loading.tsx e error.tsx.

##

## como rodar no docker

- **build da imagem:** cole esse comando para fazer o build

```bash
docker build -t sistema4-front .
```

- **rodar o container:** cole esse comando para rodar o container

```bash
docker run -p 3000:3000 sistema4-front
```

- **hot reload:** se quiser rodar com alteração de codigo em tempo real, sem reiniciar o container

```bash
docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules sistema4-front
```

## Rate limit no proxy e Redis

O projeto agora possui rate limit aplicado no proxy/middleware com suporte a Redis via REST.

Variaveis de ambiente:

- `RATE_LIMIT_ENABLED`: habilita/desabilita o rate limit no proxy.
- `RATE_LIMIT_REQUESTS`: quantidade maxima de requisicoes por janela.
- `RATE_LIMIT_WINDOW_SECONDS`: tamanho da janela em segundos.
- `UPSTASH_REDIS_REST_URL`: URL do Redis REST (necessario no proxy/middleware Edge).
- `UPSTASH_REDIS_REST_TOKEN`: token do Redis REST.
- `REDIS_URL`: URL do Redis local (docker-compose) para usos server-side.

Com docker-compose principal, o servico `redis` ja sobe junto da aplicacao.
