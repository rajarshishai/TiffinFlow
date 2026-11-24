import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-wrapper">
      <div class="main-border-container">
        <div class="bento-container" [class.shift-layout]="!isRegisterMode()">
          
          <!-- SLIDESHOW PANEL -->
          <div class="slideshow-panel">
            <div class="slide-bg" 
                 *ngFor="let img of images; let i = index" 
                 [style.backgroundImage]="'url(' + img + ')'"
                 [class.active]="i === currentImageIndex()">
            </div>
            <div class="overlay"></div>
            
            <div class="brand-container">
              <div class="logo-badge">CloudChicken</div>
              <h1>Fast Flow</h1>
              <p *ngIf="isRegisterMode()" class="fade-text">Initialize your automated supply pipeline instantly.</p>
              <p *ngIf="!isRegisterMode()" class="fade-text">Access your real-time logistics ecosystem.</p>
            </div>
          </div>

          <!-- FORM PANEL -->
          <div class="form-panel">
            <div class="auth-card">
              
              <div class="card-header">
                <h2>{{ isRegisterMode() ? 'Create Account' : 'Sign In' }}</h2>
                <p>{{ isRegisterMode() ? 'Register your enterprise identity' : 'Provide your system credentials to unlock workspace' }}</p>
              </div>

              <form [formGroup]="authForm" (ngSubmit)="onSubmit()">
                
                <div class="form-group" *ngIf="isRegisterMode()">
                  <label for="fullName">Full Name</label>
                  <input id="fullName" type="text" formControlName="fullName" placeholder="e.g., Alexander Wright" />
                </div>

                <div class="form-group">
                  <label for="email">Email</label>
                  <input id="email" type="email" formControlName="email" placeholder="name@company.com" />
                </div>

                <div class="form-group password-group">
                  <label for="password">Password</label>
                  <div class="input-wrapper">
                    <input 
                      id="password" 
                      [type]="showPassword() ? 'text' : 'password'" 
                      formControlName="password" 
                      placeholder="••••••••" 
                    />
                    <button type="button" class="eye-btn" (click)="togglePasswordVisibility()" aria-label="Toggle password visibility">
                      {{ showPassword() ? '👁️' : '👁️' }}
                    </button>
                  </div>
                </div>

                <button type="submit" class="btn-primary" [disabled]="authForm.invalid || isLoading()">
                  {{ isLoading() ? 'Processing...' : (isRegisterMode() ? 'Create Account' : 'Sign In') }}
                </button>
              </form>

              <!-- SOCIAL LOGINS -->
              <div class="divider">
                <span>OR</span>
              </div>

              <div class="social-btns">
                <button type="button" class="btn-social">
                  <span>Google SSO</span>
                </button>
              </div>

              <p class="toggle-link">
                {{ isRegisterMode() ? 'Existing operator?' : 'New to the network?' }}
                <button type="button" class="btn-link" (click)="toggleMode()">
                  {{ isRegisterMode() ? 'Sign in here' : 'Register now' }}
                </button>
              </p>

            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --bg-app: #0b1329;
      --bg-surface: #0f172a;
      --bg-input: #1e293b;
      --text-bright: #f8fafc;
      --text-muted: #94a3b8;
      --outer-border: #1e293b;
      --accent-orange: #ff6b00;
      --hover-orange: #ff8533;
      --radius-main: 24px;
    }

    .auth-wrapper {
      display: flex;
      min-height: 100vh;
      width: 100vw;
      background-color: var(--bg-app);
      align-items: center;
      justify-content: center;
      padding: 2rem;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }

    .main-border-container {
      border: 1px solid orange;
      border-radius: calc(var(--radius-main) + 4px);
      padding: 6px;
      background-color: rgba(15, 23, 42, 0.6);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      width: 100%;
      max-width: 920px;
    }

    .bento-container {
      display: flex;
      background: var(--bg-surface);
      width: 100%;
      height: 620px;
      border-radius: var(--radius-main);
      padding: 1.25rem;
      gap: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: flex-direction 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .bento-container.shift-layout {
      flex-direction: row-reverse;
    }

    @media (max-width: 768px) {
      .bento-container {
        height: auto;
        flex-direction: column !important;
      }
      .slideshow-panel {
        height: 200px;
        width: 100% !important;
      }
    }

    .slideshow-panel {
      position: relative;
      width: 42%;
      height: 100%;
      border-radius: 18px;
      overflow: hidden;
      display: flex;
      align-items: flex-end;
      padding: 2.5rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .slide-bg {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background-size: cover;
      background-position: center;
      opacity: 0;
      transition: opacity 1s ease-in-out, transform 4s ease-out;
      z-index: 1;
    }

    .slide-bg.active {
      opacity: 1;
      transform: scale(1.05);
    }

    .overlay {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: linear-gradient(to top, rgba(11, 19, 41, 0.95) 0%, rgba(11, 19, 41, 0.4) 100%);
      z-index: 2;
    }

    .brand-container {
      position: relative;
      z-index: 3;
      color: var(--text-bright);
    }

    .logo-badge {
      display: inline-block;
      background: rgba(255, 107, 0, 0.15);
      padding: 0.4rem 1rem;
      border-radius: 30px;
      font-weight: 700;
      font-size: 0.85rem;
      margin-bottom: 0.75rem;
      color: var(--accent-orange);
      border: 1px solid rgba(255, 107, 0, 0.3);
    }

    .brand-container h1 {
      font-size: 2.2rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
    }

    .brand-container p {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    .form-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem 2rem;
    }

    .auth-card {
      width: 100%;
      max-width: 380px;
    }

    .card-header h2 {
      font-size: 2.65rem;
      color: orange;
      font-weight: 700;
      margin-bottom: 0.25rem;
      font-family:;
    }

    .card-header p {
      color: var(--text-muted);
      font-size: 0.88rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 0.4rem;
      color: var(--text-muted);
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--outer-border);
      border-radius: 10px;
      font-size: 0.95rem;
      background-color: var(--bg-input);
      color: var(--text-bright);
      transition: all 0.2s ease;
    }

    .form-group input:focus {
      outline: none;
      border-color: var(--accent-orange);
      box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.2);
    }

    .eye-btn {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      opacity: 0.7;
    }

    .eye-btn:hover {
      opacity: 1;
    }

    .btn-primary {
      width: 100%;
      padding: 0.85rem;
      background-color: var(--bg-input);
      color: var(--text-bright);
      border: 1px solid var(--outer-border);
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 0.5rem;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: var(--hover-orange);
      color: #ffffff;
      border-color: var(--hover-orange);
      box-shadow: 0 4px 14px rgba(255, 107, 0, 0.35);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .divider {
      text-align: center;
      margin: 1.25rem 0;
      position: relative;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      height: 1px;
      background: var(--outer-border);
    }

    .divider span {
      position: relative;
      background: var(--bg-surface);
      padding: 0 0.75rem;
      color: var(--text-muted);
      font-size: 0.75rem;
    }

    .btn-social {
      width: 100%;
      padding: 0.65rem;
      background: transparent;
      border: 1px solid var(--outer-border);
      color: var(--text-bright);
      border-radius: 10px;
      font-size: 0.88rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-social:hover {
      background: var(--bg-input);
    }

    .toggle-link {
      text-align: center;
      margin-top: 1.25rem;
      font-size: 0.88rem;
      color: var(--text-muted);
    }

    .btn-link {
      background: none;
      border: none;
      color: var(--hover-orange);
      font-weight: 600;
      cursor: pointer;
      font-size: inherit;
      padding: 0;
      margin-left: 0.25rem;
    }

    .btn-link:hover {
      text-decoration: underline;
    }
  `]
})
export class Auth implements OnInit, OnDestroy {
  // Signals state management
  isRegisterMode = signal<boolean>(true);
  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  currentImageIndex = signal<number>(0);

  authForm: FormGroup;
  private slideInterval: any;

  images: string[] = [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1200'
  ];

  constructor(private fb: FormBuilder) {
    this.authForm = this.fb.group({
      fullName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.startSlideshow();
    this.updateValidators();
  }

  ngOnDestroy(): void {
    if (this.slideInterval) clearInterval(this.slideInterval);
  }

  startSlideshow(): void {
    this.slideInterval = setInterval(() => {
      this.currentImageIndex.update(idx => (idx + 1) % this.images.length);
    }, 5000);
  }

  toggleMode(): void {
    this.isRegisterMode.update(v => !v);
    this.updateValidators();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  private updateValidators(): void {
    const nameControl = this.authForm.get('fullName');
    if (this.isRegisterMode()) {
      nameControl?.setValidators([Validators.required]);
    } else {
      nameControl?.clearValidators();
    }
    nameControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.authForm.invalid) return;

    this.isLoading.set(true);
    console.log('Submitted Payload:', this.authForm.value);

    // Simulate async submission
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1500);
  }
}