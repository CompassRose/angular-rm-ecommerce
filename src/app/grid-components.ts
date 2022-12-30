import { Component, OnDestroy } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';


@Component({
    selector: 'btn-cell-renderer',
    template: `
    <button class='btn btn-primary btn-sm' (click)="btnClickedHandler($event)">Select</button>`,
})
export class BtnCellRenderer implements ICellRendererAngularComp, OnDestroy {
    private params: any;

    agInit(params: any): void {
        // console.log('params ', params)
        this.params = params;
    }

    refresh(params?: any): boolean {
        return true;
    }

    btnClickedHandler(event: any) {
        alert(`Flight # ${this.params.data.flightNumber} \nFrom: ${this.params.data.origin} To: ${this.params.data.destination}\nOn: ${this.params.data.departureDate}\nwas activated`);
    }

    ngOnDestroy() {
        // no need to remove the button click handler 
        // https://stackoverflow.com/questions/49083993/does-angular-automatically-remove-template-event-listeners
    }

}
