import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { GameService } from '../../core/services/game.service';

interface CityPoint {
  id: number;
  name: string;
  type: 'health' | 'security' | 'transport' | 'energy' | 'environment' | 'government' | 'education' | 'commerce' | 'industry' | 'culture' | 'sports';
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
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  userEmail: string | null = null;
  cookies: number = 1000;
  selectedPoint: CityPoint | null = null;
  showInvestmentPopup: boolean = false;
  selectedInvestment: Investment | null = null;
  currentView: 'map' | 'location' = 'map';
  
  // Indicadores da cidade
  indicators = {
    energy: 65,
    transport: 45,
    security: 70,
    environment: 60,
    health: 75
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
      type: 'health',
      x: 150,
      y: 120,
      info: 'Atendimentos: 85/dia | Capacidade: 90% | Alertas: 2',
      level: 2,
      description: 'Centro médico principal da cidade. Oferece atendimento emergencial, consultas especializadas e cirurgias.',
      image: '🏥',
      upgrades: [
        {
          name: 'Novos Equipamentos',
          cost: 300,
          impact: '+15 Saúde',
          description: 'Aquisição de equipamentos médicos modernos para diagnóstico e tratamento.',
          requiredLevel: 1
        },
        {
          name: 'Ampliação do Prédio',
          cost: 500,
          impact: '+25 Saúde',
          description: 'Expansão da estrutura para atender mais pacientes simultaneamente.',
          requiredLevel: 2
        }
      ]
    },
    {
      id: 2,
      name: 'Prefeitura Digital',
      type: 'government',
      x: 300,
      y: 100,
      info: 'Projetos: 8 | Investimentos: 2.5M | Satisfação: 68%',
      level: 3,
      description: 'Centro administrativo e tecnológico da cidade. Gerencia todos os serviços públicos.',
      image: '🏛️',
      upgrades: [
        {
          name: 'Sistema Digital',
          cost: 400,
          impact: '+10 Todos',
          description: 'Plataforma integrada para gestão de todos os serviços.',
          requiredLevel: 1
        },
        {
          name: 'Centro de Dados',
          cost: 650,
          impact: '+15 Todos',
          description: 'Infraestrutura de processamento de dados urbanos.',
          requiredLevel: 2
        }
      ]
    },
    {
      id: 3,
      name: 'Delegacia Central',
      type: 'security',
      x: 450,
      y: 120,
      info: 'Ocorrências: 12/dia | Segurança: 70% | Patrulhas: 8',
      level: 2,
      description: 'Centro de comando da segurança pública. Coordena patrulhas e responde a emergências.',
      image: '🚓',
      upgrades: [
        {
          name: 'Câmeras de Segurança',
          cost: 250,
          impact: '+12 Segurança',
          description: 'Instalação de sistema de vigilância por câmeras inteligentes.',
          requiredLevel: 1
        },
        {
          name: 'Veículos Novos',
          cost: 400,
          impact: '+20 Segurança',
          description: 'Frota de viaturas modernas equipadas com tecnologia.',
          requiredLevel: 2
        }
      ]
    },

    // Setor ZT-02 (Norte - Setor Residencial)
    {
      id: 4,
      name: 'Estação de Ônibus Inteligente',
      type: 'transport',
      x: 200,
      y: 250,
      info: 'Fluxo: 450/dia | Tráfego: 45% | Pontualidade: 82%',
      level: 1,
      description: 'Hub de transporte público equipado com tecnologia inteligente.',
      image: '🚌',
      upgrades: [
        {
          name: 'Ônibus Elétricos',
          cost: 180,
          impact: '+15 Transporte',
          description: 'Substituição da frota por veículos elétricos silenciosos.',
          requiredLevel: 1
        },
        {
          name: 'Sinalização Inteligente',
          cost: 320,
          impact: '+22 Transporte',
          description: 'Sistema de semáforos adaptativos para melhor fluidez.',
          requiredLevel: 2
        }
      ]
    },
    {
      id: 5,
      name: 'Escola Técnica',
      type: 'education',
      x: 350,
      y: 280,
      info: 'Alunos: 320 | Qualificação: 75% | Empregabilidade: 68%',
      level: 2,
      description: 'Centro de formação técnica e profissionalizante para jovens e adultos.',
      image: '🏫',
      upgrades: [
        {
          name: 'Laboratórios Modernos',
          cost: 280,
          impact: '+10 Educação',
          description: 'Equipamentos atualizados para ensino prático.',
          requiredLevel: 1
        },
        {
          name: 'Parcerias Empresariais',
          cost: 450,
          impact: '+18 Educação',
          description: 'Programas de estágio e empregabilidade.',
          requiredLevel: 2
        }
      ]
    },
    {
      id: 6,
      name: 'Shopping Center',
      type: 'commerce',
      x: 500,
      y: 250,
      info: 'Lojas: 45 | Movimento: 1200/dia | Satisfação: 72%',
      level: 2,
      description: 'Centro comercial com lojas, alimentação e entretenimento.',
      image: '🏬',
      upgrades: [
        {
          name: 'Expansão Comercial',
          cost: 320,
          impact: '+15 Comércio',
          description: 'Ampliação com novas lojas e serviços.',
          requiredLevel: 1
        },
        {
          name: 'Estacionamento Inteligente',
          cost: 480,
          impact: '+22 Comércio',
          description: 'Sistema automatizado de vagas e pagamento.',
          requiredLevel: 2
        }
      ]
    },

    // Setor ZT-03 (Sul - Setor Industrial)
    {
      id: 7,
      name: 'Estação de Energia Solar',
      type: 'energy',
      x: 100,
      y: 400,
      info: 'Produção: 85MW | Autonomia: 65% | Eficiência: 78%',
      level: 1,
      description: 'Fonte principal de energia limpa da cidade com painéis solares.',
      image: '⚡',
      upgrades: [
        {
          name: 'Painéis Solares',
          cost: 200,
          impact: '+10 Energia',
          description: 'Instalação de novos painéis solares de alta eficiência.',
          requiredLevel: 1
        },
        {
          name: 'Baterias Avançadas',
          cost: 350,
          impact: '+18 Energia',
          description: 'Sistema de armazenamento energético.',
          requiredLevel: 2
        }
      ]
    },
    {
      id: 8,
      name: 'Centro de Reciclagem',
      type: 'environment',
      x: 250,
      y: 420,
      info: 'Resíduos: 12t/dia | Reciclagem: 60% | Lotação: 70%',
      level: 1,
      description: 'Instalação moderna para processamento de resíduos urbanos.',
      image: '♻️',
      upgrades: [
        {
          name: 'Máquinas Automáticas',
          cost: 240,
          impact: '+14 Meio Ambiente',
          description: 'Equipamentos automatizados para triagem eficiente.',
          requiredLevel: 1
        },
        {
          name: 'Usina de Compostagem',
          cost: 420,
          impact: '+23 Meio Ambiente',
          description: 'Processamento de resíduos orgânicos em adubo.',
          requiredLevel: 2
        }
      ]
    },
    {
      id: 9,
      name: 'Parque Industrial',
      type: 'industry',
      x: 400,
      y: 400,
      info: 'Empresas: 18 | Empregos: 850 | Produção: 92%',
      level: 2,
      description: 'Polo industrial com empresas de tecnologia e manufatura.',
      image: '🏭',
      upgrades: [
        {
          name: 'Infraestrutura Logística',
          cost: 380,
          impact: '+12 Indústria',
          description: 'Melhoria no sistema de transporte de cargas.',
          requiredLevel: 1
        },
        {
          name: 'Incentivos Fiscais',
          cost: 550,
          impact: '+20 Indústria',
          description: 'Programas de apoio ao desenvolvimento industrial.',
          requiredLevel: 2
        }
      ]
    },
    {
      id: 10,
      name: 'Estação de Tratamento',
      type: 'environment',
      x: 550,
      y: 420,
      info: 'Capacidade: 85% | Qualidade: 88% | Eficiência: 75%',
      level: 1,
      description: 'Sistema avançado de tratamento de água e esgoto.',
      image: '💧',
      upgrades: [
        {
          name: 'Filtros Avançados',
          cost: 290,
          impact: '+16 Meio Ambiente',
          description: 'Tecnologia de purificação de última geração.',
          requiredLevel: 1
        },
        {
          name: 'Reuso de Água',
          cost: 460,
          impact: '+24 Meio Ambiente',
          description: 'Sistema para reaproveitamento de água tratada.',
          requiredLevel: 2
        }
      ]
    },

    // Setor ZT-04 (Leste - Setor Cultural)
    {
      id: 11,
      name: 'Parque Ecológico',
      type: 'environment',
      x: 600,
      y: 200,
      info: 'Qualidade do Ar: 60% | Temperatura: 24°C | Ocupação: 35%',
      level: 2,
      description: 'Pulmão verde da cidade com trilhas ecológicas e jardins.',
      image: '🌳',
      upgrades: [
        {
          name: 'Expansão Verde',
          cost: 220,
          impact: '+13 Meio Ambiente',
          description: 'Ampliação da área verde com novas espécies nativas.',
          requiredLevel: 1
        },
        {
          name: 'Sistema de Irrigação',
          cost: 380,
          impact: '+20 Meio Ambiente',
          description: 'Irrigação inteligente para conservação da vegetação.',
          requiredLevel: 2
        }
      ]
    },
    {
      id: 12,
      name: 'Centro Cultural',
      type: 'culture',
      x: 650,
      y: 320,
      info: 'Eventos: 25/mês | Visitantes: 1800 | Avaliação: 4.2★',
      level: 1,
      description: 'Espaço para artes, exposições e eventos culturais.',
      image: '🎭',
      upgrades: [
        {
          name: 'Auditório Moderno',
          cost: 310,
          impact: '+15 Cultura',
          description: 'Espaço para apresentações e palestras.',
          requiredLevel: 1
        },
        {
          name: 'Acervo Digital',
          cost: 490,
          impact: '+22 Cultura',
          description: 'Digitalização e expansão do acervo cultural.',
          requiredLevel: 2
        }
      ]
    },
    {
      id: 13,
      name: 'Estádio Municipal',
      type: 'sports',
      x: 550,
      y: 150,
      info: 'Capacidade: 5.000 | Eventos: 8/mês | Manutenção: 85%',
      level: 1,
      description: 'Arena esportiva para competições e eventos comunitários.',
      image: '⚽',
      upgrades: [
        {
          name: 'Gramado Sintético',
          cost: 270,
          impact: '+12 Esportes',
          description: 'Instalação de gramado de última geração.',
          requiredLevel: 1
        },
        {
          name: 'Iluminação LED',
          cost: 430,
          impact: '+20 Esportes',
          description: 'Sistema de iluminação eficiente para eventos noturnos.',
          requiredLevel: 2
        }
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
    }
  ];

  constructor(
    private authService: AuthService,
    private gameService: GameService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.userEmail = this.authService.getUserEmail();
    this.initializeCookieSources();
  }

  private initializeCookieSources(): void {
    const savedSources = localStorage.getItem('cookieSources');
    if (savedSources) {
      this.cookieSources = JSON.parse(savedSources);
    }
  }

  private saveCookieSources(): void {
    localStorage.setItem('cookieSources', JSON.stringify(this.cookieSources));
  }

  // Navegação entre vistas
  selectPoint(point: CityPoint): void {
    this.selectedPoint = point;
    this.currentView = 'location';
  }

  backToMap(): void {
    this.currentView = 'map';
    this.selectedPoint = null;
  }

  // Sistema de Coleta de Cookies
  collectCookies(source: CookieSource, index: number): void {
    const now = Date.now();
    const lastCollected = source.lastCollected || 0;
    const timeSinceLastCollection = now - lastCollected;

    if (timeSinceLastCollection >= source.cooldown) {
      this.cookies += source.cookies;
      this.cookieSources[index].lastCollected = now;
      this.saveCookieSources();
      this.showCookieCollectionEffect(source.cookies);
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
  }

  closeInvestmentPopup(): void {
    this.showInvestmentPopup = false;
    this.selectedInvestment = null;
  }

  confirmInvestment(): void {
    if (this.selectedInvestment && this.cookies >= this.selectedInvestment.cost) {
      this.invest(this.selectedInvestment.area, this.selectedInvestment.cost);
      this.closeInvestmentPopup();
    }
  }

  investInLocation(upgrade: Upgrade): void {
    if (this.cookies >= upgrade.cost && this.selectedPoint) {
      this.cookies -= upgrade.cost;
      this.selectedPoint.level++;
      
      // Aplica o impacto nos indicadores
      const impactValue = parseInt(upgrade.impact.replace('+', '').replace(' Todos', ''));
      
      switch(this.selectedPoint.type) {
        case 'health':
          this.indicators.health = Math.min(100, this.indicators.health + impactValue);
          break;
        case 'security':
          this.indicators.security = Math.min(100, this.indicators.security + impactValue);
          break;
        case 'energy':
          this.indicators.energy = Math.min(100, this.indicators.energy + impactValue);
          break;
        case 'transport':
          this.indicators.transport = Math.min(100, this.indicators.transport + impactValue);
          break;
        case 'environment':
          this.indicators.environment = Math.min(100, this.indicators.environment + impactValue);
          break;
        case 'government':
          // Melhora todos os indicadores
          Object.keys(this.indicators).forEach(key => {
            this.indicators[key as keyof typeof this.indicators] = 
              Math.min(100, this.indicators[key as keyof typeof this.indicators] + impactValue);
          });
          break;
        case 'education':
          this.indicators.health = Math.min(100, this.indicators.health + 5);
          this.indicators.transport = Math.min(100, this.indicators.transport + impactValue);
          break;
        case 'commerce':
          this.indicators.transport = Math.min(100, this.indicators.transport + impactValue);
          this.indicators.security = Math.min(100, this.indicators.security + 5);
          break;
        case 'industry':
          this.indicators.energy = Math.min(100, this.indicators.energy + impactValue);
          this.indicators.environment = Math.min(100, this.indicators.environment - 3);
          break;
        case 'culture':
          this.indicators.health = Math.min(100, this.indicators.health + impactValue);
          this.indicators.security = Math.min(100, this.indicators.security + 5);
          break;
        case 'sports':
          this.indicators.health = Math.min(100, this.indicators.health + impactValue);
          this.indicators.environment = Math.min(100, this.indicators.environment + 3);
          break;
      }
      
      // Atualiza informações do ponto
      this.selectedPoint.info = this.generateUpdatedInfo(this.selectedPoint);
    }
  }

  invest(area: string, cost: number): void {
    if (this.cookies >= cost) {
      this.cookies -= cost;
      switch(area) {
        case 'Energia': this.indicators.energy = Math.min(100, this.indicators.energy + 10); break;
        case 'Transporte': this.indicators.transport = Math.min(100, this.indicators.transport + 15); break;
        case 'Segurança': this.indicators.security = Math.min(100, this.indicators.security + 12); break;
        case 'Saúde': this.indicators.health = Math.min(100, this.indicators.health + 8); break;
        case 'Meio Ambiente': this.indicators.environment = Math.min(100, this.indicators.environment + 13); break;
      }
      this.updateCityPointsInfo(area);
    }
  }

  private updateCityPointsInfo(area: string): void {
    this.cityPoints.forEach(point => {
      switch(area) {
        case 'Energia': if (point.type === 'energy') { point.level++; point.info = this.generateUpdatedInfo(point); } break;
        case 'Transporte': if (point.type === 'transport') { point.level++; point.info = this.generateUpdatedInfo(point); } break;
        case 'Segurança': if (point.type === 'security') { point.level++; point.info = this.generateUpdatedInfo(point); } break;
        case 'Saúde': if (point.type === 'health') { point.level++; point.info = this.generateUpdatedInfo(point); } break;
        case 'Meio Ambiente': if (point.type === 'environment') { point.level++; point.info = this.generateUpdatedInfo(point); } break;
      }
    });
  }

  private generateUpdatedInfo(point: CityPoint): string {
    const improvements: { [key in CityPoint['type']]: string[] } = {
      health: ['Capacidade: 95%', 'Atendimentos: 92/dia', 'Alertas: 1'],
      security: ['Segurança: 82%', 'Ocorrências: 8/dia', 'Patrulhas: 12'],
      energy: ['Produção: 95MW', 'Autonomia: 75%', 'Eficiência: 85%'],
      transport: ['Tráfego: 60%', 'Fluxo: 520/dia', 'Pontualidade: 90%'],
      environment: ['Qualidade Ar: 70%', 'Reciclagem: 73%', 'Ocupação: 45%'],
      government: ['Projetos: 12', 'Investimentos: 3.2M', 'Satisfação: 75%'],
      education: ['Alunos: 380', 'Qualificação: 85%', 'Empregabilidade: 78%'],
      commerce: ['Lojas: 58', 'Movimento: 1500/dia', 'Satisfação: 82%'],
      industry: ['Empresas: 22', 'Empregos: 950', 'Produção: 96%'],
      culture: ['Eventos: 35/mês', 'Visitantes: 2200', 'Avaliação: 4.5★'],
      sports: ['Capacidade: 6.000', 'Eventos: 12/mês', 'Manutenção: 92%']
    };
    return improvements[point.type].join(' | ');
  }

  getIndicatorColor(value: number): string {
    if (value >= 80) return '#28a745';
    if (value >= 60) return '#ffc107';
    if (value >= 40) return '#fd7e14';
    return '#dc3545';
  }

  getPointIcon(type: string): string {
    const icons: { [key: string]: string } = {
      health: '🏥', security: '🚓', transport: '🚌', 
      energy: '⚡', environment: '🌳', government: '🏛️',
      education: '🏫', commerce: '🏬', industry: '🏭',
      culture: '🎭', sports: '⚽'
    };
    return icons[type] || '📍';
  }

  // Método para salvar o jogo
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
        console.log('Jogo salvo:', save);
      },
      error: (error) => {
        console.error('Erro ao salvar:', error);
      }
    });
  }

  // Método para atualizar cookies no backend
  updateCookies(): void {
    this.gameService.updateCookies(this.cookies).subscribe({
      next: (updatedCookies) => {
        console.log('Cookies atualizados:', updatedCookies);
      },
      error: (error) => {
        console.error('Erro ao atualizar cookies:', error);
      }
    });
  }

  // Métodos para imagens
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
    'Meio Ambiente': '🌳'
  };
  
  event.target.style.display = 'none';
  const fallbackElement = document.createElement('span');
  fallbackElement.className = 'investment-icon-large';
  fallbackElement.textContent = emojiMap[investment.area] || '💼';
  event.target.parentElement.appendChild(fallbackElement);
}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}