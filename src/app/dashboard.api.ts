import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { catchError, finalize } from 'rxjs/operators';



@Injectable({
    providedIn: 'root'
})

export class DashboardApi {

    readonly apiDataQueryInventory = './assets/test.json';
    readonly tranactionDetail = './assets/transaction.json';

    constructor(
        private http: HttpClient) {
    }

    public getInventory(): Observable<any> {
        return this.http.get<any>(this.apiDataQueryInventory)
            .pipe(
                map(res => {
                    // console.log('res ', res)
                    return res;
                }),
                catchError(error => {
                    throw error;
                }),
            );
    }

    public getTransactions(): Observable<any> {
        return this.http.get<any>(this.tranactionDetail)
            .pipe(
                map(res => {
                    //  console.log('res ', res)
                    return res;
                }),
                catchError(error => {
                    throw error;
                }),
            );
    }
}