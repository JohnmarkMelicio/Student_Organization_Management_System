import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {

  username = '';
  password = '';
  rememberMe = false;
  errorMessage = '';

  private apiUrl = 'http://localhost:3000/users';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  login() {
    console.log("LOGIN CLICKED");

    this.http.get<any[]>(`${this.apiUrl}?username=${this.username}&password=${this.password}`)
      .subscribe({
        next: (res) => {
          if (res.length > 0) {

            const user = res[0];

            // ✅ Save user info
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('role', user.role);

            if (this.rememberMe) {
              localStorage.setItem('rememberUser', this.username);
            }

            // Redirect
            this.router.navigate(['/home/dashboard']);

          } else {
            this.errorMessage = "Invalid username or password";
          }
        },
        error: () => {
          this.errorMessage = "Server error. Make sure JSON Server is running.";
        }
      });
  }
}