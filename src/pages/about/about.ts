import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Task } from '../../Models/Task';
import { SQLite,SQLiteObject } from '@ionic-native/sqlite';
import { HomePage } from '../home/home';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  task: Task = new Task()
  constructor(public navCtrl: NavController, private sqlite: SQLite) {}
  addTask() {
    // alert(this.task.notification+""+this.task.category)
    this.sqlite.create({
      name: 'tasks.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('INSERT INTO task VALUES(NULL,?,?,?,?,?)',[this.task.title,this.task.date,this.task.time,this.task.details,this.task.notification])
        .then(res => {
          this.navCtrl.setRoot(HomePage);
          let Buttonhome= document.getElementById("tab-t0-0").firstElementChild
          Buttonhome.setAttribute("ng-reflect-is-active", "true");
          let Buttonadd= document.getElementById("tab-t0-1").firstElementChild
          Buttonadd.setAttribute("ng-reflect-is-active", "false");
          let home= document.getElementById("tab-t0-0")
          home.setAttribute("aria-selected", "true");
          let add= document.getElementById("tab-t0-1")
          add.setAttribute("aria-selected", "false");
        })
        .catch(e => {
          alert("erreur ajout");
        });
    }).catch(e => {
      alert(e);
    });
  }
}
