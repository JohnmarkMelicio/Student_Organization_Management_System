import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationDetails } from './organization-details';

describe('OrganizationDetails', () => {
  let component: OrganizationDetails;
  let fixture: ComponentFixture<OrganizationDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
