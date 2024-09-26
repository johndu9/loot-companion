import { Component } from '@angular/core';

@Component({
  selector: 'not-found',
  standalone: true,
  imports: [],
  template: `
<div class="not-found">
  <span class="mat-headline-medium">Not found!</span>
</div>
`,
  styles: `
.not-found {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  margin-top: 16px;
}
`
})
export class NotFoundComponent {
  constructor() { }
}