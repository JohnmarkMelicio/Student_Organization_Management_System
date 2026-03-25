import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {

  isAdmin: boolean = false;

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    const user: any = await this.authService.getCurrentUserData();

    if (user) {
      this.isAdmin = user['role'] === 'admin'; // ✅ FIX
    }
  }

}