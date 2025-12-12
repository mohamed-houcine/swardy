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
  @Input() bigPicture: boolean = false;
  @Input() currency!: string | undefined;
  @Input() withCurrency: boolean = true;
}
