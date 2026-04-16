import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  collection,
  collectionData,
  deleteDoc,
  updateDoc
} from '@angular/fire/firestore';

import Swal from 'sweetalert2';

/* PrimeNG */
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-admin-create-account',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule,
    TableModule,
    DialogModule
  ],
  templateUrl: './admin-create-account.html',
  styleUrls: ['./admin-create-account.scss']
})
export class AdminCreateAccount implements OnInit {

  /* ========================= */
  /* FORM DATA */
  /* ========================= */
  studentID = '';
  firstName = '';
  middleName = '';
  lastName = '';
  program = '';
  year = '';
  contact = '';
  email = '';
  password = '';

  selectedUserId: string | null = null;

  showModal = false;
  isEditMode = false;

  search = '';

  users: any[] = [];
  filteredUsers: any[] = [];

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {}

  /* ========================= */
  /* LOAD USERS */
  /* ========================= */
  ngOnInit() {
    const usersRef = collection(this.firestore, 'users');

    collectionData(usersRef, { idField: 'id' })
      .subscribe((data: any[]) => {
        this.users = data;
        this.filteredUsers = data;
      });
  }

  /* ========================= */
  /* CREATE / UPDATE USER */
  /* ========================= */
  async createStudent(form: NgForm) {

    if (form.invalid) {
      Swal.fire('Warning', 'Fill all required fields', 'warning');
      return;
    }

    try {

      /* 🔥 CLEAN DATA (REMOVE UNDEFINED) */
      const userData: any = {
        studentID: this.studentID || '',
        firstName: this.firstName || '',
        middleName: this.middleName || '',
        lastName: this.lastName || '',
        program: this.program || '',
        year: this.year || '',
        contact: this.contact || '',
        email: this.email || ''
      };

      /* ========================= */
      /* UPDATE */
      /* ========================= */
      if (this.isEditMode && this.selectedUserId) {

        await updateDoc(
          doc(this.firestore, 'users', this.selectedUserId),
          userData
        );

        Swal.fire('Updated!', 'Account updated successfully', 'success');

      } else {

        /* ========================= */
        /* CREATE */
        /* ========================= */
        const cred = await createUserWithEmailAndPassword(
          this.auth,
          this.email,
          this.password
        );

        const uid = cred.user.uid;

        await setDoc(doc(this.firestore, 'users', uid), {
          ...userData,
          role: 'student',
          createdAt: new Date()
        });

        Swal.fire('Success', 'Account created!', 'success');
      }

      form.reset();
      this.resetForm();
      this.closeModal();

    } catch (err: any) {
      Swal.fire('Error', err.message, 'error');
    }
  }

  /* ========================= */
  /* DELETE */
  /* ========================= */
  async deleteUser(id: string) {

    const confirm = await Swal.fire({
      title: 'Delete user?',
      icon: 'warning',
      showCancelButton: true
    });

    if (confirm.isConfirmed) {
      await deleteDoc(doc(this.firestore, 'users', id));
      Swal.fire('Deleted!', '', 'success');
    }
  }

  /* ========================= */
  /* SEARCH */
  /* ========================= */
  filterUsers() {
    const keyword = this.search.toLowerCase();

    this.filteredUsers = this.users.filter(user =>
      `${user.firstName} ${user.lastName} ${user.email}`
        .toLowerCase()
        .includes(keyword)
    );
  }

  /* ========================= */
  /* MODAL CONTROL */
  /* ========================= */
  openModal() {
    this.resetForm();
    this.isEditMode = false;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  /* ========================= */
  /* EDIT USER */
  /* ========================= */
  editUser(user: any) {
    this.isEditMode = true;
    this.showModal = true;

    this.selectedUserId = user.id;

    /* 🔥 SAFE ASSIGN (NO UNDEFINED) */
    this.studentID = user.studentID || '';
    this.firstName = user.firstName || '';
    this.middleName = user.middleName || '';
    this.lastName = user.lastName || '';
    this.program = user.program || '';
    this.year = user.year || '';
    this.contact = user.contact || '';
    this.email = user.email || '';
  }

  /* ========================= */
  /* RESET FORM */
  /* ========================= */
  resetForm() {
    this.studentID = '';
    this.firstName = '';
    this.middleName = '';
    this.lastName = '';
    this.program = '';
    this.year = '';
    this.contact = '';
    this.email = '';
    this.password = '';
    this.selectedUserId = null;
  }

  /* ========================= */
  /* IMPORT */
  /* ========================= */
  openImportModal() {
    Swal.fire('Coming soon: Import feature');
  }
}