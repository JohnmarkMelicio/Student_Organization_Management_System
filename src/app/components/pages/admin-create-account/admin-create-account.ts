import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-create-account',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-create-account.html',
  styleUrls: ['./admin-create-account.scss']
})
export class AdminCreateAccount {

  studentID = '';
  firstName = '';
  middleName = '';
  lastName = '';
  email = '';
  password = '';

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

}