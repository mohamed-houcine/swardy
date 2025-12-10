import { ComponentFixture, TestBed } from '@angular/core/testing';
import { addIncomeCategoryPopup } from './add-income-category-popup';

describe('EditProfilePopup', () => {
  let component: addIncomeCategoryPopup;
  let fixture: ComponentFixture<addIncomeCategoryPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [addIncomeCategoryPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(addIncomeCategoryPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
