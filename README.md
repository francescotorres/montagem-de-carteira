# Montagem de Carteiras 📊

> **Planejador inteligente e gerador de relatórios executivos de carteiras de Fundos Imobiliários (FIIs), Fiagros e ETFs, com cotações atualizadas da B3 e balanceamento automático por perfil de investidor.**

Disponível tanto como **aplicativo web online** (executável em qualquer navegador/dispositivo) quanto como **aplicativo móvel nativo Android**.

---

## 🚀 Funcionalidades Principais

1. **Gestão Dinâmica de Ativos:**
   - Suporte a Fundos Imobiliários (CRI/Papel, Tijolo/Logística, Shopping), Fiagros (CRA), Terras Agrícolas, Energia Limpa/Alternativas e ETFs (Mundial e Renda Fixa Selic).
   - Consulta de cotações em tempo real da B3.
   - Steppers rápidos para ajuste de cotas e cálculo instantâneo de rentabilidade e proventos mensais.

2. **Mecanismo de "Travar Valor" e "Distribuir Valor":**
   - Permite fixar o valor alocado em ativos específicos com o botão de trava (🔒).
   - Ao executar **Distribuir Valor**, o montante já fixado é deduzido e o saldo restante é distribuído de forma equilibrada entre os ativos destravados.

3. **Perfis de Investimento Inteligentes:**
   - **Conservador:** Prioriza crédito imobiliário High Grade pós-fixado (KNCR11, KNSC11), Tesouro Selic (LLFT11) e galpões logísticos defensivos (GARE11).
   - **Moderado:** Estratégia balanceada entre CRIs, Fiagros (RZAG11), shoppings (HSML11), terras (RZTR11) e diversificação global (WRLD11).
   - **Agressivo:** Maximização de dividend yield e ganho de capital em agronegócio, energia solar (SNEL11) e ativos globais.

4. **Diagnóstico do Fundo de Reserva:**
   - Análise de reserva de emergência personalizada conforme ocupação:
     - **CLT / Autônomo:** recomendação de 6 meses de custo de vida.
     - **Servidor Público:** recomendação de 3 meses de estabilidade.

5. **Relatório Executivo & Compartilhamento:**
   - Tabela detalhada de ativos com cálculo de dividend yield e renda mensal estimada (isentos de IR).
   - Exportação em um clique para **WhatsApp** com texto estruturado.
   - Cópia para área de transferência e versão otimizada para **impressão ou salvamento em PDF**.
   - **Guia Educacional / Dicionário do Investidor** (Dividend Yield, CDI, CRA, CRI, FIAGRO, ETF, IPCA, Reserva).

---

## 🌐 Aplicativo Web (Trabalho Online)

O aplicativo web foi desenvolvido com **React 19**, **TypeScript**, **Vite** e **Tailwind CSS**, com persistência local automática (`localStorage`), responsividade total e suporte para deploy online em qualquer serviço (Vercel, Netlify, GitHub Pages, Cloudflare Pages).

### Como Rodar o Web App Localmente:

```bash
# 1. Instalar dependências (na raiz ou na pasta web/)
npm --prefix web install

# 2. Iniciar servidor de desenvolvimento local
npm run web:dev
```
Abra o navegador no endereço indicado (por padrão `http://localhost:5173`).

### Como Gerar a Versão de Produção (Build Estático):

```bash
npm run web:build
```
Os arquivos otimizados prontos para publicação estarão na pasta `web/dist/`.

### Como Publicar Online (Deploy Rápido):
- **Vercel / Netlify:** Conecte o repositório do GitHub e defina a pasta raiz como `web/` com build command `npm run build` e output directory `dist`.
- **GitHub Pages:** Pode ser implantado automaticamente via GitHub Actions com workflow para Vite.

---

## 📱 Aplicativo Android (Mobile)

Construído com **Kotlin**, **Jetpack Compose**, **Room Database** e **Material 3 Spatial Design**.

### Como Rodar no Android Studio:
1. Abra o [Android Studio](https://developer.android.com/studio).
2. Selecione **Open** e escolha o diretório do projeto.
3. Crie um arquivo `.env` na raiz informando sua chave Gemini se desejar recursos generativos (vide `.env.example`).
4. Execute no emulador ou dispositivo físico conectado via USB/Wi-Fi.

---

## 📁 Estrutura do Projeto

```text
Montagem de Carteira/
├── app/                  # Aplicativo Android nativo (Kotlin + Jetpack Compose + Room)
│   ├── src/main/java/com/example/
│   │   ├── data/         # Models, Room Database e Scrapers de cotação
│   │   ├── ui/           # Telas (Portfolio, Balanceamento, Relatório) e Temas
│   │   └── viewmodel/    # StateFlow, regras de perfil e algoritmos de balanceamento
│   └── build.gradle.kts
├── web/                  # Aplicativo Web Moderno (React + TypeScript + Vite + Tailwind)
│   ├── src/
│   │   ├── components/   # Navbar, PortfolioScreen, CategoryBalance, Report, Modais
│   │   ├── data/         # Dados iniciais e glossário educacional
│   │   ├── services/     # Motor de balanceamento, distribuição de cotas e cotações B3
│   │   ├── utils/        # Formatadores monetários brasileiros e badges
│   │   └── App.tsx       # Estado global, persistência e orquestração
│   ├── package.json
│   └── vite.config.ts
├── package.json          # Scripts utilitários de conveniência
└── README.md
```

---

## 📄 Licença

Projeto desenvolvido para fins educacionais e de consultoria patrimonial financeira.
