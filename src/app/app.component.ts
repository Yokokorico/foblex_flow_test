import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FFlowModule } from '@foblex/flow';
import { DraggableFlowComponent } from "./draggable-flow/draggable-flow.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FFlowModule, DraggableFlowComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {

}
