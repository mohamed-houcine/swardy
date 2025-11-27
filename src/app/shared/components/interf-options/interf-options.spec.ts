import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterfOptions } from './interf-options';

describe('InterfOptions', () => {
  let component: InterfOptions;
  let fixture: ComponentFixture<InterfOptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterfOptions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterfOptions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
