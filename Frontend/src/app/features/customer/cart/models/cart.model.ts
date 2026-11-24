export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  customizations?: string[];
  instructions?: string;
  isFavorite?: boolean;
  inStock?: boolean;
}

export interface RecommendedItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
}

export interface DeliveryAddress {
  id: string;
  label: string; // e.g., 'Home', 'Work'
  addressLine: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string; // e.g., 'UPI / Google Pay', 'Credit / Debit Card', 'Cash on Delivery'
  icon: string;
  isDefault?: boolean;
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  minOrderValue?: number;
}