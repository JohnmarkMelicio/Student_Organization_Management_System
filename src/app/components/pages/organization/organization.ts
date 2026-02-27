import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrganizationService } from '../../../services/organization.service';
import { Organization, EMPTY_ORGANIZATION } from '../../../models/organization.model';

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organization.html',
  styleUrls: ['./organization.scss']
})
export class OrganizationComponent implements OnInit {

  organizations: Organization[] = [];
  showModal = false;

  newOrg: Organization = { ...EMPTY_ORGANIZATION };

  constructor(
    private orgService: OrganizationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrganizations();
  }

  loadOrganizations(): void {
    this.orgService.getAll().subscribe({
      next: (res) => this.organizations = res,
      error: (err) => console.error('Failed to load organizations', err)
    });
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  addOrganization(): void {
    if (!this.newOrg.name.trim()) return;

    this.orgService.create(this.newOrg).subscribe({
      next: () => {
        this.loadOrganizations();
        this.closeModal();
      },
      error: (err) => console.error('Failed to add organization', err)
    });
  }

  openOrganization(id: number): void {
    this.router.navigate(['/home/organization', id]);
  }

  private resetForm(): void {
    this.newOrg = { ...EMPTY_ORGANIZATION };
  }
}