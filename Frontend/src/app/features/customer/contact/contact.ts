import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class Contact {
  contactForm: FormGroup;
  isSubmitted = false;
  successMessage = false;

  // FAQ section specific to a tiffin service
  faqs = [
    {
      question: 'How do I pause or resume my daily tiffin subscription?',
      answer: 'You can pause or resume your meals directly through the TIFFIN FLOW dashboard up to 4 hours before the scheduled delivery time.',
      open: false
    },
    {
      question: 'What are your delivery time slots?',
      answer: 'Lunch is delivered between 12:00 PM - 1:30 PM, and Dinner is delivered between 7:30 PM - 9:00 PM.',
      open: false
    },
    {
      question: 'Can I customize my daily meal preferences?',
      answer: 'Yes! You can specify dietary requirements (e.g., Less Spice, Jain, No Onion/Garlic) under your account settings.',
      open: false
    }
  ];

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      subject: ['general', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }

  onSubmit(): void {
    this.isSubmitted = true;
    if (this.contactForm.valid) {
      console.log('Form Data:', this.contactForm.value);
      this.successMessage = true;
      this.contactForm.reset();
      this.isSubmitted = false;
      
      setTimeout(() => {
        this.successMessage = false;
      }, 5000);
    }
  }
}