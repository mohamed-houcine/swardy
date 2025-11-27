import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetBalance } from './net-balance';

describe('NetBalance', () => {
  let component: NetBalance;
  let fixture: ComponentFixture<NetBalance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetBalance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetBalance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
