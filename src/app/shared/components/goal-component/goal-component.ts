import { NgStyle } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-goal-component',
  templateUrl: './goal-component.html',
  imports:[NgStyle],
  styleUrls: ['./goal-component.css']
})
export class GoalComponent implements OnChanges {
  @Input() title: string = 'Goal';          
  @Input() goal: number = 40000;            
  @Input() current: number = 31200;         
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
}
