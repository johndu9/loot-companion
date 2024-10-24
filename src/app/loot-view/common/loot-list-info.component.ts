import { AfterViewInit, Component, ElementRef, Input, ViewChild } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { SCROLL_TOP_THRESHOLD } from "./loot-list.component";

@Component({
  selector: 'loot-list-info',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
<div #infoDiv class="loot-list-info">
  <div class="info-col">
    <span class="info-name mat-headline-small">{{name}}</span>
    <ng-content select="[info]"></ng-content>
  </div>
  <hr>
  <ng-content select="loot-list"></ng-content>
</div>
<button [style.visibility]="canScrollTop ? 'visible' : 'hidden'" class="scroll-top-button" mat-icon-button (click)="scrollTop()">
  <mat-icon class="material-symbols-outlined">arrow_upward</mat-icon>
</button>
`,
  styles: `
.loot-list-info {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: scroll;

  @media(min-width: 768px) {
    flex-direction: row;
    max-height: calc(100vh - 64px);
    overflow-y: auto;
  }
}

.info-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px;
  align-items: center;
  min-width: 280px;
}

.info-name {
  text-align: center;
  max-width: 264px;
  word-break: break-word;
  padding: 4px 8px 4px 8px !important;
  margin-bottom: 0;
  border-radius: 8px;
  border: solid 1px #c4c6d0;
}

hr {
  margin: 8px;
  color: #e0e2ec;
}

::ng-deep loot-list {
  flex-grow: 1;
  width: 100%;

  @media(min-width: 768px) {
    max-height: calc(100vh - 64px);
    overflow-y: auto;
  }
}

.scroll-top-button {
  position: fixed;
  bottom: 0;
  right: 0;
  margin: 16px;
}
`
})
export class LootListInfoComponent implements AfterViewInit {

  @Input({ required: true })
  name!: string;

  @ViewChild('infoDiv')
  el!: ElementRef;

  canScrollTop: boolean = false;

  ngAfterViewInit(): void {
    this.el.nativeElement.addEventListener('scroll', () => {
      this.canScrollTop = this.el.nativeElement.scrollTop > SCROLL_TOP_THRESHOLD;
    });
  }

  scrollTop() {
    this.el.nativeElement.scroll({top: 0, behavior: "smooth"});
  }
}