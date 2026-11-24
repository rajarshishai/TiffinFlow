import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../cart/services/cart.service';

export interface MacroInfo {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'snacks' | 'dinner' | 'drinks';
  singlePrice: number;
  subscriptionPrice: number;
  isVeg: boolean;
  image: string;
  description: string;
  calories: number;
  spiceLevel: 1 | 2 | 3;
  macros: MacroInfo;
  availableDays: string[];
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div
      class="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 selection:bg-orange-500 selection:text-white relative"
    >
      <!-- Premium Hero Header -->
      <header
        class="relative bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border-b border-indigo-900/40 py-12 px-6 overflow-hidden"
      >
        <!-- Ambient Radial Glows -->
        <div
          class="absolute -top-32 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"
        ></div>
        <div
          class="absolute -bottom-32 -right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"
        ></div>

        <div
          class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10"
        >
          <div class="space-y-2 text-center md:text-left">
            <div class="flex items-center justify-center md:justify-start gap-2">
              <span
                class="px-3.5 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-full text-xs font-semibold tracking-wider uppercase"
              >
                Chef's Daily Selection
              </span>
              <span class="text-xs text-slate-400 font-medium hidden sm:inline-block"
                >● Freshly Prepared Today</span
              >
            </div>
            <h1 class="text-4xl sm:text-5xl font-black tracking-tight text-white">
              Tiffin<span class="text-orange-500">Flow</span> Menu
            </h1>
            <p class="text-slate-400 text-sm sm:text-base max-w-xl">
              Clean, home-style meals balanced by nutritionists. Subscribe to save up to 25% on
              every order.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <!-- Header Cart Button -->

            <!-- Live Order Cutoff Timer -->
            <div
              class="bg-slate-900/80 backdrop-blur-xl border border-indigo-900/40 rounded-2xl p-4 w-full md:w-auto min-w-[250px] shadow-2xl"
            >
              <div
                class="flex items-center justify-between gap-3 text-xs text-slate-400 font-medium mb-1"
              >
                <span class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                  Next Batch Slot
                </span>
                <span class="text-orange-400 font-semibold uppercase">{{
                  activeMealPeriod()
                }}</span>
              </div>
              <div class="text-2xl font-bold font-mono text-white tracking-widest my-0.5">
                {{ countdownTime() }}
              </div>
              <p class="text-[11px] text-slate-500">
                Order before timer expires for guaranteed slot.
              </p>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Controls & Menu Section -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <!-- Filter & Plan Pricing Controls -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-10">
          <!-- Category Selector Tabs -->
          <nav class="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            @for (cat of categories; track cat.id) {
              <button
                (click)="selectedCategory.set(cat.id)"
                [class]="
                  selectedCategory() === cat.id
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold shadow-lg shadow-orange-500/20'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                "
                class="px-5 py-2.5 rounded-xl text-sm transition-all duration-300 flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>{{ cat.label }}</span>
              </button>
            }
          </nav>

          <!-- Subscription / Single Toggle -->
          <div
            class="bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl flex items-center justify-between sm:justify-end gap-2 self-start lg:self-auto w-full sm:w-auto"
          >
            <button
              (click)="isSubscriptionPlan.set(false)"
              [class]="
                !isSubscriptionPlan()
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              "
              class="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"
            >
              Single Order
            </button>
            <button
              (click)="isSubscriptionPlan.set(true)"
              [class]="
                isSubscriptionPlan()
                  ? 'bg-orange-500 text-slate-950 font-black shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              "
              class="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Subscriber Rate</span>
              <span
                class="px-1.5 py-0.5 bg-slate-950/40 text-[10px] rounded-full text-white font-bold"
                >SAVE ~20%</span
              >
            </button>
          </div>
        </div>

        <!-- Dishes Grid -->
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (item of filteredItems(); track item.id) {
            <article
              class="bg-slate-900/70 rounded-3xl border border-slate-800 hover:border-orange-500/60 shadow-xl hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 flex flex-col overflow-hidden group"
            >
              <!-- Dish Image & Overlays -->
              <div class="relative h-52 w-full overflow-hidden bg-slate-950">
                <img
                  [src]="item.image"
                  [alt]="item.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-90 group-hover:opacity-100"
                  loading="lazy"
                />

                <!-- Top Floating Badges -->
                <div
                  class="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none"
                >
                  <!-- Veg / Non-Veg Indicator -->
                  <div
                    class="bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 flex items-center justify-center shadow-md"
                  >
                    <span
                      class="w-4 h-4 border-2 flex items-center justify-center p-0.5 rounded-sm"
                      [class]="item.isVeg ? 'border-emerald-500' : 'border-rose-500'"
                      [title]="item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'"
                    >
                      <span
                        class="w-2 h-2 rounded-full"
                        [class]="item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'"
                      >
                      </span>
                    </span>
                  </div>

                  <!-- Spice Level -->
                  <div
                    class="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 flex items-center gap-1 text-[11px] font-semibold text-slate-300 shadow-md"
                  >
                    <span>{{ getSpiceLabel(item.spiceLevel) }}</span>
                  </div>
                </div>

                <!-- Calories Badge -->
                <span
                  class="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md text-orange-400 text-[11px] font-bold px-3 py-1 rounded-full border border-orange-500/20"
                >
                  {{ item.calories }} kcal
                </span>
              </div>

              <!-- Dish Details Body -->
              <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    class="font-bold text-lg text-white group-hover:text-orange-400 transition-colors duration-200"
                  >
                    {{ item.name }}
                  </h3>
                  <p class="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                    {{ item.description }}
                  </p>

                  <!-- Portion Selector -->
                  <div class="mt-4 pt-3 border-t border-slate-800">
                    <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider"
                      >Portion Size</span
                    >
                    <div class="grid grid-cols-2 gap-1.5 mt-1.5">
                      <button
                        (click)="setPortion(item.id, 'regular')"
                        [class]="
                          selectedPortions()[item.id] !== 'mini'
                            ? 'bg-orange-500/10 border-orange-500/50 text-orange-300 font-semibold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        "
                        class="py-1.5 px-2 text-[11px] rounded-lg border text-center transition-all duration-200 cursor-pointer"
                      >
                        Regular
                      </button>
                      <button
                        (click)="setPortion(item.id, 'mini')"
                        [class]="
                          selectedPortions()[item.id] === 'mini'
                            ? 'bg-orange-500/10 border-orange-500/50 text-orange-300 font-semibold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        "
                        class="py-1.5 px-2 text-[11px] rounded-lg border text-center transition-all duration-200 cursor-pointer"
                      >
                        Mini (-₹20)
                      </button>
                    </div>
                  </div>

                  <!-- Macros Accordion -->
                  <div class="mt-3">
                    <button
                      (click)="toggleMacros(item.id)"
                      class="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-orange-400 font-medium py-1 transition-colors cursor-pointer"
                    >
                      <span>Nutrition Breakdown</span>
                      <span>{{ expandedMacros()[item.id] ? '▲' : '▼' }}</span>
                    </button>

                    @if (expandedMacros()[item.id]) {
                      <div
                        class="grid grid-cols-4 gap-1 mt-2 p-2 bg-slate-950/80 rounded-xl border border-slate-800 text-center text-[10px]"
                      >
                        <div>
                          <div class="text-slate-500">Protein</div>
                          <div class="font-bold text-white mt-0.5">{{ item.macros.protein }}g</div>
                        </div>
                        <div>
                          <div class="text-slate-500">Carbs</div>
                          <div class="font-bold text-white mt-0.5">{{ item.macros.carbs }}g</div>
                        </div>
                        <div>
                          <div class="text-slate-500">Fat</div>
                          <div class="font-bold text-white mt-0.5">{{ item.macros.fat }}g</div>
                        </div>
                        <div>
                          <div class="text-slate-500">Fiber</div>
                          <div class="font-bold text-white mt-0.5">{{ item.macros.fiber }}g</div>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Price and Add Button CTA -->
                <div class="mt-6 flex items-center justify-between pt-3 border-t border-slate-800">
                  <div class="flex flex-col">
                    <span class="text-[10px] uppercase font-bold text-slate-500">
                      {{ isSubscriptionPlan() ? 'Subscriber Rate' : 'Standard Rate' }}
                    </span>
                    <div class="flex items-baseline gap-1.5">
                      <span class="text-2xl font-black text-white">
                        ₹{{ calculateFinalPrice(item) }}
                      </span>
                      @if (isSubscriptionPlan()) {
                        <span class="text-xs text-slate-500 line-through"
                          >₹{{ item.singlePrice }}</span
                        >
                      }
                    </div>
                  </div>

                  <!-- Orange Hover Add Button -->
                  <button
                    (click)="addToCart(item)"
                    class="bg-slate-800 hover:bg-orange-500 text-slate-200 hover:text-slate-950 font-bold text-xs px-5 py-3 rounded-xl shadow-lg border border-slate-700 hover:border-orange-500 active:scale-95 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </article>
          } @empty {
            <div
              class="col-span-full text-center py-20 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800"
            >
              <p class="text-slate-400 font-medium">
                No dishes match the selected category for today.
              </p>
            </div>
          }
        </section>
      </main>

      <!-- Bottom Right Floating Cart Summary Widget -->
      @if (cartService.totalCount() > 0) {
        <!-- Floating Cart Button (Fixed Bottom-Right) -->
        <div class="fixed bottom-6 right-6 z-50">
          <a
            routerLink="/cart"
            class="group flex items-center gap-3.5 bg-slate-900 hover:bg-slate-950 border border-orange-500/30 hover:border-orange-500/80 px-5 py-3.5 rounded-2xl text-white shadow-xl transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <!-- Icon & Badge Container -->
            <div class="relative flex items-center justify-center">
              <svg
                class="w-6 h-6 text-orange-400 group-hover:scale-110 transition-transform duration-300 ease-out"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>

              @if (cartService.totalCount() > 0) {
                <span
                  class="absolute -top-2.5 -right-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-slate-950 animate-bounce shadow-md"
                >
                  {{ cartService.totalCount() }}
                </span>
              }
            </div>

            <!-- Label & Price -->
            <div class="flex flex-col items-start leading-tight">
              <span class="text-[10px] uppercase font-extrabold text-orange-400 tracking-wider">
                Your Cart
              </span>
              <span class="font-black text-sm tracking-wide text-white">
                ₹{{ cartService.totalPrice() }}
              </span>
            </div>

            <!-- Right Arrow CTA Icon -->
            <svg
              class="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-200 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      }
    </div>
  `,
})
export class Menu implements OnInit, OnDestroy {
  // Services
  cartService = inject(CartService);
  private router = inject(Router);

  selectedCategory = signal<string>('all');
  isSubscriptionPlan = signal<boolean>(true);
  selectedPortions = signal<Record<string, 'regular' | 'mini'>>({});
  expandedMacros = signal<Record<string, boolean>>({});

  countdownTime = signal<string>('00:00:00');
  activeMealPeriod = signal<string>('Lunch');
  private timerInterval?: number;

  categories = [
    { id: 'all', label: 'All Dishes' },
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'snacks', label: 'Snacks' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'drinks', label: 'Drinks' },
  ];

  menuItems = signal<MenuItem[]>([
    {
      id: 'b1',
      name: 'Indori Poha & Jalebi Special',
      category: 'breakfast',
      singlePrice: 90,
      subscriptionPrice: 70,
      isVeg: true,
      image:
        'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80',
      description:
        'Steam flattened rice tempered with mustard seeds, fennel, peanuts, served with crispy Jalebi.',
      calories: 340,
      spiceLevel: 1,
      macros: { protein: 8, carbs: 58, fat: 9, fiber: 4 },
      availableDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    {
      id: 'b2',
      name: 'Stuffed Egg Paratha & Chutney',
      category: 'breakfast',
      singlePrice: 120,
      subscriptionPrice: 95,
      isVeg: false,
      image:
        'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
      description:
        'Whole wheat flatbread layered with spiced scrambled eggs, herbs, and served with mint chutney.',
      calories: 420,
      spiceLevel: 2,
      macros: { protein: 18, carbs: 44, fat: 16, fiber: 5 },
      availableDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    {
      id: 'l1',
      name: 'Signature Royal Veg Thali',
      category: 'lunch',
      singlePrice: 210,
      subscriptionPrice: 165,
      isVeg: true,
      image:
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
      description:
        'Paneer Butter Masala, Yellow Dal Tadka, 3 Ghee Chapattis, Jeera Rice, Salad & Sweet.',
      calories: 720,
      spiceLevel: 2,
      macros: { protein: 24, carbs: 92, fat: 26, fiber: 11 },
      availableDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    {
      id: 'l2',
      name: 'Desi Chicken Curry Combo',
      category: 'lunch',
      singlePrice: 250,
      subscriptionPrice: 195,
      isVeg: false,
      image:
        'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&auto=format&fit=crop&q=80',
      description:
        'Home-style chicken in thick spiced onion-tomato gravy with steamed Basmati rice and Paratha.',
      calories: 680,
      spiceLevel: 3,
      macros: { protein: 42, carbs: 68, fat: 22, fiber: 6 },
      availableDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    {
      id: 's1',
      name: 'Samosa Chaat Platter',
      category: 'snacks',
      singlePrice: 80,
      subscriptionPrice: 65,
      isVeg: true,
      image:
        'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
      description:
        'Golden spiced potato pastries broken and topped with hot chole gravy, chutneys & sev.',
      calories: 390,
      spiceLevel: 2,
      macros: { protein: 10, carbs: 54, fat: 15, fiber: 7 },
      availableDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    {
      id: 'd1',
      name: 'Dal Makhani & Garlic Naan',
      category: 'dinner',
      singlePrice: 220,
      subscriptionPrice: 175,
      isVeg: true,
      image:
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
      description:
        'Overnight black lentils cooked with butter and cream, served with 2 artisan garlic naans.',
      calories: 640,
      spiceLevel: 1,
      macros: { protein: 20, carbs: 80, fat: 24, fiber: 12 },
      availableDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    {
      id: 'dr1',
      name: 'Kulhad Masala Chaas',
      category: 'drinks',
      singlePrice: 45,
      subscriptionPrice: 35,
      isVeg: true,
      image:
        'https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=80',
      description:
        'Chilled artisan buttermilk infused with roasted cumin powder, fresh coriander, and mint.',
      calories: 85,
      spiceLevel: 1,
      macros: { protein: 4, carbs: 6, fat: 3, fiber: 1 },
      availableDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
  ]);

  private getSystemDay(): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }

  filteredItems = computed(() => {
    const category = this.selectedCategory();
    const today = this.getSystemDay();

    return this.menuItems().filter((item) => {
      const matchesDay = item.availableDays.includes(today);
      const matchesCategory = category === 'all' || item.category === category;
      return matchesDay && matchesCategory;
    });
  });

  ngOnInit() {
    this.startOrderCutoffTimer();
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  setPortion(itemId: string, portion: 'regular' | 'mini') {
    this.selectedPortions.update((map) => ({ ...map, [itemId]: portion }));
  }

  toggleMacros(itemId: string) {
    this.expandedMacros.update((map) => ({ ...map, [itemId]: !map[itemId] }));
  }

  calculateFinalPrice(item: MenuItem): number {
    let basePrice = this.isSubscriptionPlan() ? item.subscriptionPrice : item.singlePrice;
    if (this.selectedPortions()[item.id] === 'mini') {
      basePrice = Math.max(10, basePrice - 20);
    }
    return basePrice;
  }

  getSpiceLabel(level: number): string {
    return level === 1 ? 'Mild' : level === 2 ? 'Medium' : 'Hot';
  }

  private startOrderCutoffTimer() {
    const updateTimer = () => {
      const now = new Date();
      const currentHours = now.getHours();

      let targetHour = 11;
      let mealName = 'Lunch Delivery';

      if (currentHours >= 11 && currentHours < 16) {
        targetHour = 16;
        mealName = 'Snacks Delivery';
      } else if (currentHours >= 16 && currentHours < 20) {
        targetHour = 20;
        mealName = 'Dinner Delivery';
      } else if (currentHours >= 20) {
        targetHour = 31;
        mealName = 'Tomorrow Breakfast';
      } else {
        targetHour = 7;
        mealName = 'Breakfast Delivery';
      }

      this.activeMealPeriod.set(mealName);

      const targetTime = new Date(now);
      if (targetHour > 24) {
        targetTime.setDate(targetTime.getDate() + 1);
        targetTime.setHours(7, 0, 0, 0);
      } else {
        targetTime.setHours(targetHour, 0, 0, 0);
      }

      const diff = Math.max(0, targetTime.getTime() - now.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60))
        .toString()
        .padStart(2, '0');
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        .toString()
        .padStart(2, '0');
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        .toString()
        .padStart(2, '0');

      this.countdownTime.set(`${hours}:${minutes}:${seconds}`);
    };

    updateTimer();
    this.timerInterval = window.setInterval(updateTimer, 1000);
  }

  addToCart(item: MenuItem) {
    const portion = this.selectedPortions()[item.id] || 'regular';
    const finalPrice = this.calculateFinalPrice(item);
    const planType = this.isSubscriptionPlan() ? 'Subscriber' : 'Single';

    const cartItem: CartItem = {
      id: `${item.id}-${portion}-${planType}`,
      menuItemId: item.id,
      name: item.name,
      image: item.image,
      portion,
      planType,
      unitPrice: finalPrice,
      quantity: 1,
    };

    this.cartService.addToCart(cartItem);
  }
}
