import { Component } from '@angular/core';

@Component({
  selector: 'about',
  standalone: true,
  imports: [],
  template: `
<div class="about">
  <span class="mat-body-medium"><a href="https://github.com/johndu9/loot-companion">GitHub Repository</a></span>
  <span class="mat-body-medium"><a href="https://gilarpgs.itch.io/loot-qs">LOOT Quickstart</a></span>
</div>
`,
  styles: `
.about {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  margin-top: 16px;
}
`
})
export class AboutComponent {
  constructor() { }
}