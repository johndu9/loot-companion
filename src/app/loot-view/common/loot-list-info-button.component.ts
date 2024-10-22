import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'loot-list-info-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
<button
  class="loot-list-info-button"
  [class.mat-warn]="isWarn"
  [disabled]="isDisabled"
  mat-flat-button
  (click)="buttonPressed.emit($event)">
  <mat-icon class="material-symbols-outlined">{{icon}}</mat-icon>
  {{text}}
</button>
`,
  styles: `
.loot-list-info-button {
  width: 246px;
}
`
})
export class LootListInfoButtonComponent {
  @Input({ required: true })
  icon!: string;

  @Input({ required: true })
  text!: string;

  @Input()
  isWarn: boolean = false;

  @Input()
  isDisabled: boolean = false;

  @Output()
  buttonPressed = new EventEmitter<MouseEvent>();
}
