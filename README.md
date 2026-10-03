# SR Petisco — Backend

API REST multiempresa para cadastro de insumos, produtos, transformações e fichas técnicas, com cálculo de custo, lucro, CMV e margem.

Produção: [https://sr-petisco-api.onrender.com](https://sr-petisco-api.onrender.com)

## Tecnologias

- Node.js 22+
- Express 5
- MongoDB e Mongoose
- JWT e bcrypt
- Helmet, CORS e rate limiting
- ESLint, Prettier e Node Test Runner

## Requisitos

- Node.js `>=22.13.0`
- npm
- MongoDB Atlas ou uma instalação MongoDB com suporte a replica set

O suporte a replica set é necessário para as transações usadas nos fluxos que gravam produto e ficha técnica conjuntamente.

## Instalação

```bash
npm install
```

Copie `.env.example` para `.env` e ajuste os valores:

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/sr-petisco
JWT_SECRET=uma-chave-aleatoria-com-no-minimo-32-caracteres
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
JSON_LIMIT=100kb
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=500
AUTH_RATE_LIMIT_MAX=20
```

Nunca envie o arquivo `.env` ao repositório.

## Execução

Desenvolvimento com reinicialização automática:

```bash
npm run dev
```

Produção:

```bash
npm start
```

A API local estará disponível em `http://localhost:3000`.

## Scripts

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Inicia com Nodemon |
| `npm start` | Inicia em modo normal |
| `npm test` | Executa os testes automatizados |
| `npm run test:coverage` | Executa testes e mostra a cobertura |
| `npm run lint` | Verifica a qualidade do código |
| `npm run lint:fix` | Corrige problemas compatíveis com correção automática |
| `npm run format` | Formata código e testes |
| `npm run format:check` | Verifica a formatação |
| `npm run check` | Executa lint, formatação e testes |
| `npm run import:insumos` | Importa a planilha `insumos.xlsx` |

## Estrutura

```text
src/
├── config/            # Ambiente e conexão com o MongoDB
├── domain/            # Regras compartilhadas de custo e unidades
├── modules/           # Auth, usuários, insumos, produtos e fichas
│   └── <módulo>/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── validators/
├── scripts/           # Importação de dados
└── shared/            # Erros, middlewares, respostas e utilitários

tests/                 # Testes unitários
```

## Autenticação e autorização

Com exceção de cadastro, login e rota raiz, os endpoints exigem JWT:

```http
Authorization: Bearer SEU_TOKEN
```

O cadastro público (`/auth/register`) cria **somente uma empresa nova e seu responsável `admin`**. Para uma empresa já cadastrada, o responsável ou gerente cria funcionários em `/usuarios`. O cargo deve ser informado no corpo do cadastro.

| Cargo | Acesso nesta etapa |
| --- | --- |
| `admin` | Gerencia usuários, CMV e catálogo. É o responsável da empresa; não pode ser desativado por essas rotas. |
| `gerente` | Gerencia CMV, catálogo e funcionários da equipe; não cria nem altera outro gerente ou administrador. |
| `caixa`, `garcom` | Consultam produtos. As permissões operacionais do PDV serão conectadas em outra etapa. |
| `cozinha` | Consulta produtos e suas fichas técnicas com ingredientes e quantidades, sem custos ou edição. |
| `funcionario` | Cargo anterior, mantido somente para contas existentes: consulta CMV e produtos. Não aparece nas opções de novos cadastros. |

As permissões são verificadas nas rotas, não apenas na interface. O servidor consulta o usuário atual no banco em cada chamada autenticada, então a desativação ou mudança de cargo passa a valer mesmo para um JWT emitido antes da alteração. `DELETE /usuarios/:id` desativa a conta sem apagar seu registro; `PUT` com `ativo: true` pode reativá-la. O JWT expira em 7 dias por padrão, configurável por `JWT_EXPIRES_IN`. As senhas devem conter somente números e ter no mínimo 4 dígitos. Guarde-as como texto para preservar zeros à esquerda.

## Respostas

Sucesso:

```json
{
    "success": true,
    "data": {}
}
```

Erro:

```json
{
    "success": false,
    "message": "Descrição do erro"
}
```

Listagem paginada:

```json
{
    "success": true,
    "data": [],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 45,
        "totalPages": 3
    }
}
```

## Endpoints

### Autenticação

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/auth/register` | Cadastra empresa nova e seu administrador |
| `POST` | `/auth/login` | Autentica e retorna JWT |
| `GET` | `/auth/me` | Retorna dados e permissões atuais do usuário autenticado |

### Insumos

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/insumos` | Cadastra um insumo |
| `POST` | `/insumos/com-ficha` | Cadastra insumo, produto e ficha |
| `GET` | `/insumos` | Lista insumos |
| `PUT` | `/insumos/:id` | Atualiza e recalcula fichas relacionadas |
| `DELETE` | `/insumos/:id` | Exclui um insumo sem uso |

### Produtos

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/produtos` | Cadastra produto sem ficha |
| `GET` | `/produtos` | Lista produtos |
| `GET` | `/produtos/:id` | Busca produto |
| `PUT` | `/produtos/:id` | Atualiza produto e ficha |
| `DELETE` | `/produtos/:id` | Exclui produto sem ficha |

### Fichas técnicas

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/fichas` | Cria produto e ficha técnica |
| `GET` | `/fichas` | Lista fichas e métricas |
| `GET` | `/fichas/consulta` | Lista receitas sem custos, preços ou dados de compra; permitido a `admin`, `gerente`, `cozinha` e contas legadas `funcionario` |
| `GET` | `/fichas/consulta/produto/:id` | Consulta a receita de um produto, sem custos ou dados de compra |
| `GET` | `/fichas/produto/:id` | Busca ficha pelo produto |
| `DELETE` | `/fichas/:id` | Exclui conjuntamente ficha e produto |

### Transformados

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/transformados` | Cria um insumo transformado |

### Usuários

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/usuarios` | Lista usuários da empresa |
| `GET` | `/usuarios/cargos` | Lista os cargos que o usuário atual pode atribuir |
| `POST` | `/usuarios` | Cria funcionário com cargo explícito |
| `PUT` | `/usuarios/:id` | Atualiza nome, cargo ou `ativo` |
| `DELETE` | `/usuarios/:id` | Desativa usuário sem apagar o histórico |

Exemplo de cadastro por um administrador autenticado:

```json
{
  "nome": "Maria",
  "email": "maria@exemplo.com",
  "senha": "1234",
  "cargo": "caixa"
}
```

## Paginação e filtros

As listagens de insumos, produtos e fichas aceitam:

```text
page=1
limit=20
search=arroz
categoria=hortifruti
tipo=base
```

Exemplo:

```http
GET /insumos?page=1&limit=20&search=arroz&tipo=base
```

O limite máximo é 100. Sem `page` ou `limit`, a API mantém a listagem completa usada por seletores e pelo dashboard.

## Unidades e custos

- `kg` é armazenado internamente em `g`.
- `L` é armazenado internamente em `ml`.
- Insumos em `un` podem informar peso ou volume unitário.
- Cada ingrediente é convertido conforme sua própria unidade, permitindo combinar massa e volume.
- `valorUnitario` usa a quantidade líquida aproveitável.
- Alterar um insumo recalcula as fichas que o utilizam.

Exemplo: uma compra de 10 kg por R$ 50 com 8 kg líquidos resulta em custo real de R$ 6,25 por kg.

## Importação de insumos

Coloque `insumos.xlsx` na raiz e confira o `EMPRESA_ID` definido no início de `src/scripts/importar-insumos.js`. Depois execute:

```bash
npm run import:insumos
```

Faça backup do banco e valide a planilha antes da importação. O script grava registros reais e não deve ser executado repetidamente sem conferir duplicidades.

## Segurança em produção

No Render, configure ao menos:

```env
NODE_ENV=production
MONGO_URI=...
JWT_SECRET=...
CORS_ORIGINS=https://seu-frontend.com
```

`CORS_ORIGINS` aceita vários endereços separados por vírgula e sem `/` no final.

## Verificação antes de publicar

```bash
npm install
npm run check
```

Depois verifique se o serviço inicia:

```bash
npm start
```
