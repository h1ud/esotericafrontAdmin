import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPanelLayout } from './admin-panel-layout';

describe('AdminPanelLayout', () => {
  let component: AdminPanelLayout;
  let fixture: ComponentFixture<AdminPanelLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPanelLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPanelLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
