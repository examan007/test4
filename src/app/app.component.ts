import { Component, NgZone, OnInit } from '@angular/core';
import 'zone.js/dist/zone';
import * as ContactObj from 'assets/contacts.js';
declare var System: any;
ContactObj.getContacts();
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'N4Contact';
    Contacts = ContactObj.getContacts();
    contactname = ContactObj.value;
    objects = [...ContactObj.getObjects()];
    template = ContactObj.getTemplate();
    results = [];
    objclass = 'text-muted';
    create() {
        this.Contacts.create(this.contactname);
    }
    updateObjects () {
        console.log('In Angular is ' + NgZone.isInAngularZone());
        this.objects = [...ContactObj.getObjects()];
        this.results = [...ContactObj.getResults()];
    }
    readSingleFile(obj, tag) {
        ContactObj.readSingleFile(obj, tag);
    }
    ngOnInit() {
        ContactObj.initContacts(this);
    }
}
