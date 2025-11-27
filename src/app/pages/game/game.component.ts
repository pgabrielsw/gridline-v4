import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { GameService } from '../../core/services/game.service';
import { StockMarketService } from '../../core/services/stock-market.service'; 
import { Subscription } from 'rxjs'; 
import { StockMarketComponent } from '../stock-market/stock-market.component'; // Importe o StockMarketComponent

interface CityPoint {
  id: number;
  name: string;
  type: 'saúde' | 'Segurança' | 'Transporte' | 'Energia' | 'ambiente' | 'government' | 'education' | 'commerce' | 'industry' | 'culture' | 'sports';
  x: number;
  y: number;
  info: string;
  level: number;
  description: string;
  image: string;
  upgrades: Upgrade[];
}

interface Upgrade {
  name: string;
  cost: number;
  impact: string;
  description: string;
  requiredLevel: number;
}

interface Investment {
  area: string;
  cost: number;
  impact: string;
  description: string;
  image: string;
  imageType: 'emoji' | 'local' | 'url';
}
interface CookieSource {
  name: string;
  description: string;
  cookies: number;
  cooldown: number;
  lastCollected?: number;
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, StockMarketComponent], // Adicione StockMarketComponent aos imports
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy { 
  userEmail: string | null = null;
  cookies: number = 0; // Inicializado com 0, o serviço de bolsa fornecerá o valor real
  selectedPoint: CityPoint | null = null;
  showInvestmentPopup: boolean = false;
  selectedInvestment: Investment | null = null;
  currentView: 'map' | 'location' | 'stock-market' = 'map'; 
  
  private subscriptions = new Subscription(); // Gerencia todas as assinaturas

  // Indicadores da cidade
  indicators = {
    Energia: 65,
    Transporte: 45,
    Segurança: 70,
    ambiente: 60,
    saúde: 75,
    education: 50,
    commerce: 55,
    industry: 60,
    culture: 65,
    sports: 50
  };

  // Fontes de Cookies
  cookieSources: CookieSource[] = [
    {
      name: '💼 Impostos Urbanos',
      description: 'Coleta de impostos dos moradores',
      cookies: 50,
      cooldown: 30000
    },
    {
      name: '🏭 Produção Industrial',
      description: 'Vendas de produtos da cidade',
      cookies: 75,
      cooldown: 45000
    },
    {
      name: '🎯 Eventos da Cidade',
      description: 'Festivais e eventos especiais',
      cookies: 100,
      cooldown: 60000
    },
    {
      name: '💡 Inovação Tecnológica',
      description: 'Patentes e descobertas científicas',
      cookies: 150,
      cooldown: 90000
    }
  ];

  // Pontos inteligentes da cidade organizados por setores
  cityPoints: CityPoint[] = [
    // Setor ZT-01 (Centro - Setor Tecnológico)
    {
      id: 1,
      name: 'Hospital Municipal',
      type: 'saúde',
      x: 100, 
      y: 80,  
      info: 'Atendimentos: 85/dia | Capacidade: 90% | Alertas: 2',
      level: 2,
      description: 'Centro médico principal da cidade. Oferece atendimento emergencial, consultas especializadas e cirurgias.',
      image: '🏥',
      upgrades: [
        { name: 'Novos Equipamentos', cost: 300, impact: '+15 Saúde', description: 'Aquisição de equipamentos médicos modernos para diagnóstico e tratamento.', requiredLevel: 1 },
        { name: 'Ampliação do Prédio', cost: 500, impact: '+25 Saúde', description: 'Expansão da estrutura para atender mais pacientes simultaneamente.', requiredLevel: 2 }
      ]
    },
    {
      id: 2,
      name: 'Prefeitura Digital',
      type: 'government',
      x: 230, 
      y: 130, 
      info: 'Projetos: 8 | Investimentos: 2.5M | Satisfação: 68%',
      level: 3,
      description: 'Centro administrativo e tecnológico da cidade. Gerencia todos os serviços públicos.',
      image: '🏛️',
      upgrades: [
        { name: 'Sistema Digital', cost: 400, impact: '+10 Todos', description: 'Plataforma integrada para gestão de todos os serviços.', requiredLevel: 1 },
        { name: 'Centro de Dados', cost: 650, impact: '+15 Todos', description: 'Infraestrutura de processamento de dados urbanos.', requiredLevel: 2 }
      ]
    },
    {
      id: 3,
      name: 'Delegacia Central',
      type: 'Segurança',
      x: 360, 
      y: 80,  
      info: 'Ocorrências: 12/dia | Segurança: 70% | Patrulhas: 8',
      level: 2,
      description: 'Centro de comando da segurança pública. Coordena patrulhas e responde a emergências.',
      image: '🚓',
      upgrades: [
        { name: 'Câmeras de Segurança', cost: 250, impact: '+12 Segurança', description: 'Instalação de sistema de vigilância por câmeras inteligentes.', requiredLevel: 1 },
        { name: 'Veículos Novos', cost: 400, impact: '+20 Segurança', description: 'Frota de viaturas modernas equipadas com tecnologia.', requiredLevel: 2 }
      ]
    },
    {
      id: 14,
      name: 'Centro de Pesquisa Avançada',
      type: 'education',
      x: 100, 
      y: 190, 
      info: 'Projetos de P&D: 15 | Pesquisadores: 120 | Patentes: 8',
      level: 1,
      description: 'Polo de inovação e pesquisa, desenvolvendo tecnologias de ponta para o futuro da cidade.',
      image: '🔬',
      upgrades: [
        { name: 'Laboratórios de IA', cost: 350, impact: '+10 Educação, +5 Energia', description: 'Criação de laboratórios focados em inteligência artificial e aprendizado de máquina.', requiredLevel: 1 },
        { name: 'Programas de Bolsa', cost: 550, impact: '+15 Educação, +10 Comércio', description: 'Criação de programas de bolsas para atrair talentos e fomentar a inovação.', requiredLevel: 2 }
      ]
    },
    {
      id: 15,
      name: 'Hub de Startups',
      type: 'commerce',
      x: 230, 
      y: 200, 
      info: 'Startups Ativas: 20 | Investimento Anual: 1.2M | Empregos Criados: 100',
      level: 1,
      description: 'Espaço dinâmico para novas empresas de tecnologia, impulsionando a economia local e a inovação.',
      image: '💡',
      upgrades: [
        { name: 'Aceleração de Negócios', cost: 300, impact: '+10 Comércio, +5 Educação', description: 'Lançamento de programas de mentoria e aceleração para startups.', requiredLevel: 1 },
        { name: 'Fundo de Capital Semente', cost: 600, impact: '+15 Comércio, +10 Todos', description: 'Criação de um fundo para investir em startups promissoras, gerando retorno para a cidade.', requiredLevel: 2 }
      ]
    },

    // Setor ZT-02 (Norte - Setor Residencial)
    {
      id: 4,
      name: 'Estação de Ônibus Inteligente',
      type: 'Transporte',
      x: 580, 
      y: 80,  
      info: 'Fluxo: 450/dia | Tráfego: 45% | Pontualidade: 82%',
      level: 1,
      description: 'Hub de Transportee público equipado com tecnologia inteligente.',
      image: '🚌',
      upgrades: [
        { name: 'Ônibus Elétricos', cost: 180, impact: '+15 Transportee', description: 'Substituição da frota por veículos elétricos silenciosos.', requiredLevel: 1 },
        { name: 'Sinalização Inteligente', cost: 320, impact: '+22 Transportee', description: 'Sistema de semáforos adaptativos para melhor fluidez.', requiredLevel: 2 }
      ]
    },
    {
      id: 5,
      name: 'Escola Técnica',
      type: 'education',
      x: 710, 
      y: 130, 
      info: 'Alunos: 320 | Qualificação: 75% | Empregabilidade: 68%',
      level: 2,
      description: 'Centro de formação técnica e profissionalizante para jovens e adultos.',
      image: '🏫',
      upgrades: [
        { name: 'Laboratórios Modernos', cost: 280, impact: '+10 Educação', description: 'Equipamentos atualizados para ensino prático.', requiredLevel: 1 },
        { name: 'Parcerias Empresariais', cost: 450, impact: '+18 Educação', description: 'Programas de estágio e empregabilidade.', requiredLevel: 2 }
      ]
    },
    {
      id: 6,
      name: 'Shopping Center',
      type: 'commerce',
      x: 580, 
      y: 190, 
      info: 'Lojas: 45 | Movimento: 1200/dia | Satisfação: 72%',
      level: 2,
      description: 'Centro comercial com lojas, alimentação e entretenimento.',
      image: '🏬',
      upgrades: [
        { name: 'Expansão Comercial', cost: 320, impact: '+15 Comércio', description: 'Ampliação com novas lojas e serviços.', requiredLevel: 1 },
        { name: 'Estacionamento Inteligente', cost: 480, impact: '+22 Comércio', description: 'Sistema automatizado de vagas e pagamento.', requiredLevel: 2 }
      ]
    },
    {
      id: 16,
      name: 'Centro Comunitário',
      type: 'culture',
      x: 710, 
      y: 200, 
      info: 'Eventos Mensais: 10 | Participantes: 500 | Satisfação Comunitária: 88%',
      level: 1,
      description: 'Ponto de encontro para moradores, oferecendo atividades recreativas, culturais e educacionais.',
      image: '🏘️',
      upgrades: [
        { name: 'Aulas de Capacitação', cost: 250, impact: '+10 Cultura, +5 Saúde', description: 'Oferece cursos e workshops para desenvolvimento de habilidades e bem-estar.', requiredLevel: 1 },
        { name: 'Espaço Multiuso', cost: 400, impact: '+15 Cultura, +10 Saúde', description: 'Construção de um auditório e salas de reunião para eventos maiores.', requiredLevel: 2 }
      ]
    },
    {
      id: 17,
      name: 'Conjunto Habitacional Moderno',
      type: 'saúde',
      x: 450, 
      y: 150, 
      info: 'Unidades: 150 | Ocupação: 95% | Qualidade de Vida: 80%',
      level: 1,
      description: 'Novas moradias acessíveis e sustentáveis, melhorando a qualidade de vida dos cidadãos.',
      image: '🏢',
      upgrades: [
        { name: 'Áreas Verdes Integradas', cost: 300, impact: '+10 Saúde, +5 Ambiente', description: 'Criação de parques e jardins dentro do conjunto para recreação e bem-estar.', requiredLevel: 1 },
        { name: 'Smart Home System', cost: 500, impact: '+15 Saúde, +10 Energia', description: 'Implementação de tecnologia para otimização de energia e segurança nas residências.', requiredLevel: 2 }
      ]
    },

    // Setor ZT-03 (Sul - Setor Industrial)
    {
      id: 7,
      name: 'Estação de Energia Solar',
      type: 'Energia',
      x: 100, 
      y: 350, 
      info: 'Produção: 85MW | Autonomia: 65% | Eficiência: 78%',
      level: 1,
      description: 'Fonte principal de energia limpa da cidade com painéis solares.',
      image: '⚡',
      upgrades: [
        { name: 'Painéis Solares', cost: 200, impact: '+10 Energia', description: 'Instalação de novos painéis solares de alta eficiência.', requiredLevel: 1 },
        { name: 'Baterias Avançadas', cost: 350, impact: '+18 Energia', description: 'Sistema de armazenamento energético.', requiredLevel: 2 }
      ]
    },
    {
      id: 8,
      name: 'Centro de Reciclagem',
      type: 'ambiente',
      x: 230, 
      y: 400, 
      info: 'Resíduos: 12t/dia | Reciclagem: 60% | Lotação: 70%',
      level: 1,
      description: 'Instalação moderna para processamento de resíduos urbanos.',
      image: '♻️',
      upgrades: [
        { name: 'Máquinas Automáticas', cost: 240, impact: '+14 Meio Ambiente', description: 'Equipamentos automatizados para triagem eficiente.', requiredLevel: 1 },
        { name: 'Usina de Compostagem', cost: 420, impact: '+23 Meio Ambiente', description: 'Processamento de resíduos orgânicos em adubo.', requiredLevel: 2 }
      ]
    },
    {
      id: 9,
      name: 'Parque Industrial',
      type: 'industry',
      x: 360, 
      y: 350, 
      info: 'Empresas: 18 | Empregos: 850 | Produção: 92%',
      level: 2,
      description: 'Polo industrial com empresas de tecnologia e manufatura.',
      image: '🏭',
      upgrades: [
        { name: 'Infraestrutura Logística', cost: 380, impact: '+12 Indústria', description: 'Melhoria no sistema de Transportee de cargas.', requiredLevel: 1 },
        { name: 'Incentivos Fiscais', cost: 550, impact: '+20 Indústria', description: 'Programas de apoio ao desenvolvimento industrial.', requiredLevel: 2 }
      ]
    },
    {
      id: 10,
      name: 'Estação de Tratamento',
      type: 'ambiente',
      x: 450, 
      y: 400, 
      info: 'Capacidade: 85% | Qualidade: 88% | Eficiência: 75%',
      level: 1,
      description: 'Sistema avançado de tratamento de água e esgoto.',
      image: '💧',
      upgrades: [
        { name: 'Filtros Avançados', cost: 290, impact: '+16 Meio Ambiente', description: 'Tecnologia de purificação de última geração.', requiredLevel: 1 },
        { name: 'Reuso de Água', cost: 460, impact: '+24 Meio Ambiente', description: 'Sistema para reaproveitamento de água tratada.', requiredLevel: 2 }
      ]
    },
    {
      id: 18,
      name: 'Centro de Logística Automatizado',
      type: 'industry',
      x: 100, 
      y: 450, 
      info: 'Envios Diários: 500 | Eficiência: 90% | Geração de Empregos: 50',
      level: 1,
      description: 'Hub de distribuição de mercadorias com sistemas automatizados, otimizando o fluxo de produtos.',
      image: '🚚',
      upgrades: [
        { name: 'Armazéns Verticais', cost: 400, impact: '+10 Indústria, +5 Transporte', description: 'Construção de armazéns de alta tecnologia para maximizar o espaço de estocagem.', requiredLevel: 1 },
        { name: 'Frota de Drones de Entrega', cost: 700, impact: '+15 Indústria, +10 Transporte', description: 'Implementação de drones para entregas rápidas e eficientes dentro da cidade.', requiredLevel: 2 }
      ]
    },
    {
      id: 19,
      name: 'Fábrica de Insumos Sustentáveis',
      type: 'ambiente',
      x: 230, 
      y: 500, 
      info: 'Produção Sustentável: 90% | Resíduos: 5% | Emissões: Baixas',
      level: 1,
      description: 'Unidade de produção focada em materiais recicláveis e energia renovável, reduzindo o impacto ambiental.',
      image: '♻️🏭',
      upgrades: [
        { name: 'Processos de Reciclagem Avançados', cost: 450, impact: '+10 Ambiente, +5 Indústria', description: 'Modernização das máquinas para processar uma maior variedade de materiais com alta eficiência.', requiredLevel: 1 },
        { name: 'Certificação Verde', cost: 650, impact: '+15 Ambiente, +10 Imagem da Cidade', description: 'Busca por certificações internacionais de sustentabilidade, atraindo investimentos e talentos.', requiredLevel: 2 }
      ]
    },

    // Setor ZT-04 (Leste - Setor Cultural)
    {
      id: 11,
      name: 'Parque Ecológico',
      type: 'ambiente',
      x: 600, 
      y: 350, 
      info: 'Qualidade do Ar: 60% | Temperatura: 24°C | Ocupação: 35%',
      level: 2,
      description: 'Pulmão verde da cidade com trilhas ecológicas e jardins.',
      image: '🌳',
      upgrades: [
        { name: 'Expansão Verde', cost: 220, impact: '+13 Meio Ambiente', description: 'Ampliação da área verde com novas espécies nativas.', requiredLevel: 1 },
        { name: 'Sistema de Irrigação', cost: 380, impact: '+20 Meio Ambiente', description: 'Irrigação inteligente para conservação da vegetação.', requiredLevel: 2 }
      ]
    },
    {
      id: 12,
      name: 'Centro Cultural',
      type: 'culture',
      x: 730, 
      y: 400, 
      info: 'Eventos: 25/mês | Visitantes: 1800 | Avaliação: 4.2★',
      level: 1,
      description: 'Espaço para artes, exposições e eventos culturais.',
      image: '🎭',
      upgrades: [
        { name: 'Auditório Moderno', cost: 310, impact: '+15 Cultura', description: 'Espaço para apresentações e palestras.', requiredLevel: 1 },
        { name: 'Acervo Digital', cost: 490, impact: '+22 Cultura', description: 'Digitalização e expansão do acervo cultural.', requiredLevel: 2 }
      ]
    },
    {
      id: 13,
      name: 'Estádio Municipal',
      type: 'sports',
      x: 580, 
      y: 450, 
      info: 'Capacidade: 5.000 | Eventos: 8/mês | Manutenção: 85%',
      level: 1,
      description: 'Arena esportiva para competições e eventos comunitários.',
      image: '⚽',
      upgrades: [
        { name: 'Gramado Sintético', cost: 270, impact: '+12 Esportes', description: 'Instalação de gramado de última geração.', requiredLevel: 1 },
        { name: 'Iluminação LED', cost: 430, impact: '+20 Esportes', description: 'Sistema de iluminação eficiente para eventos noturnos.', requiredLevel: 2 }
      ]
    },
    {
      id: 20,
      name: 'Galeria de Arte Digital',
      type: 'culture',
      x: 730, 
      y: 480, 
      info: 'Exposições: 8/ano | Visitantes Únicos: 1500 | Avaliação: 4.5★',
      level: 1,
      description: 'Espaço dedicado à arte digital e interativa, promovendo novas formas de expressão cultural.',
      image: '🖼️',
      upgrades: [
        { name: 'Tecnologia de Projeção Imersiva', cost: 300, impact: '+10 Cultura', description: 'Aquisição de projetores e sensores para experiências artísticas totalmente imersivas.', requiredLevel: 1 },
        { name: 'Fundo de Apoio a Artistas Locais', cost: 500, impact: '+15 Cultura, +5 Educação', description: 'Programa de bolsas e residências para artistas digitais emergentes da cidade.', requiredLevel: 2 }
      ]
    },
    {
      id: 21,
      name: 'Biblioteca Central',
      type: 'education',
      x: 600, 
      y: 520, 
      info: 'Acervo: 100k volumes | Visitantes: 800/dia | Eventos: 5/mês',
      level: 1,
      description: 'Polo de conhecimento e aprendizado, com vasto acervo e espaços para leitura e estudo.',
      image: '📚',
      upgrades: [
        { name: 'Acervo Digital Expandido', cost: 280, impact: '+10 Educação, +5 Cultura', description: 'Digitalização e expansão do acervo de livros, periódicos e mídias.', requiredLevel: 1 },
        { name: 'Salas Multimídia Interativas', cost: 420, impact: '+15 Educação, +10 Tecnologia', description: 'Criação de espaços com acesso a tecnologias avançadas para aprendizado e colaboração.', requiredLevel: 2 }
      ]
    }
  ];

  investments: Investment[] = [
    { 
      area: 'Energia', 
      cost: 200, 
      impact: '+10 Energia',
      description: 'Instalação de painéis solares avançados e turbinas eólicas para aumentar a produção de energia limpa.',
      image: '⚡',
      imageType: 'emoji'
    },
    { 
      area: 'Transporte', 
      cost: 150, 
      impact: '+15 Transporte',
      description: 'Implementação de ônibus elétricos e sistemas de tráfego inteligente para melhorar a mobilidade urbana.',
      image: '🚌',
      imageType: 'emoji'
    },
    { 
      area: 'Segurança', 
      cost: 180, 
      impact: '+12 Segurança',
      description: 'Instalação de câmeras de vigilância inteligentes e aumento do efetivo policial nas ruas.',
      image: '🚓',
      imageType: 'emoji'
    },
    { 
      area: 'Saúde', 
      cost: 220, 
      impact: '+8 Saúde',
      description: 'Modernização do hospital com novos equipamentos médicos e contratação de especialistas.',
      image: '🏥',
      imageType: 'emoji'
    },
    { 
      area: 'Meio Ambiente', 
      cost: 170, 
      impact: '+13 Meio Ambiente',
      description: 'Expansão das áreas verdes e implantação de sistema de reciclagem mais eficiente.',
      image: '🌳',
      imageType: 'emoji'
    },
    { 
      area: 'Educação', 
      cost: 250, 
      impact: '+10 Educação',
      description: 'Investimento em escolas, universidades e centros de pesquisa para elevar o nível educacional da cidade.',
      image: '🔬', 
      imageType: 'emoji'
    },
    { 
      area: 'Comércio', 
      cost: 200, 
      impact: '+10 Comércio',
      description: 'Apoio a pequenos e grandes negócios, impulsionando o consumo e a geração de empregos na cidade.',
      image: '🛍️', 
      imageType: 'emoji'
    },
    { 
      area: 'Indústria', 
      cost: 300, 
      impact: '+10 Indústria',
      description: 'Fomento à indústria local, atraindo empresas e modernizando parques fabris com tecnologias limpas.',
      image: '🏭', 
      imageType: 'emoji'
    },
    { 
      area: 'Cultura', 
      cost: 180, 
      impact: '+10 Cultura',
      description: 'Investimento em espaços culturais, eventos e programas de valorização artística para enriquecer a vida na cidade.',
      image: '🎨', 
      imageType: 'emoji'
    },
    { 
      area: 'Esportes', 
      cost: 170, 
      impact: '+10 Esportes',
      description: 'Modernização de instalações esportivas e promoção de atividades físicas para a saúde e bem-estar da população.',
      image: '🏅', 
      imageType: 'emoji'
    }
  ];

  constructor(
    private authService: AuthService,
    private gameService: GameService,
    private router: Router,
    private cdRef: ChangeDetectorRef, // Injete o ChangeDetectorRef aqui
    private stockMarketService: StockMarketService // Injete o StockMarketService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.userEmail = this.authService.getUserEmail();
    this.loadGameData(); // Carrega todos os dados do jogo salvos
    this.initializeCookieSources(); // Carrega cooldowns das fontes de cookies

    // Assina o Observable de cookies do StockMarketService para reatividade
    this.subscriptions.add(
      this.stockMarketService.getCookies().subscribe(updatedCookies => {
        if (this.cookies !== updatedCookies) {
          console.log(`GameComponent: Cookies atualizados de ${this.cookies} para ${updatedCookies} (via StockMarketService).`);
          this.cookies = updatedCookies;
          this.cdRef.detectChanges(); // Força a atualização da UI
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Cancela todas as assinaturas
    this.stockMarketService.ngOnDestroy(); // Chama ngOnDestroy do StockMarketService para parar o timer de preço
  }

  // NOVO MÉTODO: Carrega todos os dados do jogo salvos no localStorage
  private loadGameData(): void {
    console.log('loadGameData(): Tentando carregar dados do localStorage...');
    const savedCookies = localStorage.getItem('cookies');
    if (savedCookies !== null) {
      this.cookies = parseInt(savedCookies, 10);
      console.log('loadGameData(): Cookies carregados do localStorage:', this.cookies);
    } else {
      console.log('loadGameData(): Nenhum cookie encontrado no localStorage. Usando valor padrão:', this.cookies);
      this.cookies = 1000; // Valor padrão se não houver cookies salvos
    }
    this.stockMarketService.setPlayerCookies(this.cookies); // Define os cookies no serviço da bolsa

    const savedIndicators = localStorage.getItem('indicators');
    if (savedIndicators) {
      this.indicators = JSON.parse(savedIndicators);
      console.log('loadGameData(): Indicadores carregados do localStorage:', this.indicators);
    } else {
      console.log('loadGameData(): Nenhum indicador encontrado no localStorage. Usando valores padrão.');
    }

    const savedCityPoints = localStorage.getItem('cityPoints');
    if (savedCityPoints) {
      this.cityPoints = JSON.parse(savedCityPoints);
      console.log('loadGameData(): cityPoints carregados do localStorage:', this.cityPoints);
    } else {
      console.log('loadGameData(): Nenhum cityPoint encontrado no localStorage. Usando valores padrão.');
    }
    this.cdRef.detectChanges(); // Força detecção de mudanças para refletir os dados carregados
  }

  // Métodos para salvar partes específicas do jogo no localStorage
  // NOTA: StockMarketService agora é a fonte de verdade para cookies.
  // GameComponent não deve chamar saveCookies() diretamente, mas sim StockMarketService.
  private saveCookies(): void {
    console.log('saveCookies(): Chamado, mas o StockMarketService agora gerencia a persistência dos cookies.');
    // Para depuração, o StockMarketService deve chamar este método.
  }

  private saveIndicators(): void {
    console.log('saveIndicators(): Salvando indicadores no localStorage:', this.indicators);
    localStorage.setItem('indicators', JSON.stringify(this.indicators));
  }

  private saveCityPoints(): void {
    console.log('saveCityPoints(): Salvando cityPoints no localStorage:', this.cityPoints);
    localStorage.setItem('cityPoints', JSON.stringify(this.cityPoints));
  }

  private initializeCookieSources(): void {
    const savedSources = localStorage.getItem('cookieSources');
    if (savedSources) {
      this.cookieSources = JSON.parse(savedSources);
      console.log('initializeCookieSources(): Fontes de cookies carregadas do localStorage.');
    } else {
      console.log('initializeCookieSources(): Nenhuma fonte de cookie encontrada no localStorage. Usando valores padrão.');
    }
  }

  private saveCookieSources(): void {
    localStorage.setItem('cookieSources', JSON.stringify(this.cookieSources));
    console.log('saveCookieSources(): Fontes de cookies salvas no localStorage.');
  }

  // Navegação entre vistas
  selectPoint(point: CityPoint): void {
    this.selectedPoint = point;
    this.currentView = 'location';
    this.cdRef.detectChanges(); 
  }

  // NOVO: Navega para a Bolsa de Valores
  openStockMarket(): void {
    this.currentView = 'stock-market';
    // O StockMarketService já é o "dono" dos cookies, não precisamos setar aqui.
    // Ele já notificará o componente GameComponent do valor mais recente.
    this.cdRef.detectChanges();
  }


  // Sistema de Coleta de Cookies
  collectCookies(source: CookieSource, index: number): void {
    const now = Date.now();
    const lastCollected = source.lastCollected || 0;
    const timeSinceLastCollection = now - lastCollected;

    if (timeSinceLastCollection >= source.cooldown) {
      console.log('collectCookies(): Cookies antes da coleta:', this.cookies);
      // Agora, adicione cookies através do StockMarketService
      this.stockMarketService.addCookies(source.cookies);
      console.log('collectCookies(): Cookies após a coleta (via StockMarketService):', this.cookies);
      this.cookieSources[index].lastCollected = now;
      this.saveCookieSources();
      // O saveCookies() será chamado pelo StockMarketService
      this.showCookieCollectionEffect(source.cookies);
      this.cdRef.detectChanges(); 
    } else {
      const remainingTime = source.cooldown - timeSinceLastCollection;
      const seconds = Math.ceil(remainingTime / 1000);
      alert(`⏰ ${source.name} estará disponível em ${seconds} segundos!`);
    }
  }

  private showCookieCollectionEffect(amount: number): void {
    console.log(`🎉 +${amount} Cookies coletados!`);
  }

  getCooldownProgress(source: CookieSource): number {
    if (!source.lastCollected) return 100;
    const now = Date.now();
    const timeSinceLastCollection = now - source.lastCollected;
    const progress = (timeSinceLastCollection / source.cooldown) * 100;
    return Math.min(100, progress);
  }

  getRemainingTime(source: CookieSource): string {
    if (!source.lastCollected) return 'Pronto!';
    const now = Date.now();
    const timeSinceLastCollection = now - source.lastCollected;
    const remainingTime = source.cooldown - timeSinceLastCollection;
    if (remainingTime <= 0) return 'Pronto!';
    const seconds = Math.ceil(remainingTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
    return `${remainingSeconds}s`;
  }

  // Sistema de Investimentos
  openInvestmentPopup(investment: Investment): void {
    this.selectedInvestment = investment;
    this.showInvestmentPopup = true;
    this.cdRef.detectChanges(); 
  }

  closeInvestmentPopup(): void {
    this.showInvestmentPopup = false;
    this.selectedInvestment = null;
    this.cdRef.detectChanges(); 
  }

  confirmInvestment(): void {
    if (this.selectedInvestment && this.cookies >= this.selectedInvestment.cost) {
      console.log('confirmInvestment(): Tentando investir. Cookies atuais:', this.cookies, 'Custo:', this.selectedInvestment.cost);
      this.invest(this.selectedInvestment.area, this.selectedInvestment.cost);
      this.closeInvestmentPopup();
      this.cdRef.detectChanges(); 
    } else if (this.selectedInvestment) {
      alert(`🍪 Você não tem cookies suficientes para investir em ${this.selectedInvestment.area}!`);
      console.log('confirmInvestment(): Cookies insuficientes. Atuais:', this.cookies, 'Custo:', this.selectedInvestment.cost);
    }
  }

  investInLocation(upgrade: Upgrade): void {
    if (this.selectedPoint) {
      // Tenta remover cookies através do StockMarketService
      const success = this.stockMarketService.removeCookies(upgrade.cost);
      if (success) {
        console.log('investInLocation(): Cookies antes do upgrade:', this.cookies + upgrade.cost, 'Custo:', upgrade.cost);
        this.selectedPoint.level++;
        
        const impactValue = parseInt(upgrade.impact.replace('+', '').replace(' Todos', ''));
        
        switch(this.selectedPoint.type) {
          case 'saúde':
            this.indicators.saúde = Math.min(100, this.indicators.saúde + impactValue);
            break;
          case 'Segurança':
            this.indicators.Segurança = Math.min(100, this.indicators.Segurança + impactValue);
            break;
          case 'Energia':
            this.indicators.Energia = Math.min(100, this.indicators.Energia + impactValue);
            break;
          case 'Transporte':
            this.indicators.Transporte = Math.min(100, this.indicators.Transporte + impactValue);
            break;
          case 'ambiente':
            this.indicators.ambiente = Math.min(100, this.indicators.ambiente + impactValue);
            break;
          case 'government':
            Object.keys(this.indicators).forEach(key => {
              this.indicators[key as keyof typeof this.indicators] = 
                Math.min(100, this.indicators[key as keyof typeof this.indicators] + impactValue);
            });
            break;
          case 'education':
            this.indicators.education = Math.min(100, this.indicators.education + impactValue);
            this.indicators.commerce = Math.min(100, this.indicators.commerce + Math.round(impactValue / 3));
            break;
          case 'commerce':
            this.indicators.commerce = Math.min(100, this.indicators.commerce + impactValue);
            this.indicators.education = Math.min(100, this.indicators.education + Math.round(impactValue / 3));
            break;
          case 'industry':
            this.indicators.industry = Math.min(100, this.indicators.industry + impactValue);
            this.indicators.ambiente = Math.min(100, this.indicators.ambiente - Math.round(impactValue / 5)); 
            break;
          case 'culture':
            this.indicators.culture = Math.min(100, this.indicators.culture + impactValue);
            this.indicators.saúde = Math.min(100, this.indicators.saúde + Math.round(impactValue / 4));
            break;
          case 'sports':
            this.indicators.sports = Math.min(100, this.indicators.sports + impactValue);
            this.indicators.saúde = Math.min(100, this.indicators.saúde + Math.round(impactValue / 3));
            break;
        }
        
        this.selectedPoint.info = this.generateUpdatedInfo(this.selectedPoint);
        console.log('investInLocation(): Cookies após o upgrade:', this.cookies);
        // saveCookies() é chamado pelo StockMarketService
        this.saveIndicators();    // Salva indicadores
        this.saveCityPoints();    // Salva cityPoints
        this.cdRef.detectChanges(); // Força detecção de mudanças
      } else {
        alert(`🍪 Você não tem cookies suficientes para este upgrade em ${this.selectedPoint.name}!`);
        console.log('investInLocation(): Cookies insuficientes para upgrade. Atuais:', this.cookies, 'Custo:', upgrade.cost);
      }
    }
  }

  invest(area: string, cost: number): void {
    // Tenta remover cookies através do StockMarketService
    const success = this.stockMarketService.removeCookies(cost);
    if (success) {
      console.log('invest(): Cookies antes do investimento geral:', this.cookies + cost, 'Custo:', cost);
      switch(area) {
        case 'Energia': this.indicators.Energia = Math.min(100, this.indicators.Energia + 10); break;
        case 'Transporte': this.indicators.Transporte = Math.min(100, this.indicators.Transporte + 15); break;
        case 'Segurança': this.indicators.Segurança = Math.min(100, this.indicators.Segurança + 12); break;
        case 'Saúde': this.indicators.saúde = Math.min(100, this.indicators.saúde + 8); break;
        case 'Meio Ambiente': this.indicators.ambiente = Math.min(100, this.indicators.ambiente + 13); break;
        case 'Educação': this.indicators.education = Math.min(100, this.indicators.education + 10); break;
        case 'Comércio': this.indicators.commerce = Math.min(100, this.indicators.commerce + 10); break;
        case 'Indústria': this.indicators.industry = Math.min(100, this.indicators.industry + 10); break;
        case 'Cultura': this.indicators.culture = Math.min(100, this.indicators.culture + 10); break;
        case 'Esportes': this.indicators.sports = Math.min(100, this.indicators.sports + 10); break;
      }
      this.updateCityPointsInfo(area);
      console.log('invest(): Cookies após investimento geral:', this.cookies);
      // saveCookies() é chamado pelo StockMarketService
      this.saveIndicators();    // Salva indicadores
      this.saveCityPoints();    // Salva cityPoints
      this.cdRef.detectChanges(); // Força detecção de mudanças
    } else {
      alert(`🍪 Você não tem cookies suficientes para investir em ${area}!`);
      console.log('invest(): Cookies insuficientes para investimento geral. Atuais:', this.cookies, 'Custo:', cost);
    }
  }

  private updateCityPointsInfo(area: string): void {
    this.cityPoints.forEach(point => {
      switch(area) {
        case 'Energia': if (point.type === 'Energia') { point.level++; point.info = this.generateUpdatedInfo(point); } break;
        case 'Transporte': if (point.type === 'Transporte') { point.level++; point.info = this.generateUpdatedInfo(point); } break;
        case 'Segurança': if (point.type === 'Segurança') { point.level++; point.info = this.generateUpdatedInfo(point); } break;
        case 'Saúde': if (point.type === 'saúde') { point.level++; point.info = this.generateUpdatedInfo(point); } break;
        case 'Meio Ambiente': if (point.type === 'ambiente') { point.level++; point.info = this.generateUpdatedInfo(point); } break;
        case 'Educação': if (point.type === 'education') { point.level++; point.info = this.generateUpdatedInfo(point); } break;
        case 'Comércio': if (point.type === 'commerce') { point.level++; point.info = this.generateUpdatedInfo(point); } break;
        case 'Indústria': if (point.type === 'industry') { point.level++; point.info = this.generateUpdatedInfo(point); } break;
        case 'Cultura': if (point.type === 'culture') { point.level++; point.info = this.generateUpdatedInfo(point); } break;
        case 'Esportes': if (point.type === 'sports') { point.level++; point.info = this.generateUpdatedInfo(point); } break;
      }
    });
  }

  private generateUpdatedInfo(point: CityPoint): string {
    const improvements: { [key in CityPoint['type']]: string[] } = {
      saúde: ['Atendimentos: 85/dia | Capacidade: 90%', 'Alertas: 2'],
      Segurança: ['Ocorrências: 12/dia | Segurança: 70%', 'Patrulhas: 8'],
      Transporte: ['Fluxo: 450/dia | Tráfego: 45%', 'Pontualidade: 82%'],
      Energia: ['Produção: 95MW | Autonomia: 75%', 'Eficiência: 85%'],
      ambiente: ['Resíduos: 12t/dia | Reciclagem: 60%', 'Lotação: 70%'],
      government: ['Projetos: 8 | Investimentos: 2.5M', 'Satisfação: 68%'],
      education: ['Alunos: 320 | Qualificação: 75%', 'Empregabilidade: 68%'],
      commerce: ['Lojas: 45 | Movimento: 1200/dia', 'Satisfação: 72%'],
      industry: ['Empresas: 18 | Empregos: 850', 'Produção: 92%', 'Nível Poluição: 5%'],
      culture: ['Eventos: 25/mês | Visitantes: 1800', 'Avaliação: 4.2★'],
      sports: ['Capacidade: 5.000 | Eventos: 8/mês', 'Manutenção: 85%']
    };
  
    const baseInfo = improvements[point.type] || [];
    
    return baseInfo.map(info => {
      // Usar uma regex para substituir apenas números, sem dupla-escape
      return info.replace(/(\\d+)/g, (match) => { 
          // O aumento deve ser mais significativo para níveis maiores
          return (parseInt(match) + (point.level - 1) * 5).toString(); 
        });
    }).join(' | ');
  }

  getIndicatorColor(value: number): string {
    if (value >= 80) return '#28a745';
    if (value >= 60) return '#ffc107';
    if (value >= 40) return '#fd7e14';
    return '#dc3545';
  }

  getPointIcon(type: string): string {
    const icons: { [key: string]: string } = {
      saúde: '🏥', Segurança: '🚓', Transporte: '🚌', 
      Energia: '⚡', ambiente: '🌳', government: '🏛️',
      education: '🏫', commerce: '🏬', industry: '🏭',
      culture: '🎭', sports: '⚽'
    };
    return icons[type] || '📍';
  }

  saveGame(): void {
    const gameData = {
      cookies: this.cookies,
      indicators: this.indicators,
      cityPoints: this.cityPoints,
      selectedPoint: this.selectedPoint,
      currentView: this.currentView
    };
    this.gameService.saveGame('AutoSave', gameData).subscribe({
      next: (save) => {
        console.log('Jogo salvo no backend (simulado):', save);
        // Persistir todos os dados do jogo no localStorage após salvar no "backend"
        // As chamadas para saveCookies() já estão no StockMarketService
        this.saveIndicators();
        this.saveCityPoints();
      },
      error: (error) => {
        console.error('Erro ao salvar no backend (simulado):', error);
      }
    });
  }

  updateCookies(): void {
    // Este método é mais para simular um backend. A lógica de saveCookies() já cuida da persistência.
    this.gameService.updateCookies(this.cookies).subscribe({
      next: (updatedCookies) => {
        console.log('Cookies atualizados via "backend" (simulado):', updatedCookies);
        // Os cookies já são salvos no localStorage no final de cada operação (collect, invest).
      },
      error: (error) => {
        console.error('Erro ao atualizar cookies via "backend" (simulado):', error);
      }
    });
  }

  isImageUrl(url: string): boolean {
    return url.startsWith('http') || (url.startsWith('assets/') && !url.includes('emoji'));
  }

  handleImageError(event: any, investment: Investment): void {
    console.error(`Erro ao carregar imagem: ${investment.image}`);
    const emojiMap: { [key: string]: string } = {
      'Energia': '⚡',
      'Transporte': '🚌',
      'Segurança': '🚓',
      'Saúde': '🏥',
      'Meio Ambiente': '🌳',
      'Educação': '🔬',
      'Comércio': '🛍️',
      'Indústria': '🏭',
      'Cultura': '🎨',
      'Esportes': '🏅'
    };
    
    event.target.style.display = 'none';
    const fallbackElement = document.createElement('span');
    fallbackElement.className = 'investment-icon-large';
    fallbackElement.textContent = emojiMap[investment.area] || '💼';
    event.target.parentElement.appendChild(fallbackElement);
  }

  logout(): void {
    // Limpa apenas os dados de autenticação ao deslogar
    this.authService.logout();
    // NÃO limpa os dados do jogo, eles devem persistir para o próximo login (se for o mesmo usuário ou "convidado")
    this.router.navigate(['/login']);
  }
}