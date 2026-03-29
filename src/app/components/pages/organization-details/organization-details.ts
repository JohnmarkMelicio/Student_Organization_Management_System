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
  updateDoc
} from '@angular/fire/firestore';

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

  isAdmin: boolean = false;

  newMember: any = {
    name: '',
    position: '',
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
    if (user) this.isAdmin = user['role'] === 'admin';
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
    if (!this.newMember.name || !this.newMember.position) return;

    const ref = collection(this.firestore, 'members');
    this.newMember.organizationId = this.organization.id;

    addDoc(ref, this.newMember).then(() => {
      this.newMember = { name: '', position: '', organizationId: '' };
      this.showOfficerModal = false;
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
    if (!this.organization?.id) return;

    const ref = doc(this.firestore, `organizations/${this.organization.id}`);

    updateDoc(ref, this.editOrg)
      .then(() => this.showEditModal = false)
      .catch(err => console.error(err));
  }

  goBack() {
    history.back();
  }
}