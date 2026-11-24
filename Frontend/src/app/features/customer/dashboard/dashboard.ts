import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
interface FoodSlide {
  url: string;
  alt: string;
  tagline: string;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  isVeg: boolean;
  category: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface CaseStudy {
  id: number;
  client: string;
  role: string;
  metric: string;
  description: string;
  quote: string;
}

export interface PremiumDish {
  id: number;
  name: string;
  chefTag: string;
  description: string;
  image: string;
  rating: number;
  prepTime: string;
  price: number;
  calories: string;
  isVeg: boolean;
  category: 'all' | 'signature' | 'kolkata' | 'healthy';
}

interface FeaturedItem {
  id: string | number;
  name: string;
  category: string;
  description: string;
  review: string;
  reviewerName: string;
  rating?: number;
  imageUrl?: string;
}
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule , RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit, OnDestroy {
  // Dynamic Background Slideshow Data
  slides: FoodSlide[] = [
    {
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1170&auto=format&fit=crop',
      alt: 'Fresh Healthy Bowl',
      tagline: 'Savor authentic flavors crafted by top cloud kitchen chefs daily.',
    },
    {
      url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1074&auto=format&fit=crop',
      alt: 'Delicious Dish',
      tagline: 'Savor authentic flavors crafted by top cloud kitchen chefs daily.',
    },
    {
      url: 'https://plus.unsplash.com/premium_photo-1661883237884-263e8de8869b?q=80&w=1189&auto=format&fit=crop',
      alt: 'Salad and Veggies',
      tagline: 'Savor authentic flavors crafted by top cloud kitchen chefs daily.',
    },
    {
      url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1920&q=80',
      alt: 'Gourmet Meal',
      tagline: 'Savor authentic flavors crafted by top cloud kitchen chefs daily.',
    },
  ];

  currentSlideIndex = signal(0);
  private intervalId: any;

  // Modals & UI States
  isMenuOpen = signal(false);
  isCartOpen = signal(false);
  billingCycle = signal<'monthly' | 'yearly'>('yearly');

  // Category Filter Signal for Premium Dishes
  selectedCategory = signal<string>('all');

  // Cart Signals
  cart = signal<CartItem[]>([]);
  cartCount = computed(() => this.cart().reduce((acc, item) => acc + item.quantity, 0));
  cartTotal = computed(() =>
    this.cart().reduce((acc, item) => acc + item.price * item.quantity, 0),
  );

  // Standard Menu Items
  menuItems: MenuItem[] = [
    {
      id: 1,
      name: 'Royal Shahi Paneer Thali',
      price: 14.99,
      description: 'Slow-cooked cottage cheese in saffron gravy with artisan naan.',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop',
      isVeg: true,
      category: 'Thali',
    },
    {
      id: 2,
      name: 'Keto Grilled Chicken Salad',
      price: 13.5,
      description: 'Organic herb-marinated chicken breast served over baby spinach and avocado.',
      image:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop',
      isVeg: false,
      category: 'Health',
    },
    {
      id: 3,
      name: 'Dal Makhani & Basmati Rice',
      price: 11.99,
      description: 'Overnight slow-cooked black lentils simmered in butter and aromatic spices.',
      image:
        'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop',
      isVeg: true,
      category: 'Classic',
    },
    {
      id: 4,
      name: 'Mediterranean Grain Bowl',
      price: 12.99,
      description: 'Quinoa, roasted veggies, house chickpeas, and lemon tahini dressing.',
      image:
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop',
      isVeg: true,
      category: 'Health',
    },
  ];

  // Premium Chef Specials Data
  premiumDishes: PremiumDish[] = [
    {
      id: 101,
      name: 'Royal Truffle Mushroom Biryani',
      chefTag: 'Masterchef Signature',
      description:
        'Aged basmati rice infused with wild forest mushrooms, saffron, and black truffle essence.',
      image:
        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop',
      rating:4.95,
      prepTime: '25 mins',
      price:169,
      calories: '520 kcal',
      isVeg: true,
      category: 'signature',
    },
    {
      id: 102,
      name: 'Gondhoraj Mahi & Mustard Thali',
      chefTag: 'Kolkata Heritage Special',
      description:
        'Slow-cooked fresh river fish marinated in zesty Gondhoraj lemon, kasundi mustard, and steamed parboiled rice.',
      image:
        'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop',
      rating:4.98,
      prepTime: '20 mins',
      price: 185,
      calories: '610 kcal',
      isVeg: false,
      category: 'kolkata',
    },
    {
      id: 103,
      name: 'Avocado & Burrata Harvest Bowl',
      chefTag: 'Nutritional Expert Pick',
      description:
        'Italian burrata cheese, organic Hass avocado, heirloom tomatoes, and aged balsamic reduction.',
      image:
        'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?w=600&auto=format&fit=crop',
      rating:4.89,
      prepTime: '15 mins',
      price: 149,
      calories: '410 kcal',
      isVeg: true,
      category: 'healthy',
    },
  ];

  // Computed Signal for Filtered Premium Dishes
  filteredDishes = computed(() => {
    const cat = this.selectedCategory();
    if (cat === 'all') return this.premiumDishes;
    return this.premiumDishes.filter((dish) => dish.category === cat);
  });

  // Kolkata Cloud Kitchen Growth Case Studies
  caseStudies: CaseStudy[] = [
    {
      id: 1,
      client: 'Rajarshi Shai',
      role: 'Founder & Owner, Tiffin Flow Kolkata',
      metric: '3,500+ Daily Orders',
      description:
        'Pioneered AI-driven micro-hub dispatch units across Salt Lake, New Town, and South Kolkata to deliver fresh thermal-packed meals in under 30 minutes.',
      quote:
        '"Our goal was to bridge high-end hygiene and authentic home-style flavors for Kolkata\'s working workforce."',
    },
    {
      id: 2,
      client: 'Tech Hub Park Street',
      role: 'Corporate Catering Partner',
      metric: '99.2% Satisfaction Rate',
      description:
        "Partnered with Rajarshi Shai's cloud kitchen setup to supply over 500 daily fresh lunch boxes across IT companies in Kolkata.",
      quote:
        '"The consistency in taste and thermal freshness makes Tiffin Flow our preferred meal delivery choice in the city."',
    },
  ];
  featuredItems: FeaturedItem[] = [
    {
      id: 1,
      name: 'Truffle Mushroom Risotto',
      category: 'Chef’s Special • Italian',
      description:
        'Creamy Arborio rice infused with wild mushrooms, white truffle oil, and aged Parmesan.',
      review:
        'Rich, comforting, and perfectly cooked. The service was top-tier and incredibly attentive!',
      reviewerName: 'Sarah M.',
      rating: 4.9,
      imageUrl: 'assets/images/risotto.jpg',
    },
    // Add more items as needed
  ];

  ngOnInit(): void {
    this.startSlideshow();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startSlideshow(): void {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5500);
  }

  nextSlide(): void {
    this.currentSlideIndex.update((index) => (index + 1) % this.slides.length);
  }

  setSlide(index: number): void {
    this.currentSlideIndex.set(index);
  }

  toggleMenu(): void {
    this.isMenuOpen.update((v) => !v);
  }

  toggleCart(): void {
    this.isCartOpen.update((v) => !v);
  }

  toggleBillingCycle(cycle: 'monthly' | 'yearly'): void {
    this.billingCycle.set(cycle);
  }

  setCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  scrollToSection(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  addToCart(item: MenuItem | PremiumDish): void {
    this.cart.update((currentCart) => {
      const existing = currentCart.find((c) => c.id === item.id);
      if (existing) {
        return currentCart.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [
        ...currentCart,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description,
          image: item.image,
          isVeg: item.isVeg,
          category: item.category,
          quantity: 1,
        },
      ];
    });
  }

  updateQuantity(id: number, delta: number): void {
    this.cart.update((currentCart) => {
      return currentCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  }

  checkout(): void {
    alert(`Order placed successfully! Total: $${this.cartTotal().toFixed(2)}`);
    this.cart.set([]);
    this.isCartOpen.set(false);
  }

  onSignIn(): void {
    console.log('Navigating to Sign In...');
  }
}
