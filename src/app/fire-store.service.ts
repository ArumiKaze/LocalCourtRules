import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, Subject } from 'rxjs';

export interface CourtRule {
  pdfLink: string;
  pdfName: string;
  state: string;
  websiteName: string;
}

@Injectable({
  providedIn: 'root'
})
export class FireStoreService{

  subjectStateFilter$ = new Subject<Observable<CourtRule[]>>();
  queryRules$!: Observable<CourtRule[]>;

  constructor(private firestore: AngularFirestore) { }

  QueryState(state: string) {
    this.queryRules$ = this.firestore.collection<CourtRule>("rules", ref => ref.where("state", '==', state)).valueChanges();
    this.subjectStateFilter$.next(this.queryRules$);
  }
}