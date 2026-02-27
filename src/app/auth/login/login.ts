import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

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

          
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('role', user.role);

          if (this.rememberMe) {
            localStorage.setItem('rememberUser', this.username);
          }

          
          Swal.fire({
            title: 'Login Successful!',
            text: `Welcome back, ${user.username}!`,
            icon: 'success',
            confirmButtonText: 'Continue'
          }).then(() => {
            sessionStorage.setItem('justLoggedIn', 'true');
            this.router.navigate(['/home/dashboard']);
          });

        } else {

          
          Swal.fire({
            title: 'Login Failed!',
            text: 'Invalid username or password',
            icon: 'error',
            confirmButtonText: 'Try Again'
          });

        }
      },
      error: () => {

        
        Swal.fire({
          title: 'Server Error!',
          text: 'Make sure JSON Server is running.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });

      }
    });
}
}