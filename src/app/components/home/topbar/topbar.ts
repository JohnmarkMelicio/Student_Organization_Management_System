import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.html',
  styleUrls: ['./topbar.scss']
})
export class Topbar {

  showDropdown = false;

  constructor(private router: Router) {}

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('rememberUser');
    this.router.navigate(['/login']);
  }

  // Close when clicking outside
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-wrapper')) {
      this.showDropdown = false;
    }
  }
}