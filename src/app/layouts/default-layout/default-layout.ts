// layouts/default-layout/default-layout.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InterfOptions } from "../../shared/components/interf-options/interf-options";

@Component({
  selector: 'app-default-layout',
  imports: [RouterOutlet, InterfOptions],
  templateUrl: './default-layout.html',
  styleUrl: './default-layout.css'
})
export class DefaultLayout {

}
