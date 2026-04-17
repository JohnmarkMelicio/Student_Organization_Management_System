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

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

/* PrimeNG */
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';

import * as XLSX from 'xlsx';

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

  studentID = '';
  firstName = '';
  middleName = '';
  lastName = '';
  program = '';
  year = '';
  contact = '';
  email = '';
  password = '';

  showImportModal = false;
  importedData: any[] = [];
  selectedFileName = '';

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

  ngOnInit() {
    const usersRef = collection(this.firestore, 'users');

    collectionData(usersRef, { idField: 'id' })
      .subscribe((data: any[]) => {
        this.users = data;
        this.filteredUsers = data;
      });
  }

  /* 🔥 SECONDARY AUTH FIX */
  getSecondaryAuth() {
    let secondaryApp;

    if (!getApps().some(app => app.name === 'Secondary')) {
      secondaryApp = initializeApp(environment.firebase, 'Secondary');
    } else {
      secondaryApp = getApps().find(app => app.name === 'Secondary')!;
    }

    return getAuth(secondaryApp);
  }

  async createStudent(form: NgForm) {

    if (form.invalid) {
      Swal.fire('Warning', 'Fill all required fields', 'warning');
      return;
    }

    try {

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

      if (this.isEditMode && this.selectedUserId) {

        await updateDoc(
          doc(this.firestore, 'users', this.selectedUserId),
          userData
        );

        Swal.fire('Updated!', 'Account updated successfully', 'success');

      } else {

        /* 🔥 FIX HERE */
        const secondaryAuth = this.getSecondaryAuth();

        const cred = await createUserWithEmailAndPassword(
          secondaryAuth,
          this.email,
          this.password
        );

        const uid = cred.user.uid;

        await setDoc(doc(this.firestore, 'users', uid), {
          ...userData,
          role: 'student',
          createdAt: new Date()
        });

        await secondaryAuth.signOut(); // prevent auto login

        Swal.fire('Success', 'Account created!', 'success');
      }

      form.reset();
      this.resetForm();
      this.closeModal();

    } catch (err: any) {
      Swal.fire('Error', err.message, 'error');
    }
  }

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

  filterUsers() {
    const keyword = this.search.toLowerCase();

    this.filteredUsers = this.users.filter(user =>
      `${user.firstName} ${user.lastName} ${user.email}`
        .toLowerCase()
        .includes(keyword)
    );
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];

    if (!file) {
      Swal.fire('No file selected', '', 'warning');
      return;
    }

    this.selectedFileName = file.name;

    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        this.importedData = XLSX.utils.sheet_to_json(sheet);

        Swal.fire('Loaded', `${this.importedData.length} users ready`, 'info');

      } catch (err) {
        Swal.fire('Error reading file', '', 'error');
      }
    };

    reader.readAsArrayBuffer(file);
  }

  async importUsers() {

    if (!this.importedData.length) {
      Swal.fire('No Data', 'Upload file first', 'warning');
      return;
    }

    try {

      const secondaryAuth = this.getSecondaryAuth();

      for (const raw of this.importedData) {

        const user = {
          studentID: String(raw.studentID) || '',
          firstName: raw.firstName || '',
          middleName: raw.middleName || '',
          lastName: raw.lastName || '',
          email: raw.email || '',
          program: raw.program || '',
          year: raw.year || '',
          contact: raw.contact || ''
        };

        if (!user.email) continue;

        const cred = await createUserWithEmailAndPassword(
          secondaryAuth,
          user.email,
          user.studentID || '123456'
        );

        await setDoc(doc(this.firestore, 'users', cred.user.uid), {
          ...user,
          role: 'student',
          createdAt: new Date()
        });
      }

      await secondaryAuth.signOut(); // prevent auto login

      Swal.fire('Success', 'Users imported!', 'success');

      this.showImportModal = false;
      this.importedData = [];

    } catch (err: any) {
      Swal.fire('Error', err.message, 'error');
    }
  }

  openModal() {
    this.resetForm();
    this.isEditMode = false;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  editUser(user: any) {
    this.isEditMode = true;
    this.showModal = true;

    this.selectedUserId = user.id;

    this.studentID = user.studentID || '';
    this.firstName = user.firstName || '';
    this.middleName = user.middleName || '';
    this.lastName = user.lastName || '';
    this.program = user.program || '';
    this.year = user.year || '';
    this.contact = user.contact || '';
    this.email = user.email || '';
  }

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

  openImportModal() {
    this.showImportModal = true;
  }
}