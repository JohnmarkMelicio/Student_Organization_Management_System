import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import Swal from 'sweetalert2';

// ✅ PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-admin-create-account',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule // ✅ FIXED ERROR (p-card)
  ],
  templateUrl: './admin-create-account.html',
  styleUrls: ['./admin-create-account.scss']
})
export class AdminCreateAccount {

  studentID = '';
  firstName = '';
  middleName = '';
  lastName = '';
  program = '';
  email = '';
  password = '';
  loading = false;

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {}

  async createStudent(form: NgForm) {

    if (form.invalid) {
      Swal.fire({
        title: 'Incomplete Form',
        text: 'Please fill in all fields correctly.',
        icon: 'warning'
      });
      return;
    }

    try {

      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );

      const uid = userCredential.user.uid;

      await setDoc(doc(this.firestore, 'users', uid), {
        studentID: this.studentID,
        firstName: this.firstName,
        middleName: this.middleName,
        lastName: this.lastName,
        program: this.program,
        email: this.email,
        role: 'student'
      });

      Swal.fire({
        title: 'Success!',
        text: 'Student account created successfully!',
        icon: 'success'
      });

      form.reset();

    } catch (error: any) {

      Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error'
      });

    }
  }

  cancel(form: NgForm) {

    Swal.fire({
      title: 'Cancel?',
      text: 'All entered data will be cleared.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel',
      cancelButtonText: 'Keep editing'
    }).then((result) => {

      if (result.isConfirmed) {
        form.reset();

        Swal.fire({
          icon: 'info',
          title: 'Cancelled',
          timer: 1000,
          showConfirmButton: false
        });
      }

    });
  }
}