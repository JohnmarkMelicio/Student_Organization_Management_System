import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  username = 'admin';
  password = 'admin';
  rememberMe = false;

  constructor(private router:Router){}
  
  login() {
    if (this.username && this.password){
      this.router.navigate(['/home'])
    }
  }
}
