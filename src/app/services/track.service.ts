import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'

import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class TrackService {

  constructor(
    private readonly afs: AngularFirestore
  ) { }

  getDrivers() {
    let itemsCollection = this.afs.collection<any>('users');

    return itemsCollection.snapshotChanges()
      .pipe(
        map(changes => changes.map(({ payload: { doc } }) => {
          const data = doc.data();
          const id = doc.id
          return { id, ...data };
        })));

    // return itemsCollection.valueChanges().pipe(map((data: Taxista[]) => {
    //   return data;
    // }))
  }
}
