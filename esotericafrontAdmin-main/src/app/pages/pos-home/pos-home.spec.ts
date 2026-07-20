import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosHome } from './pos-home';

describe('PosHome', () => {
  let component: PosHome;
  let fixture: ComponentFixture<PosHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosHome],
    }).compileComponents();

    fixture = TestBed.createComponent(PosHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
