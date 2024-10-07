import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraggableFlowComponent } from './draggable-flow.component';

describe('DraggableFlowComponent', () => {
  let component: DraggableFlowComponent;
  let fixture: ComponentFixture<DraggableFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraggableFlowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DraggableFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
