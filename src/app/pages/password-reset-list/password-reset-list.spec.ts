import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordResetList } from './password-reset-list';

describe('PasswordResetList', () => {
  let component: PasswordResetList;
  let fixture: ComponentFixture<PasswordResetList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordResetList],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordResetList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
