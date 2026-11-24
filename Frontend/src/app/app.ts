import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './features/customer/navbar/navbar';
import { Footer } from './features/customer/footer/footer';
import { Dashboard } from './features/customer/dashboard/dashboard';
import { Menu } from './features/customer/menu/menu';
import { Subscription } from './features/customer/subscription/subscription';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar , Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'fast-flow';
}