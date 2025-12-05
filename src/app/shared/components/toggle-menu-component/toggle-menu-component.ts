import { NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-toggle-menu-component',
  imports: [NgIf, NgFor],
  templateUrl: './toggle-menu-component.html',
  styleUrl: './toggle-menu-component.css',
})
export class ToggleMenuComponent {
  constructor(private elementRef: ElementRef<HTMLElement>) {}
  @ViewChild('sortMenu') sortMenu!: ElementRef;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.sortingPostsMethodOpen) return;

    if (this.sortMenu && !this.sortMenu.nativeElement.contains(event.target)) {
      this.sortingPostsMethodOpen = false;
    }
  }
  years = [2023, 2024, 2025, 2026, 2027];
  selectedYear = 2025;

  sortingPostsMethodOpen = false;

  // new output to notify parent
  @Output() yearSelected = new EventEmitter<number>();

  toggleSortingMethodMenu(ev?: Event) {
    ev?.stopPropagation();
    this.sortingPostsMethodOpen = !this.sortingPostsMethodOpen;
  }

  selectYear(y: number) {
    this.selectedYear = y;
    this.toggleSortingMethodMenu();
    // emit selected year to parent
    this.yearSelected.emit(y);
  }
}
