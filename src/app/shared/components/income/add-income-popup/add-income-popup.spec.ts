import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditProfilePopup } from './add-income-popup';

describe('EditProfilePopup', () => {
  let component: EditProfilePopup;
  let fixture: ComponentFixture<EditProfilePopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProfilePopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProfilePopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
