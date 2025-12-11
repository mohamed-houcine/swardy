import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef} from '@angular/material/dialog';
import { FormsModule, NgForm} from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { DashboardService } from '../../../../services/dashboard.service';
import { addProductCategoryPopup } from '../../add-category/product-category/add-product-category-popup';

@Component({
  selector: 'app-add-income-source-popup',
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './add-product-popup.html',
  styleUrl: './add-product-popup.css'
})
export class addProductPopup {
  @ViewChild('fileInput') fileInput!: ElementRef;

  addClicked: boolean = false;
  model = {
    name: "",
    category: "",
    price: 0,
    description: ""
  };
  errorMessage: string = "";
  selectedFile: File | null = null;

  categories!: {id: string, name: string}[];

  constructor(private dialogRef: MatDialogRef<addProductPopup>, private catDiagRef: MatDialog, private dash: DashboardService) {}

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

      await this.dash.addProduct(
        this.model
      );
      f.reset(this.resetModel());
      this.model = this.resetModel();
      this.selectedFile = null;
      this.fileInput.nativeElement.value = '';
      this.errorMessage = "";
      this.animateAdd();
    } catch(err) {
      this.errorMessage = "";
    }
  }

  openAddCategoryPopup() {
    const dialogRef = this.catDiagRef.open(addProductCategoryPopup, {
      width: '800px',
      panelClass: 'popup'
    });

    dialogRef.afterClosed().subscribe(result => this.updateCategories());
  }

  async updateCategories() {
    this.categories = await this.dash.fetchCategoriesByType('product');
  }

  resetModel() {
    return {name: "", category: "", price: 0, description: ""};
  }

  checkValidity(f: NgForm) {
    return f.valid && this.model.price != 0 && this.model.name != '' && this.model.category != '';
  }
  isValidImage(file: File | null): boolean {
    if(file === null) return true;
    const allowedExtensions = ['png', 'jpg', 'jpeg'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return fileExtension ? allowedExtensions.includes(fileExtension) : false;
  }
}