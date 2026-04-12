import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Firestore, updateDoc, doc } from '@angular/fire/firestore';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit {

  user: any;
  userDocId: string = '';
  isAdmin: boolean = false;
  originalUser: any = {};

  constructor(
    private authService: AuthService,
    private firestore: Firestore,
    private router: Router,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.zone.run(() => {
      this.loadUser();
    });
  }

  async loadUser() {

    const currentUser = await this.authService.getCurrentUserData();
    if (!currentUser) return;

    this.user = { ...currentUser };
    this.originalUser = { ...currentUser };

    if (this.user.role === 'admin') {
      this.isAdmin = true;
    }

    const result = await this.authService.getUserDocByEmail(this.user.email);
    if (result) {
      this.userDocId = result.id;
    }
  }

  goBack() {
    this.router.navigate(['/home/dashboard']);
  }

  isChanged(): boolean {
    return JSON.stringify(this.user) !== JSON.stringify(this.originalUser);
  }

  async updateProfile() {

    if (!this.userDocId) return;

    Swal.fire({
      title: 'Saving...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const ref = doc(this.firestore, `users/${this.userDocId}`);

    try {

      await updateDoc(ref, this.user);

      this.originalUser = { ...this.user };

      Swal.fire({
        icon: 'success',
        title: 'Profile Updated!',
        timer: 1200,
        showConfirmButton: false
      });

    } catch (err) {

      console.error(err);

      Swal.fire({
        icon: 'error',
        title: 'Update Failed'
      });

    }
  }
}