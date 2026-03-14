import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {

  studentID = '';
  password = '';
  rememberMe = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  login() {

    this.authService.login(this.studentID, this.password)
      .then(() => {

        if (this.rememberMe) {
          localStorage.setItem('rememberUser', this.studentID);
        }

        Swal.fire({
          title: 'Login Successful!',
          icon: 'success'
        }).then(() => {
          this.router.navigate(['/home/dashboard']);
        });

      })
      .catch(error => {

        Swal.fire({
          title: 'Login Failed',
          text: error.message,
          icon: 'error'
        });

      });

  }
}