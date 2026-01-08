import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lease-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lease-calculator.component.html',
  styleUrls: ['./lease-calculator.component.css']
})
export class LeaseCalculatorComponent {
  // Input values
  capital: number = 0;
  interestRate: number = 0;
  numberOfPeriods: number = 0;
  upfronts: number = 0;

  // Calculated result
  installmentValue: number = 0;
  totalAmount: number = 0;
  totalInterest: number = 0;

  // Validation flags
  isValid: boolean = true;
  errorMessage: string = '';

  /**
   * Calculate the installment value using the formula:
   * installmentValue = capital / ((1 - (1 + interestRate)^(-numberOfPeriods)) / interestRate)
   * Which simplifies to:
   * installmentValue = capital * interestRate / (1 - (1 + interestRate)^(-numberOfPeriods))
   * Where:
   * capital = Capital - Upfronts (net principal)
   * interestRate = Interest rate per period (as decimal, e.g., 0.05 for 5%)
   * numberOfPeriods = Number of periods
   */
  calculateInstallment(): void {
    // Reset validation
    this.isValid = true;
    this.errorMessage = '';

    // Validate inputs
    if (this.capital <= 0) {
      this.isValid = false;
      this.errorMessage = 'Capital must be greater than 0';
      return;
    }

    if (this.interestRate <= 0) {
      this.isValid = false;
      this.errorMessage = 'Interest rate must be greater than 0';
      return;
    }

    if (this.numberOfPeriods <= 0 || !Number.isInteger(this.numberOfPeriods)) {
      this.isValid = false;
      this.errorMessage = 'Number of periods must be a positive integer';
      return;
    }

    if (this.upfronts < 0) {
      this.isValid = false;
      this.errorMessage = 'Upfronts cannot be negative';
      return;
    }

    if (this.upfronts >= this.capital) {
      this.isValid = false;
      this.errorMessage = 'Upfronts cannot be greater than or equal to capital';
      return;
    }

    // Calculate net principal (capital after upfronts)
    const netPrincipal = this.capital - this.upfronts;

    // Convert interest rate from percentage to decimal
    const periodicRate = this.interestRate / 100;

    // Calculate installment using the formula:
    // installmentValue = capital * interestRate / (1 - (1 + interestRate)^(-numberOfPeriods))
    const denominator = 1 - Math.pow(1 + periodicRate, -this.numberOfPeriods);
    this.installmentValue = (netPrincipal * periodicRate) / denominator;

    // Calculate total amount and interest
    this.totalAmount = this.installmentValue * this.numberOfPeriods;
    this.totalInterest = this.totalAmount - netPrincipal;

    // Round to 2 decimal places
    this.installmentValue = Math.round(this.installmentValue * 100) / 100;
    this.totalAmount = Math.round(this.totalAmount * 100) / 100;
    this.totalInterest = Math.round(this.totalInterest * 100) / 100;
  }

  /**
   * Reset all values to default
   */
  reset(): void {
    this.capital = 0;
    this.interestRate = 0;
    this.numberOfPeriods = 0;
    this.upfronts = 0;
    this.installmentValue = 0;
    this.totalAmount = 0;
    this.totalInterest = 0;
    this.isValid = true;
    this.errorMessage = '';
  }
}

