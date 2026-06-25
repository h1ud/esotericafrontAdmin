import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Codes } from './codes';

describe('Codes', () => {
  let component: Codes;
  let fixture: ComponentFixture<Codes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Codes],
    }).compileComponents();

    fixture = TestBed.createComponent(Codes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
