import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Firestore,
  doc,
  docData,
  collection,
  collectionData,
  addDoc,
  query,
  where,
  updateDoc,
  deleteDoc
} from '@angular/fire/firestore';

import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-organization-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organization-details.html',
  styleUrls: ['./organization-details.scss']
})
export class OrganizationDetailsComponent {

  organization: any;
  members: any[] = [];

  showOfficerModal = false;
  showEditModal = false;
  isAdmin = false;

  newMember: any = {
    name: '',
    position: '',
    age: '',
    course: '',
    year: '',
    organizationId: ''
  };

  editOrg: any = {};

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private authService: AuthService
  ) {
    const id = this.route.snapshot.params['id'];
    this.loadOrganization(id);
    this.loadMembers(id);
    this.checkRole();
  }

  async checkRole() {
    const user: any = await this.authService.getCurrentUserData();
    if (user) this.isAdmin = user.role === 'admin';
  }

  loadOrganization(id: string) {
    const ref = doc(this.firestore, `organizations/${id}`);
    docData(ref, { idField: 'id' }).subscribe(res => {
      this.organization = res;
    });
  }

  loadMembers(orgId: string) {
    const ref = collection(this.firestore, 'members');
    const q = query(ref, where('organizationId', '==', orgId));

    collectionData(q, { idField: 'id' }).subscribe(res => {
      this.members = res;
    });
  }

  addMember() {
    if (!this.newMember.name || !this.newMember.position) {
      Swal.fire('Error', 'Name & Position required', 'error');
      return;
    }

    const ref = collection(this.firestore, 'members');
    this.newMember.organizationId = this.organization.id;

    addDoc(ref, this.newMember).then(() => {
      Swal.fire('Success', 'Officer added!', 'success');
      this.newMember = { name: '', position: '', age: '', course: '', year: '', organizationId: '' };
    });
  }

  deleteMember(member: any) {
    Swal.fire({
      title: 'Delete officer?',
      icon: 'warning',
      showCancelButton: true
    }).then(res => {
      if (res.isConfirmed) {
        const ref = doc(this.firestore, `members/${member.id}`);
        deleteDoc(ref).then(() => {
          Swal.fire('Deleted!', '', 'success');
        });
      }
    });
  }

  editMember(member: any) {
    Swal.fire({
      title: 'Edit Officer',
      html: `
        <input id="name" class="swal2-input" value="${member.name}">
        <input id="position" class="swal2-input" value="${member.position}">
      `,
      preConfirm: () => {
        return {
          name: (document.getElementById('name') as HTMLInputElement).value,
          position: (document.getElementById('position') as HTMLInputElement).value
        };
      }
    }).then(result => {
      if (result.isConfirmed) {
        const ref = doc(this.firestore, `members/${member.id}`);
        updateDoc(ref, result.value).then(() => {
          Swal.fire('Updated!', '', 'success');
        });
      }
    });
  }

  openOfficerModal() {
    this.showOfficerModal = true;
  }

  closeOfficerModal() {
    this.showOfficerModal = false;
  }

  openEditModal() {
    this.editOrg = {
      ...this.organization,
      social: {
        facebook: this.organization.social?.facebook || '',
        instagram: this.organization.social?.instagram || ''
      }
    };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  updateOrganization() {
    const ref = doc(this.firestore, `organizations/${this.organization.id}`);
    updateDoc(ref, this.editOrg).then(() => {
      Swal.fire('Updated!', '', 'success');
      this.showEditModal = false;
    });
  }

  goBack() {
    history.back();
  }
}