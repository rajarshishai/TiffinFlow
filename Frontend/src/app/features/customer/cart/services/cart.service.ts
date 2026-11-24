import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  image: string;
  portion: 'regular' | 'mini';
  planType: 'Single' | 'Subscriber';
  unitPrice: number;
  quantity: number;
  description?: string;
  customizations?: string[];
  instructions?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cartItems = signal<CartItem[]>([]);

  // Total item count across all quantities
  totalCount = computed(() => this.cartItems().reduce((acc, item) => acc + item.quantity, 0));

  // Total price computation
  totalPrice = computed(() =>
    this.cartItems().reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
  );

  // inside CartService class
  removeItem(id: string): void {
    
    this.cartItems.update((items) => items.filter((item) => item.id !== id));
  }

  addToCart(item: CartItem) {
    this.cartItems.update((items) => {
      // Find if item with same portion & plan type already exists
      const existingIndex = items.findIndex(
        (i) =>
          i.menuItemId === item.menuItemId &&
          i.portion === item.portion &&
          i.planType === item.planType,
      );

      if (existingIndex > -1) {
        const updated = [...items];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...items, item];
    });
  }

  updateQuantity(cartItemId: string, change: number) {
    this.cartItems.update((items) =>
      items
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + change;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null),
    );
  }

  removeFromCart(cartItemId: string) {
    this.cartItems.update((items) => items.filter((item) => item.id !== cartItemId));
  }

  clearCart() {
    this.cartItems.set([]);
  }
}
