import { Component } from '@angular/core';
import { Transaction, Type } from '../../model/transaction';
import { IncomeType } from '../../model/income';
import { Input } from '@angular/core';
import { NgFor } from '@angular/common';


@Component({
  selector: 'app-recent-transaction-component',
  imports: [NgFor],
  templateUrl: './recent-transaction-component.html',
  styleUrl: './recent-transaction-component.css',
})
export class RecentTransactionComponent {

  @Input() arr : Transaction[] = [
    {
      amount: 500,
      date: "12 Nov. 2025",
      name: "Product - Monitor OLED",
      type: Type.INCOME,
      incomeType: IncomeType.PRODUCT
    },
    {
      amount: 800,
      date: "10 Nov. 2025",
      name: "Electricity Bill",
      type: Type.EXPENSE
    },
    {
      amount: 750,
      date: "12 Nov. 2025",
      name: "Product - Laptop Lenovo Ideapad",
      type: Type.INCOME,
      incomeType: IncomeType.PRODUCT
    }
  ];

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


