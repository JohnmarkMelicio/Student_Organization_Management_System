import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    organizationId: null
  };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    const id = this.route.snapshot.params['id'];
    this.loadOrganization(id);
    this.loadMembers(id);
  }

  loadOrganization(id: number) {
    this.http.get<any>(`http://localhost:3000/organizations/${id}`)
      .subscribe(res => this.organization = res);
  }

  loadMembers(id: number) {
    this.http.get<any[]>(`http://localhost:3000/members?organizationId=${id}`)
      .subscribe(res => this.members = res);
  }

  addMember() {
    if (!this.newMember.name || !this.newMember.position) return;

    this.newMember.organizationId = this.organization.id;

    this.http.post(`http://localhost:3000/members`, this.newMember)
      .subscribe(() => {
        this.loadMembers(this.organization.id);
        this.showOfficerModal = false;
        this.newMember = { name: '', position: '', organizationId: null };
      });
  }

  goBack() {
    history.back();
  }
}