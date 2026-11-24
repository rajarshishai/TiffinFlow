import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink], // Required for routing links to work
  template: `
    <footer class="footer">
      <div class="footer-container">
        
        <!-- Brand & Address Section -->
        <div class="footer-column brand-section">
          <h2 class="brand-name">TIFFIN FLOW</h2>
          <p class="tagline">Delivering homemade happiness, hot and fresh to your doorstep every day.</p>
          
          <address class="address-box">
            <p><strong>📍 Address:</strong></p>
            <p>123 Spice Avenue, Foodie District<br>
               Sector 4, City Center, 400001</p>
            <p><strong>📞 Phone:</strong> +91 98765 43210</p>
            <p><strong>✉️ Email:</strong> support@tiffinflow.com</p>
          </address>
        </div>

        <!-- Quick Links Section -->
        <div class="footer-column">
          <h3>Quick Links</h3>
          <ul>
            <li><a routerLink="/">Home</a></li>
            <li><a routerLink="/menu">Our Menu</a></li>
            <li><a routerLink="/subscription">Monthly Subscriptions</a></li>
            <li><a routerLink="/about">About Us</a></li>
            <li><a routerLink="/contact">Contact</a></li>
          </ul>
        </div>

        <!-- Helpful Links & Legal -->
        <div class="footer-column">
          <h3>Information</h3>
          <ul>
            <li><a routerLink="/faq">FAQs</a></li>
            <li><a routerLink="/delivery-areas">Delivery Areas</a></li>
            <li><a routerLink="/privacy">Privacy Policy</a></li>
            <li><a routerLink="/terms">Terms of Service</a></li>
          </ul>
        </div>

        <!-- Social Media Newsletter -->
        <div class="footer-column newsletter-section">
          <h3>Follow Us</h3>
          <div class="social-links">
            <a href="#" aria-label="Facebook">FB</a>
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="Twitter">X</a>
          </div>
          
          <h3 class="newsletter-title">Subscribe to Offers</h3>
          <div class="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button type="button">Join</button>
          </div>
        </div>

      </div>

      <!-- Copyright Bottom Bar -->
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} Tiffin Flow. All rights reserved.</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: #1a1a1a;
      color: #e0e0e0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding-top: 3rem;
      border-top: 4px solid #ff6b2b; /* Tiffin Flow signature orange */
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      padding: 0 2rem 3rem 2rem;
    }

    .footer-column h3 {
      color: #ffffff;
      font-size: 1.2rem;
      margin-bottom: 1.2rem;
      position: relative;
    }

    .footer-column h3::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -8px;
      width: 40px;
      height: 2px;
      background-color: #ff6b2b;
    }

    .brand-name {
      color: #ff6b2b;
      font-size: 1.8rem;
      font-weight: 800;
      margin: 0 0 1rem 0;
      letter-spacing: 1px;
    }

    .tagline {
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
      color: #a0a0a0;
    }

    .address-box {
      font-style: normal;
      font-size: 0.9rem;
      line-height: 1.6;
      background: #252525;
      padding: 1rem;
      border-radius: 8px;
    }

    .address-box p {
      margin: 0 0 0.5rem 0;
    }

    .address-box strong {
      color: #ff6b2b;
    }

    .footer-column ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-column ul li {
      margin-bottom: 0.8rem;
    }

    .footer-column a {
      color: #e0e0e0;
      text-decoration: none;
      transition: color 0.3s ease;
      font-size: 0.95rem;
    }

    .footer-column a:hover {
      color: #ff6b2b;
      text-decoration: underline;
    }

    .social-links {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .social-links a {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background-color: #333;
      color: #fff;
      border-radius: 50%;
      text-decoration: none;
      font-weight: bold;
      transition: background-color 0.3s ease;
    }

    .social-links a:hover {
      background-color: #ff6b2b;
    }

    .newsletter-title {
      margin-top: 1rem;
    }

    .newsletter-form {
      display: flex;
      margin-top: 1rem;
    }

    .newsletter-form input {
      flex: 1;
      padding: 0.7rem;
      border: none;
      border-radius: 4px 0 0 4px;
      outline: none;
    }

    .newsletter-form button {
      padding: 0.7rem 1.2rem;
      background-color: #ff6b2b;
      color: white;
      border: none;
      border-radius: 0 4px 4px 0;
      cursor: pointer;
      font-weight: bold;
      transition: background-color 0.3s ease;
    }

    .newsletter-form button:hover {
      background-color: #e55a1f;
    }

    .footer-bottom {
      text-align: center;
      padding: 1.5rem;
      background-color: #111;
      font-size: 0.9rem;
      color: #888;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .footer-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class Footer {
  // Dynamically gets the current year so it never goes out of date
  currentYear: number = new Date().getFullYear();
}