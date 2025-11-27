import { Component, OnInit, OnDestroy, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importe FormsModule para ngModel
import { StockMarketService, StockAsset, PlayerPortfolio } from '../../core/services/stock-market.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-stock-market',
  standalone: true,
  imports: [CommonModule, FormsModule], // Adicione FormsModule aqui
  templateUrl: './stock-market.component.html',
  styleUrls: ['./stock-market.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // Otimiza a detecção de mudanças
})
export class StockMarketComponent implements OnInit, OnDestroy {
  @Output() backToMap = new EventEmitter<void>();

  assets: StockAsset[] = [];
  portfolio: PlayerPortfolio = {};
  cookies: number = 0;
  selectedAsset: StockAsset | null = null;
  quantity: number = 1;
  actionType: 'buy' | 'sell' | null = null;
  
  private subscriptions = new Subscription();

  constructor(
    private stockMarketService: StockMarketService,
    private cdRef: ChangeDetectorRef // Injete ChangeDetectorRef aqui
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.stockMarketService.getAssets().subscribe(assets => {
        this.assets = assets;
        this.cdRef.detectChanges(); // Força a detecção de mudanças
      })
    );

    this.subscriptions.add(
      this.stockMarketService.getPortfolio().subscribe(portfolio => {
        this.portfolio = portfolio;
        this.cdRef.detectChanges(); // Força a detecção de mudanças
      })
    );

    this.subscriptions.add(
      this.stockMarketService.getCookies().subscribe(cookies => {
        this.cookies = cookies;
        this.cdRef.detectChanges(); // Força a detecção de mudanças
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  selectAsset(asset: StockAsset): void {
    this.selectedAsset = asset;
    this.quantity = 1;
    this.actionType = null; // Reseta a ação selecionada
    this.cdRef.detectChanges();
  }

  selectAction(type: 'buy' | 'sell'): void {
    this.actionType = type;
    this.cdRef.detectChanges();
  }

  buy(): void {
    if (this.selectedAsset && this.quantity > 0) {
      const success = this.stockMarketService.buyAsset(this.selectedAsset.id, this.quantity);
      if (success) {
        alert(`📈 Você comprou ${this.quantity} ações de ${this.selectedAsset.name}!`);
        this.selectedAsset = null;
        this.actionType = null;
      } else {
        alert('💰 Saldo insuficiente para realizar a compra!');
      }
      this.cdRef.detectChanges();
    }
  }

  sell(): void {
    if (this.selectedAsset && this.quantity > 0) {
      const success = this.stockMarketService.sellAsset(this.selectedAsset.id, this.quantity);
      if (success) {
        alert(`📉 Você vendeu ${this.quantity} ações de ${this.selectedAsset.name}!`);
        this.selectedAsset = null;
        this.actionType = null;
      } else {
        alert('❌ Quantidade de ações insuficiente para realizar a venda!');
      }
      this.cdRef.detectChanges();
    }
  }

  getPortfolioAssetQuantity(assetId: string): number {
    return this.portfolio[assetId]?.quantity || 0;
  }

  // Calcula o valor total do portfólio (valor de mercado atual)
  getTotalPortfolioValue(): number {
    let total = 0;
    for (const assetId in this.portfolio) {
      if (this.portfolio.hasOwnProperty(assetId)) {
        const portfolioItem = this.portfolio[assetId];
        const asset = this.assets.find(a => a.id === assetId);
        if (asset) {
          total += portfolioItem.quantity * asset.price;
        }
      }
    }
    return parseFloat(total.toFixed(2));
  }

  // Calcula o lucro/prejuízo de um ativo específico
  getProfitLoss(assetId: string): number {
    const portfolioItem = this.portfolio[assetId];
    const asset = this.assets.find(a => a.id === assetId);
    if (portfolioItem && asset) {
      return parseFloat(((asset.price - portfolioItem.averagePrice) * portfolioItem.quantity).toFixed(2));
    }
    return 0;
  }
}