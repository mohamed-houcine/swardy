import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef} from '@angular/material/dialog';
import { FormsModule, NgForm} from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { DashboardService } from '../../../../services/dashboard.service';
import { addProductCategoryPopup } from '../../add-category/product-category/add-product-category-popup';

@Component({
  selector: 'app-add-income-source-popup',
  imports: [FormsModule, NgIf],
  templateUrl: './add-employee-popup.html',
  styleUrl: './add-employee-popup.css'
})
export class addEmployeePopup {
  @ViewChild('fileInput') fileInput!: ElementRef;

  addClicked: boolean = false;
  model = this.resetModel();
  password: string = "";
  errorMessage: string = "";
  selectedFile: File | null = null;

  categories!: {id: string, name: string}[];

  constructor(private dialogRef: MatDialogRef<addEmployeePopup>, private catDiagRef: MatDialog, private dash: DashboardService) {}

  async ngOnInit() {
    this.categories = await this.dash.fetchCategoriesByType('product');
  }

  animateAdd() {
    this.addClicked = true;
    setTimeout(() => this.addClicked = false, 700);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  async onSubmit(f: NgForm): Promise<void> {
    if (!this.checkValidity(f)) return;

    try {

      await this.dash.addEmployee(
        {...this.model, password: this.password}
      );
      f.reset(this.resetModel());
      this.model = this.resetModel();
      this.selectedFile = null;
      this.fileInput.nativeElement.value = '';
      this.errorMessage = "";
      this.animateAdd();
    } catch(err) {
      this.errorMessage = "This employee already exists";
    }
    this.errorMessage = "";
  }

  resetModel() {
    return { first_name: "", last_name: "", gender: "", tel_number: 0, email: "" };
  }

  checkValidity(f: NgForm) {
    return f.valid && this.model.first_name != '' && this.model.last_name != '' && this.model.email != '' && this.model.gender != '' && this.model.tel_number != null;
  }
  isValidImage(file: File | null): boolean {
    if(file === null) return true;
    const allowedExtensions = ['png', 'jpg', 'jpeg'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return fileExtension ? allowedExtensions.includes(fileExtension) : false;
  }
}