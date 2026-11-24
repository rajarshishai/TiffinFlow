import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CoreFeature {
  icon: string;
  title: string;
  description: string;
}

interface StatItem {
  value: string;
  label: string;
}

interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrls: ['./about.css']
})
export class About {
  stats: StatItem[] = [
    { value: '50,000+', label: 'Daily Meals Delivered' },
    { value: '500+', label: 'Partner Messes & Kitchens' },
    { value: '99.8%', label: 'On-Time Delivery Rate' },
    { value: '4.9/5', label: 'Customer Satisfaction' }
  ];

  features: CoreFeature[] = [
    {
      icon: '📅',
      title: 'Smart Meal Scheduling',
      description: 'Easily pause, skip, or modify your daily tiffin schedules with a single click before the daily cut-off time.'
    },
    {
      icon: '🍲',
      title: 'Diverse Regional Menus',
      description: 'Explore verified home chefs and local mess providers offering North, South, Jain, and customized diet meals.'
    },
    {
      icon: '🚚',
      title: 'Real-Time Delivery Tracking',
      description: 'Track your tiffin delivery agent live on the map from the kitchen right to your doorstep.'
    },
    {
      icon: '💳',
      title: 'Seamless Monthly Billing',
      description: 'Automated billing logs every delivered meal accurately. Pay via UPI, cards, or monthly auto-debit.'
    }
  ];

  processSteps: ProcessStep[] = [
    {
      number: '01',
      title: 'Choose Your Kitchen',
      description: 'Browse rated local mess owners and home kitchens near you based on meal plans and reviews.'
    },
    {
      number: '02',
      title: 'Customize Schedule',
      description: 'Select lunch, dinner, or both. Choose your active days (Mon–Fri or all week) and meal preferences.'
    },
    {
      number: '03',
      title: 'Manage On The Go',
      description: 'Going out of town? Pause your subscription anytime so you never pay for missed meals.'
    },
    {
      number: '04',
      title: 'Enjoy Fresh Meals',
      description: 'Hot, hygienic home-style food delivered reliably to your office or home every day.'
    }
  ];
}