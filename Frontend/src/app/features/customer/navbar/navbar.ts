import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  // Signals for state management
  isMobileMenuOpen = signal<boolean>(false);
  cartCount = signal<number>(3);
  deliveryLocation = signal<string>('742 Evergreen Terrace');
  isLocationDropdownOpen = signal<boolean>(false);

  // Navigation Links array
  navLinks = [
    { label: 'Home', path: '/dashboard' },
    { label: 'Menu', path: '/menu' },
    { label: 'Subscriptions', path: '/subscription' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(state => !state);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  toggleLocationDropdown(): void {
    this.isLocationDropdownOpen.update(state => !state);
  }
}