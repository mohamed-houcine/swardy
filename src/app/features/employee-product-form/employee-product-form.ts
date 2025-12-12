import { Component, OnInit ,ViewChild, ElementRef} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { NgFor, NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { addIncomeCategoryPopup } from '../../shared/components/add-category/income-category/add-income-category-popup';

@Component({
  selector: 'app-employee-product-form',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './employee-product-form.html',
  styleUrls: ['./employee-product-form.css']
})
export class EmployeeProductFormComponent implements OnInit {
 @ViewChild('f') formRef!: NgForm;
  @ViewChild('barcodeInput') barcodeInput!: ElementRef<HTMLInputElement>;
  
  addClicked: boolean = false;
  model = {
    product: "",
    category: "",
    quantity: 1,
    notes: '',
    paymentMethod: 'cash',
    date: new Date().toISOString().split('T')[0]
  };
  errorMessage: string = "";
  successMessage: string = "";
  barcodeValue: string = "";
  scanMode: 'manual' | 'barcode' = 'manual';

  categories!: {id: string, name: string}[];
  products!: {id: string, name: string, price: number, barcode?: string}[];
  allManagerProducts!: {id: string, name: string, price: number, barcode?: string, categoryId?: string}[];
  managerId: string | null = null;
  managerName: string = '';
  userId: string | null = null;

  paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'mobile', label: 'Mobile Payment' },
    { value: 'transfer', label: 'Bank Transfer' },
    { value: 'check', label: 'Check' },
    { value: 'other', label: 'Other' }
  ];

  constructor(private catDiagRef: MatDialog, private dash: DashboardService) {}

  async ngOnInit() {
    const currentUser = await this.dash.loadCurrentUser();
    if (!currentUser) {
      this.errorMessage = "User not authenticated";
      return;
    }
    this.userId = currentUser.id;

    this.managerId = await this.dash.getManagerId();
    
    if (!this.managerId) {
      this.errorMessage = "No manager found. You must be assigned to a manager to use this form.";
      return;
    }

    const managerInfo = await this.dash.getManagerInfo();
    if (managerInfo) {
      this.managerName = `${managerInfo.first_name} ${managerInfo.last_name}`;
    }

    await this.loadCategories();
    await this.loadAllManagerProducts();
  }

  async loadCategories() {
    try {
      this.categories = await this.dash.fetchManagerCategoriesByType('product');
      
      if (this.categories.length > 0) {
        this.model.category = this.categories[0].id;
        await this.onCategoryChange(this.model.category);
      } else {
        this.errorMessage = "No product categories available from your manager";
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      this.errorMessage = "Failed to load categories";
    }
  }

  async loadAllManagerProducts() {
    try {
      this.allManagerProducts = await this.dash.fetchAllManagerProducts();
    } catch (err) {
      console.error('Error loading all manager products:', err);
    }
  }

  toggleScanMode(mode: 'manual' | 'barcode') {
    this.scanMode = mode;
    this.barcodeValue = "";
    this.errorMessage = "";
    
    if (mode === 'barcode') {

      setTimeout(() => {
        if (this.barcodeInput) {
          this.barcodeInput.nativeElement.focus();
        }
      }, 100);
    }
  }

  onBarcodeInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const barcode = input.value.trim();
    
    if (barcode.length === 0) {
      this.model.product = "";
      return;
    }


    this.searchProductByBarcode(barcode);
  }

  onBarcodeKeyup(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const barcode = this.barcodeValue.trim();
      if (barcode) {
        this.searchProductByBarcode(barcode);
      }
    }
  }

  searchProductByBarcode(barcode: string) {
    const product = this.allManagerProducts.find(p => p.barcode === barcode);
    
    if (product) {
      // Produit trouvé !
      this.model.product = product.id;
      
      // Mettre à jour la catégorie si nécessaire
      if (product.categoryId && product.categoryId !== this.model.category) {
        this.model.category = product.categoryId;
        this.onCategoryChange(product.categoryId);
      }
      
      this.successMessage = `Product found: ${product.name}`;
      this.errorMessage = "";
      
      // Effacer le message après 2 secondes
      setTimeout(() => {
        this.successMessage = "";
      }, 2000);
    } else {
      // Produit non trouvé
      this.model.product = "";
      this.errorMessage = `No product found with barcode: ${barcode}`;
      
      // Effacer l'erreur après 3 secondes
      setTimeout(() => {
        this.errorMessage = "";
      }, 3000);
    }
  }

  clearBarcode() {
    this.barcodeValue = "";
    this.model.product = "";
    this.errorMessage = "";
    this.successMessage = "";
    
    if (this.barcodeInput) {
      this.barcodeInput.nativeElement.focus();
    }
  }

  animateAdd() {
    this.addClicked = true;
    setTimeout(() => this.addClicked = false, 700);
  }

  async onSubmit(f: NgForm): Promise<void> {
    if (f.invalid) {
      this.errorMessage = "Please fill all required fields";
      return;
    }

    if (!this.model.product) {
      this.errorMessage = "Please select a product";
      return;
    }

    if (this.model.quantity < 1) {
      this.errorMessage = "Quantity must be at least 1";
      return;
    }

    if (!this.model.paymentMethod) {
      this.errorMessage = "Please select a payment method";
      return;
    }

    if (!this.userId) {
      this.errorMessage = "User not authenticated";
      return;
    }

    try {
      // Récupérer le produit sélectionné
      let selectedProduct = this.products.find(p => p.id === this.model.product);
      
      // Si pas trouvé dans la liste courante, chercher dans tous les produits
      if (!selectedProduct) {
        selectedProduct = this.allManagerProducts.find(p => p.id === this.model.product);
      }
      
      if (!selectedProduct) {
        this.errorMessage = "Selected product not found";
        return;
      }

      const { error } = await this.dash.supabase.client
        .from('income_product')
        .insert([{
          product_id: this.model.product,
          quantity: this.model.quantity,
          date: this.model.date,
          notes: this.model.notes || null,
          paymentMethod: this.model.paymentMethod,
          scan_type: this.scanMode, // Enregistrer le mode de scan
          user_id: this.userId
        }]);

      if (error) {
        console.error('Error adding product sale:', error);
        this.errorMessage = "Failed to record sale: " + error.message;
        return;
      }

      this.successMessage = `Sale recorded: ${selectedProduct.name} x${this.model.quantity}`;
      this.errorMessage = "";
      
      // Réinitialiser
      this.resetForm(f);
      
      // Si en mode barcode, garder le focus sur l'input
      if (this.scanMode === 'barcode') {
        setTimeout(() => {
          if (this.barcodeInput) {
            this.barcodeInput.nativeElement.focus();
          }
        }, 100);
      }
      
      this.animateAdd();
      
      setTimeout(() => {
        this.successMessage = "";
      }, 3000);

    } catch (err: any) {
      console.error('Error in onSubmit:', err);
      this.errorMessage = "An error occurred while recording the sale";
    }
  }

  isDateInFuture(): boolean {
    const inputDate = new Date(this.model.date);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate > today;
  }

  openAddCategoryPopup() {
    const dialogRef = this.catDiagRef.open(addIncomeCategoryPopup, {
      width: '800px',
      panelClass: 'popup'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateCategories();
      }
    });
  }

  async updateCategories() {
    this.categories = await this.dash.fetchManagerCategoriesByType('product');
    
    if (this.categories.length > 0) {
      const categoryExists = this.categories.some(c => c.id === this.model.category);
      if (!categoryExists) {
        this.model.category = this.categories[0].id;
        await this.onCategoryChange(this.model.category);
      }
    }
  }

  async onCategoryChange(category: string) {
    if (!category) return;

    try {
      this.products = await this.dash.fetchManagerProductsByCategory(category);
      
      if (this.products.length > 0) {
        this.model.product = this.products[0].id;
      } else {
        this.model.product = "";
      }
    } catch (err) {
      console.error('Error loading products:', err);
      this.errorMessage = "Failed to load products";
      this.products = [];
    }
  }

  resetForm(f: NgForm) {
    f.reset(this.resetModel());
    this.model = this.resetModel();
    
    if (this.categories.length > 0) {
      this.model.category = this.categories[0].id;
      this.onCategoryChange(this.model.category);
    }
  }

  getProductPrice(): number {
    if (!this.model.product) return 0;
    
    let product = this.products.find(p => p.id === this.model.product);
    
    if (!product) {
      product = this.allManagerProducts.find(p => p.id === this.model.product);
    }
    
    return product?.price || 0;
  }

  getTotalAmount(): number {
    return this.getProductPrice() * (this.model.quantity || 0);
  }

  getSelectedProductName(): string {
    if (!this.model.product) return '';
    
    let product = this.products.find(p => p.id === this.model.product);
    
    if (!product) {
      product = this.allManagerProducts.find(p => p.id === this.model.product);
    }
    
    return product?.name || '';
  }
  resetModel() {
    return {
      product: "",
      category: "",
      quantity: 1,
      notes: '',
      paymentMethod: 'cash',
      date: new Date().toISOString().split('T')[0]
    };
  }
}