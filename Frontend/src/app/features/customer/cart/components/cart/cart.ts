import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';

// =========================================================
// INTERFACES & TYPES
// =========================================================

export interface CartItem {
  id: string;
  name: string;
  plan: string;
  qty: number;
  price: number;
  image?: string;
  description?: string;
}

export interface RecommendedItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  category?: string;
}

export interface Address {
  id: string;
  type: 'Home' | 'Office' | 'Hostel';
  details: string;
  city: string;
  pincode: string;
}

export interface PaymentMethod {
  id: 'upi' | 'cod' | 'card';
  name: string;
  description: string;
  icon: string;
}

export type CheckoutStep = 'cart' | 'delivery' | 'payment' | 'review' | 'confirmed';

@Component({
  selector: 'app-cart-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cart.html',
  // styleUrls: ['./cart.css']
})
export class Cart {

  // =========================================================
  // SERVICES & INITIALIZATION
  // =========================================================

  cartService = inject(CartService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  readonly freeDeliveryThreshold = 500;
  readonly taxRate = 0.05; // 5% GST

  // =========================================================
  // NAVIGATION & STEPPER STATE
  // =========================================================

  // Stepper state: 'cart' | 'delivery' | 'payment' | 'review' | 'confirmed'
  currentStep = signal<CheckoutStep>('cart');

  // =========================================================
  // COUPON & DISCOUNT STATE
  // =========================================================

  couponCode = signal<string>('');
  appliedDiscount = signal<number>(0);
  couponMessage = signal<string>('');
  couponSuccess = signal<boolean>(false);

  // =========================================================
  // ADDRESS STATE
  // =========================================================

  addresses = signal<Address[]>([
    { id: '1', type: 'Home', details: 'Flat 302, Green Park Apartments, Sector 4', city: 'Asansol', pincode: '713301' },
    { id: '2', type: 'Hostel', details: 'Room 204, Boys Hostel', city: 'Asansol', pincode: '713302' },
    { id: '3', type: 'Office', details: 'Tiffin Flow Tech Hub', city: 'Asansol', pincode: '713303' }
  ]);
  selectedAddressId = signal<string>('1');
  showAddressPanel = signal<boolean>(false);

  // =========================================================
  // DELIVERY TIME & SCHEDULE STATE
  // =========================================================

  deliveryType = signal<'ASAP' | 'Schedule'>('ASAP');
  selectedTimeSlot = signal<string>('07:00 PM');
  timeSlots: string[] = ['06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM'];

  // =========================================================
  // PAYMENT METHOD STATE
  // =========================================================

  paymentMethods: PaymentMethod[] = [
    { id: 'upi', name: 'UPI', description: 'Google Pay / PhonePe / Paytm', icon: '📱' },
    { id: 'cod', name: 'Cash on Delivery', description: 'Pay when your food arrives', icon: '💵' },
    { id: 'card', name: 'Credit / Debit Card', description: 'Visa, Mastercard, RuPay', icon: '💳' }
  ];
  selectedPaymentId = signal<'upi' | 'cod' | 'card'>('upi');
  upiProvider = signal<'GPay' | 'PhonePe' | 'Paytm'>('GPay');

  // =========================================================
  // RECOMMENDED ITEMS
  // =========================================================

  recommendedItems = signal<RecommendedItem[]>([
    {
      id: 'rec1',
      name: 'Extra Butter Tawa Roti',
      price: 30,
      image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=400&q=80',
      description: '2 pieces • Freshly prepared',
      category: 'Bread'
    },
    {
      id: 'rec2',
      name: 'Gulab Jamun',
      price: 45,
      image: 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?auto=format&fit=crop&w=400&q=80',
      description: '2 pieces • Sweet & soft',
      category: 'Dessert'
    },
    {
      id: 'rec3',
      name: 'Fresh Curd',
      price: 35,
      image: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=400&q=80',
      description: '200g • Homemade style',
      category: 'Side'
    }
  ]);

  // =========================================================
  // UI PROCESSING & ORDER CREATION STATE
  // =========================================================

  isCheckingOut = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  orderConfirmed = signal<boolean>(false);
  placedOrderId = signal<string>('');

  checkoutForm: FormGroup;

  constructor() {
    this.checkoutForm = this.fb.group({
      upiId: ['user@okaxis', [Validators.required, Validators.pattern(/^[\w.-]+@[\w.-]+$/)]],
      orderNote: [''],
      termsAccepted: [true, Validators.requiredTrue]
    });
  }

  // =========================================================
  // COMPUTED CALCULATIONS
  // =========================================================

  // Derives items directly from CartService with local fallbacks
  cartItems = computed(() => {
    return this.cartService.cartItems ? this.cartService.cartItems() : [];
  });

  subtotal = computed(() => {
    if (this.cartService.totalPrice) {
      return this.cartService.totalPrice();
    }
    return this.cartItems().reduce((acc: number, item: any) => {
      const price = item.price || item.unitPrice || 0;
      const qty = item.qty || item.quantity || 0;
      return acc + price * qty;
    }, 0);
  });

  itemCount = computed(() => {
    return this.cartItems().reduce((total: number, item: any) => {
      return total + Number(item.qty || item.quantity || 0);
    }, 0);
  });

  remainingForFreeDelivery = computed(() => {
    return Math.max(0, this.freeDeliveryThreshold - this.subtotal());
  });

  freeDeliveryProgress = computed(() => {
    return Math.min(100, Math.round((this.subtotal() / this.freeDeliveryThreshold) * 100));
  });

  deliveryFee = computed(() => {
    return this.subtotal() >= this.freeDeliveryThreshold ? 0 : 40;
  });

  taxes = computed(() => {
    return Math.round(Math.max(0, this.subtotal() - this.appliedDiscount()) * this.taxRate);
  });

  grandTotal = computed(() => {
    return Math.max(0, this.subtotal() - this.appliedDiscount() + this.deliveryFee() + this.taxes());
  });

  earnedPoints = computed(() => {
    return Math.floor(this.subtotal() * 0.1);
  });

  deliverySavings = computed(() => {
    return this.deliveryFee() === 0 ? 40 : 0;
  });

  savings = computed(() => {
    return this.appliedDiscount() + this.deliverySavings();
  });

  selectedAddress = computed(() => {
    return this.addresses().find(a => a.id === this.selectedAddressId()) || this.addresses()[0];
  });

  selectedPayment = computed(() => {
    return this.paymentMethods.find(p => p.id === this.selectedPaymentId()) || this.paymentMethods[0];
  });

  // =========================================================
  // CART ACTIONS
  // =========================================================

  increaseQuantity(id: string): void {
    this.cartService.updateQuantity(id, 1);
  }

  decreaseQuantity(id: string): void {
    this.cartService.updateQuantity(id, -1);
  }

  removeItem(id: string): void {
    this.cartService.removeItem(id);
  }

  addRecommendedItem(item: RecommendedItem): void {
    const service: any = this.cartService;
    if (typeof service.addItem === 'function') {
      service.addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        unitPrice: item.price,
        image: item.image,
        description: item.description || '',
        quantity: 1,
        portion: 'regular',
        planType: 'one-time',
        customizations: [],
        instructions: ''
      });
    } else {
      service.updateQuantity(item.id, 1);
    }
  }

  // =========================================================
  // COUPON ACTIONS
  // =========================================================

  applyCoupon(): void {
    const code = this.couponCode().trim().toUpperCase();
    this.couponMessage.set('');
    this.couponSuccess.set(false);

    if (!code) {
      this.couponMessage.set('Please enter a coupon code.');
      return;
    }

    if (code === 'TIFFIN50') {
      this.appliedDiscount.set(50);
      this.couponSuccess.set(true);
      this.couponMessage.set('Coupon applied successfully! You saved ₹50.');
      return;
    }

    if (code === 'TIFFIN20') {
      const calculatedDiscount = Math.min(200, Math.round(this.subtotal() * 0.20));
      this.appliedDiscount.set(calculatedDiscount);
      this.couponSuccess.set(true);
      this.couponMessage.set('20% promotional discount applied.');
      return;
    }

    this.appliedDiscount.set(0);
    this.couponSuccess.set(false);
    this.couponMessage.set('Invalid coupon code. Try TIFFIN50 or TIFFIN20.');
  }

  removeCoupon(): void {
    this.appliedDiscount.set(0);
    this.couponCode.set('');
    this.couponMessage.set('');
    this.couponSuccess.set(false);
  }

  // =========================================================
  // NAVIGATION & CHECKOUT FLOW CONTROL
  // =========================================================

  setStep(step: CheckoutStep): void {
    this.currentStep.set(step);
  }

  proceedToDelivery(): void {
    if (!this.cartItems() || this.cartItems().length === 0) {
      return;
    }
    this.isCheckingOut.set(true);
    setTimeout(() => {
      this.isCheckingOut.set(false);
      this.currentStep.set('delivery');
    }, 300);
  }

  proceedToPayment(): void {
    this.currentStep.set('payment');
  }

  proceedToReview(): void {
    this.currentStep.set('review');
  }

  selectAddress(id: string): void {
    this.selectedAddressId.set(id);
  }

  setDeliveryType(type: 'ASAP' | 'Schedule'): void {
    this.deliveryType.set(type);
  }

  selectTimeSlot(slot: string): void {
    this.selectedTimeSlot.set(slot);
  }

  selectPayment(id: 'upi' | 'cod' | 'card'): void {
    this.selectedPaymentId.set(id);
  }

  // =========================================================
  // ORDER SUBMISSION
  // =========================================================

  placeOrder(): void {
    if (this.selectedPaymentId() === 'upi' && this.checkoutForm.get('upiId')?.invalid) {
      this.checkoutForm.get('upiId')?.markAsTouched();
      return;
    }

    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    // Simulate backend verification & order creation
    setTimeout(() => {
      this.isSubmitting.set(false);
      const generatedId = 'TFN-' + Math.floor(100000 + Math.random() * 900000);
      this.placedOrderId.set(generatedId);
      this.orderConfirmed.set(true);
      this.currentStep.set('confirmed');

      if (typeof (this.cartService as any).clearCart === 'function') {
        (this.cartService as any).clearCart();
      }
    }, 2000);
  }

  trackById(index: number, item: any): string {
    return item.id;
  }
}