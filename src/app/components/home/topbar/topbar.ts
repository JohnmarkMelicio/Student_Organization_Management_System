import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

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

  Swal.fire({
    title: 'Are you sure?',
    text: 'You will be logged out of the system.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Logout',
    cancelButtonText: 'Cancel'
  }).then((result) => {

    if (result.isConfirmed) {
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('rememberUser');

      Swal.fire({
        title: 'Logged Out!',
        text: 'You have successfully logged out.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);
    }

  });
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-wrapper')) {
      this.showDropdown = false;
    }
  }
}