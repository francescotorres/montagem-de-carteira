package com.example.data.local

import com.example.data.model.CategoryTargetEntity
import com.example.data.model.FiiAssetEntity
import com.example.data.model.PortfolioConfigEntity

object DefaultData {
    val defaultPortfolioConfig = PortfolioConfigEntity(
        id = 1,
        clientName = "FULANO",
        dateStr = "11/09/2026",
        totalToInvest = 150000.0,
        reserveFund = 30000.0,
        monthlyExpenses = 6000.0,
        employmentType = "CLT",
        investorProfile = "MODERADO"
    )

    val defaultCategoryTargets = listOf(
        CategoryTargetEntity("CRA / Fiagro", 18.0),
        CategoryTargetEntity("CRI / Papel", 22.0),
        CategoryTargetEntity("Logística / Tijolo", 11.0),
        CategoryTargetEntity("Terras / Agrícola", 11.0),
        CategoryTargetEntity("Shopping / Tijolo", 11.0),
        CategoryTargetEntity("ETF Mundial", 9.0),
        CategoryTargetEntity("Energia Alternativas", 11.0),
        CategoryTargetEntity("ETF Renda Fixa", 7.0)
    )

    val defaultAssets = listOf(
        FiiAssetEntity(
            ticker = "RZAG11",
            name = "Rizea Ágora FIAGRO",
            category = "CRA / Fiagro",
            segmentType = "Fiagro",
            currentPrice = 8.26,
            lastDividend = 0.13,
            shares = 1615,
            targetPercentage = 11.11,
            isSelected = true,
            gestora = "Rizea Asset Management",
            recommendedProfiles = "MODERADO,AGRESSIVO",
            summaryText = "Gerido pela Rizea Asset Management, o RZAG11 é um FIAGRO focado em investimentos nas cadeias produtivas agroindustriais. Seu objetivo é auferir rendimentos e ganhos de capital por meio da aplicação de recursos preponderantemente em Certificados de Recebíveis do Agronegócio (CRAs) e direitos creditórios do setor agropastoril. Nos últimos 12 meses, o fundo entregou um dividend yield médio histórico atrativo, situado na faixa de 13% a 15% ao ano. Trata-se de um excelente veículo para capturar a força do agronegócio brasileiro com rentabilidade mensal isenta de IR e rendimentos indexados ao CDI."
        ),
        FiiAssetEntity(
            ticker = "KNSC11",
            name = "Kinea Select Realty",
            category = "CRI / Papel",
            segmentType = "Papel",
            currentPrice = 8.96,
            lastDividend = 0.11,
            shares = 1489,
            targetPercentage = 11.11,
            isSelected = true,
            gestora = "Kinea Investimentos",
            recommendedProfiles = "CONSERVADOR,MODERADO",
            summaryText = "Gerido pela Kinea Investimentos, este fundo imobiliário de papel tem como foco a alocação em crédito imobiliário com flexibilidade operacional para alternar posições entre papéis indexados ao IPCA e ao CDI. A carteira é composta majoritariamente por Certificados de Recebíveis Imobiliários (CRIs) de alta qualidade e com boa relação risco-retorno. No acumulado dos últimos 12 meses, registrou um dividend yield médio de 11% a 13% ao ano. A gestão de primeira linha do grupo Itaú aliada à alta capacidade de adaptação ao cenário macroeconômico torna o fundo uma escolha sólida para proteção patrimonial."
        ),
        FiiAssetEntity(
            ticker = "KNCR11",
            name = "Kinea Rendimentos Imobiliários",
            category = "CRI / Papel",
            segmentType = "Papel",
            currentPrice = 106.73,
            lastDividend = 1.25,
            shares = 125,
            targetPercentage = 11.11,
            isSelected = true,
            gestora = "Kinea Investimentos",
            recommendedProfiles = "CONSERVADOR,MODERADO",
            summaryText = "Também sob gestão da Kinea Investimentos, o KNCR11 é um dos maiores e mais líquidos fundos imobiliários de crédito privado do mercado brasileiro. O seu foco é o crédito imobiliário High Grade atrelado a títulos pós-fixados, investindo principalmente em CRIs de grandes corporações indexados à taxa CDI. Nos últimos 12 meses, sustentou um dividend yield médio de cerca de 12% a 13% ao ano. O ativo destaca-se como padrão ouro em segurança e liquidez, sendo ideal para quem busca proventos mensais previsíveis e forte proteção em cenários de juros elevados."
        ),
        FiiAssetEntity(
            ticker = "GARE11",
            name = "Guardian Real Estate",
            category = "Logística / Tijolo",
            segmentType = "Tijolo",
            currentPrice = 8.20,
            lastDividend = 0.08,
            shares = 1627,
            targetPercentage = 11.11,
            isSelected = true,
            gestora = "Guardian Gestão de Ativos",
            recommendedProfiles = "CONSERVADOR,MODERADO",
            summaryText = "Sob gestão da Guardian Gestão de Ativos, este fundo imobiliário de tijolo atua no segmento de renda urbana e galpões logísticos. Seu foco está centrado em contratos atípicos de longo prazo, como os modelos Built-to-Suit e Sale-and-Leaseback. Os principais investimentos envolvem imóveis comerciais locados para grandes redes varejistas e galpões logísticos estratégicos. Nos últimos 12 meses, apresentou um dividend yield médio em torno de 10% a 12% ao ano. O grande atrativo do fundo é a previsibilidade do fluxo de caixa garantida por contratos longos com inquilinos corporativos de grande porte."
        ),
        FiiAssetEntity(
            ticker = "RZTR11",
            name = "Rizea Terra FII",
            category = "Terras / Agrícola",
            segmentType = "Tijolo",
            currentPrice = 81.62,
            lastDividend = 0.90,
            shares = 164,
            targetPercentage = 11.11,
            isSelected = true,
            gestora = "Rizea Asset Management",
            recommendedProfiles = "MODERADO,AGRESSIVO",
            summaryText = "Gerido pela Rizea Asset Management, o RZTR11 é um fundo imobiliário focado no mercado de terras agrícolas. Sua estratégia baseia-se na aquisição de propriedades rurais com posterior arrendamento ou venda estratégica para obtenção de ganho de capital. O portfólio é formado por fazendas e terras agricultáveis de alta produtividade localizadas nas principais regiões produtoras do país. Nos últimos 12 meses, entregou um dividend yield médio na faixa de 12% a 14% ao ano. O fundo combina a geração de renda mensal recorrente com o potencial de valorização patrimonial dos imóveis rurais."
        ),
        FiiAssetEntity(
            ticker = "HSML11",
            name = "HSI Malls FII",
            category = "Shopping / Tijolo",
            segmentType = "Tijolo",
            currentPrice = 82.12,
            lastDividend = 0.75,
            shares = 163,
            targetPercentage = 11.11,
            isSelected = true,
            gestora = "Hemisfério Sul Investimentos (HSI)",
            recommendedProfiles = "MODERADO",
            summaryText = "Gerido pela Hemisfério Sul Investimentos (HSI), este fundo atua no segmento de Shopping Centers, com foco no controle direto e gestão ativa de empreendimentos dominantes em suas regiões de atuação. Seus principais investimentos distribuem-se por um portfólio diversificado de shoppings espalhados pelo país, como o Shopping Pátio Maceió e o Shopping Granja Vianna. Nos últimos 12 meses, registrou um dividend yield médio estimado entre 9% e 11% ao ano. Investir no fundo garante exposição a ativos reais de alta qualidade com receitas crescentes vindas do consumo presencial."
        ),
        FiiAssetEntity(
            ticker = "WRLD11",
            name = "Investo ETF MSCI World",
            category = "ETF Mundial",
            segmentType = "ETF",
            currentPrice = 150.40,
            lastDividend = 0.00,
            shares = 86,
            targetPercentage = 11.11,
            isSelected = true,
            gestora = "Investo Gestão de Recursos",
            recommendedProfiles = "MODERADO,AGRESSIVO",
            summaryText = "Gerido pela Investo Gestão de Recursos, o WRLD11 é um ETF negociado na B3 que replica o desempenho do índice MSCI World. Seu foco é oferecer diversificação global por meio do acesso ao mercado de ações de países desenvolvidos. O fundo investe indiretamente em mais de 1.500 empresas globais de grande e médio porte, incluindo gigantes tecnológicas como Apple, Microsoft, Amazon e Nvidia. Por acompanhar ações globais e a variação cambial, sua rentabilidade nos últimos 12 meses seguiu a tendência de duplo dígito dos mercados internacionais. É a ferramenta ideal para dolarização do patrimônio e diversificação internacional em uma única cota."
        ),
        FiiAssetEntity(
            ticker = "SNEL11",
            name = "Suno Energias Limpas FII",
            category = "Energia Alternativas",
            segmentType = "Tijolo",
            currentPrice = 8.08,
            lastDividend = 0.10,
            shares = 1651,
            targetPercentage = 11.11,
            isSelected = true,
            gestora = "Suno Asset",
            recommendedProfiles = "MODERADO,AGRESSIVO",
            summaryText = "Gerido pela Suno Asset, o SNEL11 é um fundo focado nos setores de infraestrutura e energia renovável. O foco do ativo é o desenvolvimento, a construção e a locação de usinas de geração fotovoltaica (energia solar) na modalidade de Geração Distribuída. Seus investimentos estão alocados em usinas solares com contratos de locação de longo prazo firmados com grandes empresas consumidoras. Nos últimos 12 meses, entregou um dividend yield médio robusto de 11% a 13% ao ano. O fundo representa uma oportunidade de investir na transição energética com receitas previsíveis e descorrelacionadas do mercado imobiliário tradicional."
        ),
        FiiAssetEntity(
            ticker = "RURA11",
            name = "Itaú Asset Rural FII",
            category = "CRA / Fiagro",
            segmentType = "Fiagro",
            currentPrice = 8.09,
            lastDividend = 0.11,
            shares = 1649,
            targetPercentage = 11.11,
            isSelected = true,
            gestora = "Itaú Asset Management",
            recommendedProfiles = "MODERADO,AGRESSIVO",
            summaryText = "Gerido pela Itaú Asset Management, este FIAGRO é voltado para o financiamento do setor agropecuário com foco na estruturação e originação de crédito de alta qualidade. Seus principais investimentos compõem uma carteira diversificada de CRAs com elevada nota de crédito e pulverização entre diferentes cadeias do setor rural. Nos últimos 12 meses, manteve um dividend yield médio atrelado ao CDI situado entre 13% e 15% ao ano. O grande diferencial do fundo reside no suporte, rigor de análise de risco e solidez da maior gestora privada do país em um dos setores mais pujantes da economia."
        ),
        FiiAssetEntity(
            ticker = "LLFT11",
            name = "BTG Pactual Teva Tesouro Selic",
            category = "ETF Renda Fixa",
            segmentType = "Renda Fixa",
            currentPrice = 118.67,
            lastDividend = 0.00,
            shares = 253,
            targetPercentage = 25.0,
            isSelected = true,
            gestora = "BTG Pactual Asset Management",
            recommendedProfiles = "CONSERVADOR,MODERADO",
            summaryText = "Gerido pela BTG Pactual Asset Management, o LLFT11 é um ETF (Fundo de Índice) de renda fixa listado na B3 que replica o índice Teva Tesouro Selic Longo Prazo. Seu foco principal é proporcionar retorno equivalente à taxa Selic / CDI por meio da compra direta de títulos públicos pós-fixados do governo federal (Letras Financeiras do Tesouro - LFTs). Seus principais investimentos são compostos inteiramente por papéis do Tesouro Selic de prazos mais longos e com alta liquidez. Nos últimos 12 meses, entregou uma rentabilidade média em torno de 14% a 15% ao ano (acompanhando de perto o ritmo da taxa de juros básica do país). Trata-se de um excelente ativo para gestão de caixa e reserva de oportunidade, combinando a máxima segurança do Tesouro Nacional com alta liquidez, alíquota de imposto favorável e sem a cobrança de come-cotas ou IOF."
        )
    )

    val educationalTerms = listOf(
        Pair("Dividend Yield", "É como o \"troco\" ou o aluguel que o investimento te paga por ser dono dele. Se você compra um bem por R$ 100 e ele te devolve R$ 10 todo ano só por você ser o dono, o Dividend Yield dele é de 10%."),
        Pair("CDI", "É o \"termômetro\" dos juros do Brasil. Quando os bancos emprestam dinheiro entre si de um dia para o outro, eles cobram essa taxa. Quanto mais alta ela está, mais rendem os investimentos ligados a ela."),
        Pair("CRA", "Pense que um fazendeiro precisa de dinheiro para comprar tratores ou sementes. Ele pega emprestado com os investidores e promete devolver com juros. Esse \"papel de promessa de pagamento do agro\" é o CRA."),
        Pair("CRI", "É igual ao CRA, só que para prédios e construtoras! Se uma empresa precisa de dinheiro para construir um shopping ou prédio comercial, ela pega com os investidores. Esse \"papel de promessa do mercado imobiliário\" é o CRI."),
        Pair("FIAGRO", "É como uma \"vaquinha\" gigante de vários investidores para comprar fazendas, terras ou emprestar dinheiro para o agronegócio. Você vira \"sócio\" do campo sem precisar capinar nada!"),
        Pair("ETF", "Imagine uma cesta cheia de frutas diferentes. Em vez de comprar uma maçã, uma banana e uma laranja separadas, você compra a cesta inteira de uma vez. O ETF é uma cesta que vem cheia de várias ações ou títulos juntos (como Apple, Microsoft, etc.)."),
        Pair("IPCA", "É o medidor oficial da inflação (o aumento dos preços). Quando o preço do lanche ou do combustível sobe, é o IPCA subindo. Investimentos que seguem o IPCA garantem que seu dinheiro não perca poder de compra no futuro."),
        Pair("Fundo de Reserva", "O fundo de emergência é um montante reservado para eventualidades e imprevistos, como saúde, demissões e custos emergenciais. Recomendado: 3 meses de custos para servidores públicos e 6 meses para celetistas e autônomos. Melhores locais: Tesouro Selic ou CDB liquidez diária.")
    )
}
