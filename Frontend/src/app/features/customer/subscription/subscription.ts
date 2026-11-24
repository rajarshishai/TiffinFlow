import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BillingCycle = 'weekly' | 'monthly' | 'yearly';
export type MealFrequency = 1 | 2;
export type DietType = 'veg' | 'non-veg' | 'fitness' | 'jain';
export type PackagingOption = 'eco' | 'disposable';

interface PricingTier {
  perMealPrice: number;
  savingsPercentage: number;
  deliveryFee: number;
  features: string[];
}

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription.html',
  styleUrls: ['./subscription.css']
})
export class Subscription {
  // Signals for reactive state management
  selectedCycle = signal<BillingCycle>('monthly');
  selectedFrequency = signal<MealFrequency>(1);
  selectedDiet = signal<DietType>('veg');
  selectedPackaging = signal<PackagingOption>('eco');
  selectedMealType = signal<'lunch' | 'dinner' | 'both'>('lunch');

  // Base pricing logic (INR per meal)
  private readonly pricingData: Record<BillingCycle, PricingTier> = {
    weekly: {
      perMealPrice: 120,
      savingsPercentage: 0,
      deliveryFee: 15,
      features: [
        'Standard Menu Rotation',
        'Pause anytime with 2-hour notice',
        'Standard Stainless Steel Box',
        'Standard Support'
      ]
    },
    monthly: {
      perMealPrice: 105,
      savingsPercentage: 12,
      deliveryFee: 0,
      features: [
        'Custom Chef Recommendations',
        'Flexi-Pause & 100% Wallet Rollover',
        'Free Eco-Packaging Choice',
        'Priority Breakfast & Lunch Slot Guarantee',
        'Dedicated Support'
      ]
    },
    yearly: {
      perMealPrice: 85,
      savingsPercentage: 32, // Includes base monthly savings + 20% extra
      deliveryFee: 0,
      features: [
        'Full Menu Personalization & Custom Dietician Consult',
        'Flexi-Pause (Unlimited Rollover Days)',
        'Free Premium Insulated Box Set',
        'Zero Delivery Charges Guaranteed',
        'VIP Priority Customer Concierge',
        'Free Dessert on Weekends'
      ]
    }
  };

  // Computed values for dynamic calculation
  currentTier = computed(() => this.pricingData[this.selectedCycle()]);

  totalMealsPerMonth = computed(() => {
    const daysPerCycle = this.selectedCycle() === 'weekly' ? 6 : this.selectedCycle() === 'monthly' ? 26 : 312;
    return daysPerCycle * this.selectedFrequency();
  });

  calculatedPrice = computed(() => {
    const tier = this.currentTier();
    const meals = this.totalMealsPerMonth();
    const packagingSurcharge = this.selectedPackaging() === 'disposable' ? 5 * meals : 0;
    
    // Diet specific adjustments
    let dietMultiplier = 1;
    if (this.selectedDiet() === 'non-veg') dietMultiplier = 1.2;
    if (this.selectedDiet() === 'fitness') dietMultiplier = 1.25;

    const baseTotal = (tier.perMealPrice * meals * dietMultiplier) + packagingSurcharge;
    return Math.round(baseTotal);
  });

  effectivePricePerMeal = computed(() => {
    return Math.round(this.calculatedPrice() / this.totalMealsPerMonth());
  });

  // Action methods
  setCycle(cycle: BillingCycle) {
    this.selectedCycle.set(cycle);
  }

  setFrequency(freq: MealFrequency) {
    this.selectedFrequency.set(freq);
    if (freq === 2) {
      this.selectedMealType.set('both');
    } else {
      this.selectedMealType.set('lunch');
    }
  }

  setDiet(diet: DietType) {
    this.selectedDiet.set(diet);
  }

  setPackaging(pkg: PackagingOption) {
    this.selectedPackaging.set(pkg);
  }

  setMealType(meal: 'lunch' | 'dinner' | 'both') {
    this.selectedMealType.set(meal);
  }

  openMenuPreview() {
    alert('Opening Weekly Menu Preview...');
  }

  proceedToCheckout() {
    console.log('Subscribing with payload:', {
      cycle: this.selectedCycle(),
      frequency: this.selectedFrequency(),
      mealType: this.selectedMealType(),
      diet: this.selectedDiet(),
      packaging: this.selectedPackaging(),
      total: this.calculatedPrice()
    });
  }
}