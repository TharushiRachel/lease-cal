# Lease Calculator - Angular Application

An Angular application for calculating lease installment payments.

## Features

- Input fields for:
  - **C (Capital)**: The principal amount
  - **R (Interest Rate)**: Annual interest rate in percentage
  - **n (Number of Periods)**: Total number of payment periods
  - **Upfronts**: Upfront payment amount (optional)

- Calculates:
  - **Installment Value**: Monthly/periodic payment amount
  - **Net Principal**: Capital minus upfronts
  - **Total Amount**: Total amount to be paid over all periods
  - **Total Interest**: Total interest amount

## Formula Used

The installment is calculated using the standard EMI (Equated Monthly Installment) formula:

```
EMI = [P × R × (1+R)^N] / [(1+R)^N - 1]
```

Where:
- P = Net Principal (Capital - Upfronts)
- R = Monthly interest rate (Annual Rate / 12 / 100)
- N = Number of periods

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:4200`

## Build

To build the project for production:
```bash
npm run build
```

## Technologies Used

- Angular 17 (Standalone Components)
- TypeScript
- HTML5 & CSS3

