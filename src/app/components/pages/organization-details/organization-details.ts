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
where
} from '@angular/fire/firestore';

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

  newMember: any = {
    name: '',
    position: '',
    organizationId: ''
  };

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore
  ) {

    const id = this.route.snapshot.params['id'];

    this.loadOrganization(id);
    this.loadMembers(id);

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

      this.newMember = {
        name: '',
        position: '',
        organizationId: ''
      };

      this.showOfficerModal = false;

    });

  }

  goBack() {

    history.back();

  }

}