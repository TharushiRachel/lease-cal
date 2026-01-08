import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaseCalculatorComponent } from './lease-calculator/lease-calculator.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LeaseCalculatorComponent],
  template: `
    <div class="app-container">
      <header>
        <h1>Lease Calculator</h1>
      </header>
      <main>
        <app-lease-calculator></app-lease-calculator>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    header {
      text-align: center;
      color: white;
      margin-bottom: 30px;
    }
    header h1 {
      font-size: 2.5rem;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
  `]
})
export class AppComponent {
  title = 'Lease Calculator';
}

