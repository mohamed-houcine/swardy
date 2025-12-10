import { Component,Input } from '@angular/core';

@Component({
  selector: 'app-total-component',
  imports: [],
  templateUrl: './total-component.html',
  styleUrl: './total-component.css',
})
export class TotalComponent {
  @Input() color!: string;       
  @Input() title!: string;
  @Input() value!: string | number;
  @Input() imagePath!: string;
  @Input() withCurrency: boolean = true;
  @Input() bigPicture: boolean = false;
}
