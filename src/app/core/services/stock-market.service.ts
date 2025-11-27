import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, timer, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface StockAsset {
  id: string;
  name: string;
  type: 'resource' | 'industry' | 'service' | 'event';
  description: string;
  price: number; // Preço atual
  change: number; // Variação do último período (ex: 24h)
  history: { date: number, price: number }[]; // Histórico de preços
  emoji: string;
}

export interface PlayerPortfolio {
  [assetId: string]: {
    quantity: number;
    averagePrice: number; // Preço médio de compra
  };
}

@Injectable({
  providedIn: 'root'
})
export class StockMarketService implements OnDestroy {
  private assets: StockAsset[] = [];
  private portfolio: PlayerPortfolio = {};
  
  private cookiesSubject = new BehaviorSubject<number>(0); 
  private assetsSubject = new BehaviorSubject<StockAsset[]>([]);
  private portfolioSubject = new BehaviorSubject<PlayerPortfolio>({});

  private stopUpdates = new Subject<void>(); // Para parar as atualizações de preço

  constructor() {
    this.loadCookies(); // Carrega os cookies logo na inicialização do serviço
    this.initializeAssets();
    this.loadPortfolio();
    this.startPriceFluctuation();
  }

  // --- Métodos de Cookies (Carregar/Salvar/Interagir) ---
  private loadCookies(): void {
    const savedCookies = localStorage.getItem('cookies');
    if (savedCookies !== null) {
      this.cookiesSubject.next(parseInt(savedCookies, 10));
      console.log('StockMarketService: Cookies carregados do localStorage:', this.cookiesSubject.value);
    } else {
      this.cookiesSubject.next(1000); // Valor padrão se não houver cookies salvos
      console.log('StockMarketService: Nenhum cookie encontrado. Definindo padrão:', this.cookiesSubject.value);
      this.saveCookies(); // Salva o valor padrão
    }
  }

  private saveCookies(): void {
    localStorage.setItem('cookies', this.cookiesSubject.value.toString());
    console.log('StockMarketService: Cookies salvos no localStorage:', this.cookiesSubject.value);
  }

  // Método para adicionar cookies
  addCookies(amount: number): void {
    this.cookiesSubject.next(this.cookiesSubject.value + amount);
    this.saveCookies();
  }

  // Método para remover cookies
  removeCookies(amount: number): boolean {
    if (this.cookiesSubject.value < amount) {
      return false; // Saldo insuficiente
    }
    this.cookiesSubject.next(this.cookiesSubject.value - amount);
    this.saveCookies();
    return true;
  }

  // --- Métodos de Inicialização e Carregamento de Ativos/Portfólio ---
  private initializeAssets(): void {
    this.assets = [
      { id: 'farinha', name: 'Farinha Encantada', type: 'resource', description: 'Base para todos os biscoitos.', price: 10, change: 0, history: [], emoji: '🌾' },
      { id: 'leite', name: 'Leite Mágico', type: 'resource', description: 'Ingrediente vital e raro.', price: 25, change: 0, history: [], emoji: '🥛' },
      { id: 'acucar', name: 'Açúcar de Cristais', type: 'resource', description: 'Doçura essencial.', price: 15, change: 0, history: [], emoji: '💎' },
      { id: 'confeitaria', name: 'Confeitaria Real', type: 'industry', description: 'Império dos doces.', price: 50, change: 0, history: [], emoji: '🍰' },
      { id: 'pesquisa', name: 'Centro de Pesquisa', type: 'service', description: 'Inovação para Gridline.', price: 75, change: 0, history: [], emoji: '🔬' },
      { id: 'eventos', name: 'Eventos da Cidade', type: 'event', description: 'Alegria e lucratividade.', price: 40, change: 0, history: [], emoji: '🎉' },
      { id: 'madeira', name: 'Madeira Mística', type: 'resource', description: 'Recurso de construção essencial.', price: 20, change: 0, history: [], emoji: '🌳' },
      { id: 'ferro', name: 'Minério de Ferro Raro', type: 'resource', description: 'Base para ferramentas e máquinas.', price: 35, change: 0, history: [], emoji: '⛏️' },
      { id: 'energia_eolica', name: 'Torres Eólicas', type: 'industry', description: 'Geração de energia limpa para a cidade.', price: 60, change: 0, history: [], emoji: '⚡' },
      { id: 'saude_publica', name: 'Clínicas Comunitárias', type: 'service', description: 'Saúde e bem-estar para todos os cidadãos.', price: 45, change: 0, history: [], emoji: '🏥' },
      { id: 'turismo', name: 'Atrações Turísticas', type: 'event', description: 'Aumenta a felicidade e a renda da cidade.', price: 70, change: 0, history: [], emoji: '🎡' },
      { id: 'universidade', name: 'Universidade de Gridline', type: 'service', description: 'Formação de novos talentos e pesquisa avançada.', price: 85, change: 0, history: [], emoji: '🎓' },
    ];
    this.assets.forEach(asset => asset.history.push({ date: Date.now(), price: asset.price }));
    this.assetsSubject.next(this.assets);
  }

  private loadPortfolio(): void {
    const savedPortfolio = localStorage.getItem('playerPortfolio');
    if (savedPortfolio) {
      this.portfolio = JSON.parse(savedPortfolio);
    }
    this.portfolioSubject.next(this.portfolio);
  }

  private savePortfolio(): void {
    localStorage.setItem('playerPortfolio', JSON.stringify(this.portfolio));
  }

  // --- Lógica de Flutuação de Preços ---
  private startPriceFluctuation(): void {
    timer(0, 10000).pipe(takeUntil(this.stopUpdates)).subscribe(() => {
      this.assets.forEach(asset => {
        const oldPrice = asset.price;
        let newPrice = asset.price + (Math.random() - 0.5) * (asset.price * 0.1); 
        newPrice = Math.max(1, parseFloat(newPrice.toFixed(2))); 
        
        asset.change = newPrice - oldPrice;
        asset.price = newPrice;
        asset.history.push({ date: Date.now(), price: newPrice });
        
        if (asset.history.length > 50) {
          asset.history.shift();
        }
      });
      this.assetsSubject.next(this.assets); 
    });
  }

  // --- Getters para observar o estado ---
  getAssets(): Observable<StockAsset[]> {
    return this.assetsSubject.asObservable();
  }

  getPortfolio(): Observable<PlayerPortfolio> {
    return this.portfolioSubject.asObservable();
  }

  getCookies(): Observable<number> {
    return this.cookiesSubject.asObservable();
  }

  // --- Setter para o estado de cookies (usado pelo GameComponent para iniciar o valor) ---
  // Este método não salva cookies, apenas define o valor inicial e notifica
  setPlayerCookies(cookies: number): void {
    this.cookiesSubject.next(cookies);
    // saveCookies() não é chamado aqui pois o loadCookies() já cuida da persistência
  }

  // --- Métodos de Transação (usam cookiesSubject) ---
  buyAsset(assetId: string, quantity: number): boolean {
    const asset = this.assets.find(a => a.id === assetId);
    if (!asset || quantity <= 0) return false;

    const cost = asset.price * quantity;
    if (this.cookiesSubject.value < cost) {
      return false; // Saldo insuficiente
    }

    this.cookiesSubject.next(this.cookiesSubject.value - cost);
    this.saveCookies(); // Salva cookies após a compra
    
    if (!this.portfolio[assetId]) {
      this.portfolio[assetId] = { quantity: 0, averagePrice: 0 };
    }
    
    const totalValueBefore = this.portfolio[assetId].quantity * this.portfolio[assetId].averagePrice;
    const totalQuantityAfter = this.portfolio[assetId].quantity + quantity;
    this.portfolio[assetId].averagePrice = parseFloat(((totalValueBefore + cost) / totalQuantityAfter).toFixed(2));
    this.portfolio[assetId].quantity = totalQuantityAfter;

    this.savePortfolio();
    this.portfolioSubject.next(this.portfolio);
    return true;
  }

  sellAsset(assetId: string, quantity: number): boolean {
    const asset = this.assets.find(a => a.id === assetId);
    const portfolioAsset = this.portfolio[assetId];

    if (!asset || !portfolioAsset || quantity <= 0 || portfolioAsset.quantity < quantity) {
      return false; // Ativo não encontrado ou quantidade insuficiente
    }

    const revenue = asset.price * quantity;
    this.cookiesSubject.next(this.cookiesSubject.value + revenue);
    this.saveCookies(); // Salva cookies após a venda
    
    portfolioAsset.quantity -= quantity;

    if (portfolioAsset.quantity === 0) {
      delete this.portfolio[assetId]; // Remove do portfólio se a quantidade for zero
    }

    this.savePortfolio();
    this.portfolioSubject.next(this.portfolio);
    return true;
  }

  // --- Gerenciamento de Vida do Serviço ---
  ngOnDestroy(): void {
    this.stopUpdates.next();
    this.stopUpdates.complete();
  }
}