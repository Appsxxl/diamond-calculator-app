# Diamond Solution Calculator - Mobile App Design

## Overview
A professional cross-platform calculator app for wealth optimization simulation, featuring the "Diamond Solution" strategy with multi-language support, complex financial calculations, and beautiful data visualization.

## Design Philosophy
- **Mobile-First**: Optimized for portrait orientation (9:16) with one-handed usage
- **Professional**: Clean, modern interface aligned with iOS Human Interface Guidelines
- **Accessible**: Clear typography, high contrast, intuitive navigation
- **Responsive**: Works seamlessly on mobile (iOS/Android) and web browsers

## Color Scheme
- **Primary**: Deep Blue (#0a7ea4) - Trust, stability, wealth
- **Accent**: Warm Orange (#FF8C00) - Action, energy, growth
- **Background**: Dark (#151718) with light mode support
- **Surface**: Elevated cards (#1e2022 dark / #f5f5f5 light)
- **Text**: High contrast for readability

## Screen Architecture

### 1. **Home Screen** (Main Entry Point)
**Purpose**: Quick access to calculator tools and recent calculations

**Content**:
- App header with branding
- Two main action cards:
  - "Scenario Tool" - Run wealth optimization simulations
  - "Strategy Engineer" - Advanced strategy configuration
- Quick stats display (if data saved)
- Language selector in header

**Functionality**:
- Navigate to Scenario or Strategy tool
- View calculation history
- Switch language

---

### 2. **Scenario Tool Screen** (Primary Calculator)
**Purpose**: Main calculator for wealth optimization simulation

**Layout Sections**:

#### A. Input Section (Top)
- **Client Information**:
  - Text input: Client name
  - Dropdown: Language selection
  - Badge: VIP Status indicator

- **Core Parameters**:
  - Number input: Goal amount (default: $2,000)
  - Number input: Start Diamonds (default: $10,000)
  - Number input: Years (default: 5)
  - Button: PDF Export

#### B. Configuration Section (Middle)
- **Deposit Settings**:
  - Extra amount input + "OK" button
  - Annual amounts input + "SET" button

- **Withdrawal Settings**:
  - Monthly amount input + "OK" button
  - Withdrawal % input + "SET" button

- **Compound Settings**:
  - Compound % input with date range + "SET" button

#### C. Results Table (Bottom - Scrollable)
**Columns** (horizontal scroll on mobile):
- Month (M)
- Diamonds (current balance)
- Deposit (extra amounts)
- Out % (withdrawal percentage)
- Withdrawal (amount withdrawn)
- Compound % (interest rate)
- Plan (investment plan)
- Discount (discount amount)
- Status (VIP status)
- Total Diamonds (final balance)

**Features**:
- Year markers ("Year 2 Sale", etc.)
- Color-coded status badges
- Horizontal scroll for all columns
- Tap row to expand details

#### D. Summary Section (Below Table)
- Total In (total deposits)
- Total Out (total withdrawals)
- ROC Break-Even (return on investment)
- Current Status

---

### 3. **Strategy Engineer Screen** (Advanced)
**Purpose**: Configure custom investment strategies

**Content**:
- Strategy template selector
- Advanced parameter configuration
- Preset strategies (SP4, SP5, SP6, SP7)
- Custom strategy builder
- Save/Load strategy profiles

---

### 4. **Settings Screen**
**Purpose**: App configuration and preferences

**Options**:
- Language selection (EN, NL, DE, FR, ES)
- Theme (Light/Dark mode)
- Currency symbol preference
- Clear calculation history
- About & Help

---

## Key User Flows

### Flow 1: Quick Calculation
1. User opens app → Home screen
2. Taps "Scenario Tool"
3. Enters basic parameters (start amount, years)
4. Views auto-calculated results in table
5. Scrolls through monthly breakdown
6. Exports to PDF (optional)

### Flow 2: Detailed Simulation
1. User opens app → Home screen
2. Taps "Scenario Tool"
3. Enters all parameters (deposits, withdrawals, compound %)
4. Configures date ranges for each setting
5. Views results with color-coded status
6. Compares different scenarios
7. Saves favorite scenario

### Flow 3: Strategy Comparison
1. User opens app → Home screen
2. Taps "Strategy Engineer"
3. Selects preset strategy (SP4, SP5, etc.)
4. Adjusts parameters
5. Compares with other strategies
6. Applies to new calculation

---

## Responsive Behavior

### Mobile (Portrait - Primary)
- Single column layout
- Horizontal scroll for tables
- Stacked input sections
- Full-width buttons
- Bottom tab navigation (if needed)

### Tablet/Web
- Multi-column layout option
- Side-by-side comparison views
- Table fully visible (no scroll)
- Larger touch targets
- Desktop navigation menu

---

## Data Model

### Calculation Object
```
{
  id: string (UUID)
  clientName: string
  language: "en" | "nl" | "de" | "fr" | "es"
  startDiamonds: number
  years: number
  goalAmount: number
  deposits: {
    extraAmount: number
    annualAmounts: number[]
  }
  withdrawals: {
    monthlyAmount: number
    percentage: number
  }
  compound: {
    percentage: number
    fromMonth: number
    toMonth: number
  }
  results: MonthlyResult[]
  createdAt: timestamp
  updatedAt: timestamp
}

MonthlyResult {
  month: number
  diamonds: number
  deposit: number
  outPercentage: number
  withdrawal: number
  compoundPercentage: number
  plan: string
  discount: number
  status: string
  totalDiamonds: number
}
```

---

## Accessibility Considerations
- Large touch targets (minimum 44x44pt)
- High contrast text (WCAG AA compliant)
- Clear button labels
- Haptic feedback on interactions
- Screen reader support (semantic HTML/accessibility labels)

---

## Performance Targets
- Calculation results: < 500ms
- Screen transitions: < 300ms
- Table scroll: 60 FPS
- PDF export: < 2 seconds

---

## Branding
- **App Name**: Diamond Solution Calculator
- **Logo**: Professional diamond icon with blue/orange accent
- **Tagline**: "Strategic Wealth Optimization"
- **Font**: System fonts (SF Pro Display on iOS, Roboto on Android)

---

## Multi-Language Support
- **English (EN)**: Default
- **Dutch (NL)**: Nederlands
- **German (DE)**: Deutsch
- **French (FR)**: Français
- **Spanish (ES)**: Español

All UI text, labels, and messages translated in each language.

---

## Future Enhancements
- Cloud sync across devices
- Biometric authentication
- Push notifications for milestones
- Advanced charting and visualization
- Export to Excel/CSV
- Sharing calculations with others
- API integration for real investment data
