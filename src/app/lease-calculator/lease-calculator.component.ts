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

  // RATE calculation inputs
  rateCalculationMode: boolean = false;
  rateInstallment: number = 0;
  calculatedRate: number = 0;
  calculatedAnnualRate: number = 0;

  // Validation flags
  isValid: boolean = true;
  errorMessage: string = '';

  /**
   * Calculate the rental monthly installment using the formula:
   * installmentValue = (capital * (rate/1200)) /
   *   ((upfronts * (rate/1200)) + (1 - (1 + (rate/1200)) ^ (-(period - upfronts))))
   * Where:
   * - rate is annual percentage (e.g., 12 for 12%)
   * - period is number of months
   * - upfronts is number of upfront months
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
      this.errorMessage = 'Number of periods must be a positive integer (months)';
      return;
    }

    if (this.upfronts < 0) {
      this.isValid = false;
      this.errorMessage = 'Upfronts cannot be negative';
      return;
    }

    if (!Number.isInteger(this.upfronts)) {
      this.isValid = false;
      this.errorMessage = 'Upfronts must be a whole number of months';
      return;
    }

    if (this.upfronts >= this.numberOfPeriods) {
      this.isValid = false;
      this.errorMessage = 'Upfronts must be less than the number of periods';
      return;
    }

    // Convert annual interest rate to monthly rate (as decimal)
    const monthlyRate = this.interestRate / 1200;
    const totalMonths = this.numberOfPeriods;
    const remainingMonths = totalMonths - this.upfronts;

    // Calculate installment using the provided formula
    const numerator = this.capital * monthlyRate;
    const denominator =
      (this.upfronts * monthlyRate) +
      (1 - Math.pow(1 + monthlyRate, -remainingMonths));
    this.installmentValue = numerator / denominator;

    // Calculate total amount and interest
    this.totalAmount = this.installmentValue * totalMonths;
    this.totalInterest = this.totalAmount - this.capital;

    // Round to 2 decimal places
    this.installmentValue = Math.round(this.installmentValue * 100) / 100;
    this.totalAmount = Math.round(this.totalAmount * 100) / 100;
    this.totalInterest = Math.round(this.totalInterest * 100) / 100;
  }

  /**
   * Excel RATE function equivalent
   * Calculates the interest rate per period of an annuity
   * 
   * @param nper Number of periods
   * @param pmt Payment per period (negative for outgoing payment)
   * @param pv Present value (positive for loan received)
   * @param fv Future value (optional, default 0)
   * @param type When payments are due: 0 = end of period, 1 = beginning (optional, default 0)
   * @param guess Initial guess for rate (optional, default 0.1)
   * @returns Interest rate per period (as decimal, e.g., 0.01 for 1%)
   */
  rate(nper: number, pmt: number, pv: number, fv: number = 0, type: number = 0, guess: number = 0.1): number {
    // Validate inputs
    if (nper <= 0) {
      throw new Error('Number of periods must be greater than 0');
    }

    // Constants for iteration
    const FINANCIAL_MAX_ITERATIONS = 100;
    const FINANCIAL_PRECISION = 1.0e-8;
    
    let rate = guess;
    let y: number;
    let x0: number = guess;
    let x1: number = 0;
    let i: number = 0;
    let close: boolean = false;

    // Newton-Raphson iteration
    while (i < FINANCIAL_MAX_ITERATIONS && !close) {
      rate = x0;
      
      // Calculate function value
      if (Math.abs(rate) < FINANCIAL_PRECISION) {
        // If rate is close to 0, use simple calculation
        y = pv * (1 + nper * rate) + pmt * (1 + rate * type) * nper + fv;
      } else {
        // Calculate using compound interest formula
        const fvif = Math.pow(1 + rate, nper);
        y = pv * fvif + pmt * (1 / rate + type) * (fvif - 1) + fv;
      }

      // Calculate derivative
      let df: number;
      if (Math.abs(rate) < FINANCIAL_PRECISION) {
        df = pv * nper + pmt * type * nper;
      } else {
        const fvif = Math.pow(1 + rate, nper);
        const term1 = pv * nper * Math.pow(1 + rate, nper - 1);
        const term2 = pmt * (1 / rate + type) * nper * Math.pow(1 + rate, nper - 1);
        const term3 = pmt * (fvif - 1) / (rate * rate);
        df = term1 + term2 - term3;
      }

      // Check if derivative is too small
      if (Math.abs(df) < FINANCIAL_PRECISION) {
        throw new Error('Cannot calculate rate: derivative is zero');
      }

      // Newton-Raphson step
      x1 = x0 - y / df;

      // Check for convergence
      close = Math.abs(x1 - x0) < FINANCIAL_PRECISION;
      
      // Prevent infinite loops by checking for NaN or Infinity
      if (!isFinite(x1)) {
        throw new Error('Rate calculation resulted in invalid value');
      }

      x0 = x1;
      i++;
    }

    if (!close) {
      throw new Error('Rate calculation did not converge after ' + FINANCIAL_MAX_ITERATIONS + ' iterations');
    }

    return x1;
  }

  /**
   * Calculate reducing rate using RATE function
   * Given: effective rate, number of periods, upfront months, and capital
   */
  calculateRate(): void {
    // Reset validation
    this.isValid = true;
    this.errorMessage = '';
    this.calculatedRate = 0;
    this.calculatedAnnualRate = 0;

    // Validate inputs
    if (this.capital <= 0) {
      this.isValid = false;
      this.errorMessage = 'Capital must be greater than 0';
      return;
    }

    if (this.interestRate <= 0) {
      this.isValid = false;
      this.errorMessage = 'Effective rate must be greater than 0';
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

    if (!Number.isInteger(this.upfronts)) {
      this.isValid = false;
      this.errorMessage = 'Upfronts must be a whole number of months';
      return;
    }

    if (this.upfronts >= this.numberOfPeriods) {
      this.isValid = false;
      this.errorMessage = 'Upfronts must be less than the number of periods';
      return;
    }

    try {
      // Derive the monthly installment from effective rate
      const monthlyEffectiveRate = this.interestRate / 1200;
      const remainingMonths = this.numberOfPeriods - this.upfronts;
      const effectiveInstallment =
        (this.capital * monthlyEffectiveRate) /
        ((this.upfronts * monthlyEffectiveRate) +
          (1 - Math.pow(1 + monthlyEffectiveRate, -remainingMonths)));

      // Store for display (rounded)
      this.rateInstallment = Math.round(effectiveInstallment * 100) / 100;

      // RATE function: rate(nper, pmt, pv, fv, type, guess)
      // pmt is negative (outgoing payment)
      // pv is positive (loan received)
      const monthlyRate = this.rate(
        this.numberOfPeriods,      // nper: number of periods
        -effectiveInstallment,      // pmt: payment (negative for outgoing)
        this.capital,               // pv: present value (positive for loan)
        0,                          // fv: future value (0 for fully paid)
        0,                          // type: 0 = end of period
        0.01                        // guess: 1% monthly rate as initial guess
      );

      // Convert to percentage and annual rate
      this.calculatedRate = monthlyRate * 100; // Monthly rate as percentage
      this.calculatedAnnualRate = monthlyRate * 12 * 100; // Annual rate as percentage

      // Round to 4 decimal places for rate, 2 for annual
      this.calculatedRate = Math.round(this.calculatedRate * 10000) / 10000;
      this.calculatedAnnualRate = Math.round(this.calculatedAnnualRate * 100) / 100;

    } catch (error: any) {
      this.isValid = false;
      this.errorMessage = error.message || 'Error calculating interest rate';
    }
  }

  /**
   * Toggle between installment calculation and rate calculation mode
   */
  toggleCalculationMode(): void {
    this.rateCalculationMode = !this.rateCalculationMode;
    if (this.rateCalculationMode) {
      // When switching to rate mode, use current installment if available
      this.rateInstallment = this.installmentValue > 0 ? this.installmentValue : 0;
    }
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
    this.rateInstallment = 0;
    this.calculatedRate = 0;
    this.calculatedAnnualRate = 0;
    this.isValid = true;
    this.errorMessage = '';
  }
}

