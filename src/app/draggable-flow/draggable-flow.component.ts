import { ChangeDetectionStrategy, ChangeDetectorRef, Component, output, ViewChild, ViewEncapsulation } from '@angular/core';
import { IPoint } from '@foblex/2d';
import { EFConnectionBehavior, EFMarkerType, FCanvasComponent, FCreateConnectionEvent, FFlowComponent, FFlowModule, IFFlowState } from '@foblex/flow';
import DragSelect from 'dragselect';
@Component({
  selector: 'draggable-flow',
  styleUrls: [ './draggable-flow.component.scss' ],
  templateUrl: './draggable-flow.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FFlowModule,
  ],
  host: {
    '(keydown)': 'onKeyDown($event)',
    'tabindex': '-1'
  }
})
export class DraggableFlowComponent {



  @ViewChild('flow') flowComponent!: FFlowComponent;
  public eConnectionBehaviour = EFConnectionBehavior;
  protected readonly eMarkerType = EFMarkerType;
  taches = [
    {mot_seq: '133', wft_seq:'12',ser_seq:'44', elt_seq:'2', mot_lib:'tache3',ell_step:'0', mot_pos_only:'N'}, 
    {mot_seq: '134', wft_seq:'12',ser_seq:'43', elt_seq:'1', mot_lib:'tache4',ell_step:'0', mot_pos_only:'N'}, 
    {mot_seq: '132', wft_seq:'12',ser_seq:'43', elt_seq:'2', mot_lib:'tache2',ell_step:'0', mot_pos_only:'N'}, 
    {mot_seq: '131', wft_seq:'12',ser_seq:'43', elt_seq:'1', mot_lib:'tache1',ell_step:'0', mot_pos_only:'N'}, 
  ]
  public guidTab: {guid: string, tache_ref: string, type: string}[] = [];
  public tacheDependanceTab: {tache_seq: string, tache_prec_seq:string, wft_seq:string}[] = [];
  public nodes: {guid:string, id: string, x: number, y: number, title: string}[] = [
    {guid: this.generateGUID("node", '1'), id: '1', x: 0, y: 0, title: 'I can only be connected to one input' },
    {guid: this.generateGUID("node", '2'), id: '2', x: 0, y: 150, title: 'I can be connected to multiple inputs' },
    {guid: this.generateGUID("node", '3'), id: '3', x: 300, y: 0, title: 'I can only be connected with one output' },
    {guid: this.generateGUID("node", '4'), id: '4', x: 300, y: 150, title: 'I can be connected with multiple outputs' },
    {guid: this.generateGUID("node", '5'), id: '5', x: 300, y: 300, title: 'I can be connected with multiple outputs' },
  ];
  @ViewChild(FCanvasComponent, { static: false })
  public fCanvas!: FCanvasComponent;
  public connections: {id: string, outputId: string, inputId: string }[] = [];
  constructor(
    private changeDetectorRef: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    // document.documentElement.classList.toggle('dark');
  }
  public onLoaded(): void {
    this.fCanvas.resetScaleAndCenter(false);
  }
  public addConnection(event: FCreateConnectionEvent): void {
    if(!event.fInputId) {
      return;
    }
    if(this.connections.find(connection => connection.inputId === event.fInputId && connection.outputId === event.fOutputId)) {
      return;
    }
    if(event.fInputId === event.fOutputId) {
      return;
    }
    this.connections.push({ id: this.generateGUID("connectoriD" , event.fOutputId), outputId: event.fOutputId, inputId: event.fInputId });
    this.changeDetectorRef.detectChanges();
  }

  public onDeleteConnections(): void {
    this.connections = [];
    this.changeDetectorRef.detectChanges();
  }
  public deleteOneConnection(outputId: string): void {
    this.connections = this.connections.filter(connection => connection.outputId !== outputId);
    this.changeDetectorRef.detectChanges();
  }


  getState() {
    const state = this.flowComponent.getState();
    state.connections.forEach(connection => {
      var tache_prec_seq_find = this.guidTab.find(guidTab => guidTab.guid === connection.fOutputId);
      var tache_seq_find = this.guidTab.find(guidTab => guidTab.guid === connection.fInputId);
      if(tache_prec_seq_find && tache_seq_find) {
        this.tacheDependanceTab.push({tache_seq: tache_seq_find.tache_ref ,tache_prec_seq: tache_prec_seq_find.tache_ref, wft_seq:"12"});
      }
    });
    
    const tacheSeqSet = new Set(this.tacheDependanceTab.map(item => item.tache_seq));

    // Étape 2 : Filtrer les tache_prec_seq qui ne sont pas dans l'ensemble des tache_seq (conserver les doublons)
      const extremities = this.tacheDependanceTab
        .filter(item => !tacheSeqSet.has(item.tache_prec_seq))
        .map(item => item.tache_prec_seq);

      // Étape 3 : Créer un nouvel objet pour chaque extrémité avec tache_prec_seq = -1
      const extremiteTab = extremities.map(tache => ({
        tache_seq: tache,
        tache_prec_seq: "-1",
        wft_seq: this.tacheDependanceTab.find(item => item.tache_prec_seq === tache)?.wft_seq || "default_wft"
      }));

      // Étape 4 : Supprimer les doublons
      // const uniqueExtremities = [...new Set(extremiteTab)];


      this.tacheDependanceTab.push(...extremiteTab);
      console.log("Tache dependance",this.tacheDependanceTab);
      
  }

  public onRemoveItems(): void {
    const selection = this.flowComponent.getSelection();
    
    if(selection.connections.length > 0) {
      selection.connections.forEach(selectedConnection => {
        console.log(selectedConnection);
        console.log(this.connections);
        
        const index = this.connections.findIndex(connection => connection.id == selectedConnection.toString());
        
        console.log('index', index);
        
        if (index !== -1) {
          // Supprimer l'élément à cet index
          this.connections.splice(index, 1);     

        }
      });
    }
    if(selection.nodes.length > 0) {
      
      selection.nodes.forEach(selectedNode => {
        const index = this.nodes.findIndex(node => node.guid == selectedNode.toString());
    
        if (index !== -1) {
          // Supprimer l'élément à cet index
          this.nodes.splice(index, 1);     
          // Supprimer les connexions qui pointent sur cet élément ou qui sont connectés à cet élément
          this.connections = this.connections.filter(connection => 
            connection.inputId !== selectedNode.toString() && connection.outputId !== selectedNode.toString()
          );
        }
      });
    }
    this.changeDetectorRef.detectChanges();
  }

  public onKeyDown(event: KeyboardEvent): void {
    const $event = event as KeyboardEvent;
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }
    switch ($event.key) {
      case "Backspace":
      case "Delete":
        this.onRemoveItems();        
        break;
    }
  }

  addNode(_t2: { mot_seq: string; wft_seq: string; ser_seq: string; elt_seq: string; mot_lib: string; ell_step: string; mot_pos_only: string; }) {
    const nodeToAdd = {guid: this.generateGUID("node", _t2.mot_seq), id:_t2.mot_seq, x: -600, y: -200, title: _t2.mot_lib };
    this.nodes.push(nodeToAdd);
    this.changeDetectorRef.detectChanges();
  }


  setNodePosition($event: IPoint,guidNodeMoved: string) {    
    const node = this.nodes?.find(node => node.guid === guidNodeMoved);
    if (node) {
      node.x = $event.x;
      node.y = $event.y;
    }
    this.changeDetectorRef.detectChanges();
  }

  generateGUID(type: string,tache_ref: string = "none", ): string {
    const newGuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxx'.replace(/[xy]/g, function (char) {
      const random = (Math.random() * 16) | 0;
      const value = char === 'x' ? random : (random & 0x3) | 0x8;
      return value.toString(16);
    });
    
    this.guidTab.push({guid: newGuid,tache_ref: tache_ref, type:type});
    return newGuid;
  }
}