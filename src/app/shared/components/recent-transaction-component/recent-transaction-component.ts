import { Component } from '@angular/core';
import { Transaction, Type } from '../../model/transaction';
import { Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';


@Component({
  selector: 'app-recent-transaction-component',
  imports: [NgFor,NgIf],
  templateUrl: './recent-transaction-component.html',
  styleUrl: './recent-transaction-component.css',
})
export class RecentTransactionComponent {

  @Input() arr! : Transaction[];
  @Input() currency!: string | undefined;

  getIcon(t: Transaction) {
    if (t.type === Type.EXPENSE) return "/assets/icons/expense_1.svg  ";
    return "/assets/icons/wallet_1.svg";
  }

  getIconColor(t: Transaction) {
    return t.type === Type.EXPENSE ? "#ff6b6b" : "#6ed39e";
  }

  getAmountColor(t: Transaction) {
    return t.type === Type.EXPENSE ? "#ff3b30" : "#0db665";
  }

  getArrow(t: Transaction) {
    return t.type === Type.EXPENSE ? "/assets/icons/downtrend.svg" : "/assets/icons/trending.svg";
  }

  getbackgroundcolor(t:Transaction){
    return t.type === Type.EXPENSE ? "#FBF2EE" : "#EAFBF3";
  }
}


