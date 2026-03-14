import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCreateAccount } from './admin-create-account';

describe('AdminCreateAccount', () => {
  let component: AdminCreateAccount;
  let fixture: ComponentFixture<AdminCreateAccount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCreateAccount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCreateAccount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
