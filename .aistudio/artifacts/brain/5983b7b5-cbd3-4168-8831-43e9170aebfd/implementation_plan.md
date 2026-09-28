# Spatial UI Premium & Master Toggle Switch

Plano de modernização visual e interativa da aplicação de Montagem de Carteiras, implementando uma experiência Spatial UI em tons de azul com estética glassmorphic de alto contraste, fundo etéreo luminoso e toggle switch mestre para alternar o status de todos os ativos da carteira.

### User Review & Critical Decisions

> [!IMPORTANT]
> As preferências visuais foram alinhadas e confirmadas na etapa anterior:
> - **Fundo Espacial**: Degradê suave azul etéreo (`#E8F2FC` a `#F4F9FF`) com iluminação radial sutil nos cantos superiores para profundidade tridimensional.
> - **Acabamento dos Cartões Glassmorphic**: Efeito de vidro médio com superfície translúcida (`Color(0xCCFFFFFF)` / `Color(0xDCF0F8FF)`), bordas refinadas em azul safira de alto contraste (`Color(0x802563EB)` a `Color(0xFF1D4ED8)`) e cantos arredondados orgânicos (20.dp a 24.dp).
> - **Cores de Ação e Destaque**: Azul cobalto espacial vibrante (`Color(0xFF1D4ED8)` a `Color(0xFF2563EB)`) com gradientes luminosos em botões de ação e estados ativos.
> - **Controle Mestre no Dashboard**: Switch interativo dedicado ("Todos ON / Desativar") na barra de ações rápidas da carteira para alternar todos os ativos simultaneamente com transição fluida.

---

### 1. Overview & Core Concept

- **O que faz**: Transforma a interface tradicional em uma experiência futurista e elegante no estilo **Spatial UI**, mantendo legibilidade exemplar, contraste nítido para dados financeiros e controles táteis imediatos para manipulação da carteira.
- **Público-alvo**: Investidores e consultores financeiros que necessitam de um painel ágil, profissional e visualmente imersivo para planejar e demonstrar alocações de FIIs e Fiagros.
- **Valor Principal**: Combina a sofisticação da computação espacial (camadas, profundidade e translucidez) com ergonomia móvel e feedback tátil instantâneo.

---

### 2. User Experience & Visual Design

#### Fluxos de Uso Principais
1. **Visão Geral e Ativação Coletiva**: O usuário visualiza o topo da carteira com métricas e o novo controle de alternância mestre (*Toggle Switch*). Ao acionar o switch, todos os ativos são ativados ou desativados em lote instantaneamente, recalculando a renda mensal esperada, o yield médio e as metas de categorias.
2. **Navegação Spatial Glassmorphic**: Cartões de ativos, métricas de patrimônio e a dock magnética flutuam sobre um canvas azul etéreo, com realces de luz especular nas bordas em azul safira.
3. **Equilíbrio e Simulação**: Ajustes nos filtros de perfil de investidor e cotas refletem em tempo real no novo gráfico de pizza espacial translúcido e nos relatórios.

#### Identidade Visual & Tema (Spatial Blue Palette)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SPATIAL BLUE TOKENS                             │
├───────────────────────┬────────────────────────────────────────────────┤
│ SpatialBackground     │ Brush linear vertical #EAF3FD -> #F8FAFD        │
│ GlowHighlights        │ Radial Brushes sutis em #C8E3FA (15% opacidade)│
│ GlassSurfaceBase      │ #FFFFFF com 78% a 85% de alpha                 │
│ GlassBorderSapphire   │ #1D4ED8 (50% a 90% alpha) para alto contraste  │
│ CobaltAccent          │ #1D4ED8 -> #2563EB (gradiente vibrante ativo)  │
│ TextHighContrast      │ #0F172A (azul noite profundo para máxima leitura│
│ TextSubtle            │ #475569 (cinza ardósia para rótulos secundários│
│ VibrantGreenMetric    │ #059669 / #10B981 (indicador positivo seguro)  │
└───────────────────────┴────────────────────────────────────────────────┘
```

- **Tipografia**: Hierarquia com peso bold nos títulos e métricas financeiras, fontes claras para cotações e rendimentos com alto contraste sobre superfícies de vidro.
- **Micro-interações e Movimento**:
  - Efeito suave de transição ao alternar o Switch de todos os ativos (`animateFloatAsState`).
  - Toque com elevação tátil e iluminação sutil de borda ao interagir com cartões e botões.
  - Dock magnética com efeito de lente de aumento mantida e agora envelopada em acabamento glassmorphism safira.

---

### 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Implementação do Glassmorphism Nativo em Jetpack Compose**
  - *Abordagem*: Utilizar superfícies translúcidas em múltiplas camadas com `Brush.verticalGradient` para iluminação interna simulada e `BorderStroke` duplo/degradê em azul safira, evitando filtros de blur computacionalmente pesados que prejudicam a fluidez de rolagem em dispositivos intermediários.
  - *Por que*: Garante 60–120 FPS estáveis sem atrasos no scroll de listas grandes de ativos, mantendo a sensação estética premium de vidro lapidado.
  - *Alternativas Descartadas*: RenderEffect Blur global em toda a tela (causa alto consumo de GPU e incompatibilidade com versões antigas do Android).

- **Decisão 2: Comportamento do Switch "Ativar / Desativar Todos"**
  - *Abordagem*: O switch reflete o estado `checked` se todos os ativos disponíveis estiverem ativados (`activeCount == totalCount`). Se apenas parte estiver ativada ou nenhum, o switch permanece desligado. Ao tocá-lo quando desligado, ativa todos (100%); ao tocá-lo quando ligado, desativa todos (0%).
  - *Por que*: Padrão intuitivo e previsível, eliminando ambiguidade de estados intermediários no botão de ação rápida.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                      SPATIAL UI COMPOSITION ARCHITECTURE               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
          ┌─────────────────────────┴──────────────────────────┐
          ▼                                                    ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  SpatialTheme & Color Tokens │              │  EtherealCanvasBackground    │
│  - SapphireBorder            │              │  - Linear Sky Gradient       │
│  - CobaltAccentGradient      │              │  - Subtle Top Glow Orbs      │
│  - GlassTranslucentFill      │              └──────────────┬───────────────┘
└──────────────┬───────────────┘                             │
               │                                             │
               ├───────────────────────┬─────────────────────┤
               ▼                       ▼                     ▼
┌──────────────────────────────┐ ┌───────────────┐ ┌───────────────────────────┐
│ SpatialGlassCard             │ │ MasterToggle  │ │ Floating Magnetic Dock    │
│ - Translucent fill           │ │ - Quick Bar   │ │ - Sapphire border pill    │
│ - Sapphire contrast outline  │ │ - Single tap  │ │ - Physics magnification   │
│ - Soft specular drop-shadow  │ │   batch state │ │ - Spatial active dot      │
└──────────────┬───────────────┘ └───────┬───────┘ └─────────────┬─────────────┘
               │                         │                       │
               ▼                         ▼                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ PortfolioScreen / CategoryBalanceScreen / ReportScreen (Screens & ViewModel) │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### Mapeamento de Estados e Ações Interativas:
- **`onToggleAllAssets(Boolean)`**: Invoca o método do `PortfolioViewModel` que atualiza atomicamente a entidade `FiiAssetEntity.isSelected` para todos os registros no Room Database, garantindo persistência imediata.
- **`SpatialGlassCard`**: Substitui o `SoftUiCard` clássico por uma estrutura com curvatura de 20.dp, borda safira de 1.2.dp com alto contraste e preenchimento levemente translúcido.
- **`MagneticDock`**: Atualizado para refletir o tema espacial em sua cápsula flutuante e botões com transição de brilho.
