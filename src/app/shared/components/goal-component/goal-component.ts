import { NgIf, NgStyle } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { addGoalPopup } from '../add-goal/add-goal-popup';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-goal-component',
  templateUrl: './goal-component.html',
  imports:[NgStyle, NgIf],
  styleUrls: ['./goal-component.css']
})
export class GoalComponent implements OnChanges {
  constructor(private dialog: MatDialog, private dash: DashboardService) {}
  @Input() goal!: number | null;
  @Input() current!: number;
  @Input() currency: string = '$';
  @Input() accent: string = '#A78BFA';

  // computed
  public percent: number = 0;
  public formattedGoal = '';
  public formattedCurrent = '';

  ngOnChanges(changes: SimpleChanges) {
    this.updateValues();
  }

  private updateValues() {
    const g = Number(this.goal) || 0;
    const c = Number(this.current) || 0;

    // avoid division by zero
    this.percent = g <= 0 ? 0 : Math.round((c / g) * 100);
    // clamp 0..100
    if (this.percent < 0) this.percent = 0;
    if (this.percent > 100) this.percent = 100;

    // formatting amounts (no decimals)
    this.formattedGoal = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(g);
    this.formattedCurrent = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(c);
  }

  // returns CSS width for the filled bar (string with %)
  public fillWidth(): string {
    return `${this.percent}%`;
  }

  addGoal() {
    const dialogRef = this.dialog.open(addGoalPopup, {
      width: '800px',
      panelClass: 'popup'
    });
    dialogRef.afterClosed().subscribe(r => this.updateGoal());
  }

  async updateGoal() {
    this.goal = await this.dash.fetchGoal();
    this.updateValues();
  }
}
