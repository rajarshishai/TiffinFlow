import { Routes } from '@angular/router';
import { Dashboard } from './features/customer/dashboard/dashboard';
import { Menu } from './features/customer/menu/menu';
import { Subscription } from './features/customer/subscription/subscription';
import { About } from './features/customer/about/about';
import { Contact } from './features/customer/contact/contact';
import { Auth } from './features/customer/auth/auth';
import { Cart } from './features/customer/cart/components/cart/cart';
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  { path: 'dashboard', component: Dashboard },
  { path: 'contact', component: Contact },
  { path: 'cart', component: Cart },
  { path: 'menu', component: Menu },
  { path: 'subscription', component: Subscription },
  { path: 'about', component: About },
  { path: 'auth', component: Auth },
  { path: '**', redirectTo: 'dashboard' }

];