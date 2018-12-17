import { Component } from '@angular/core';
import { NavController, AlertController, Platform } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { BackgroundMode } from '@ionic-native/background-mode';
import 'rxjs/add/observable/interval';
import { Observable } from 'rxjs/Observable';
import { CalendarComponentOptions, DayConfig } from 'ion2-calendar';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  _daysConfig: DayConfig[] = [];
  dateMulti: any[];
  type: 'string'; // 'string' | 'js-date' | 'moment' | 'time' | 'object'
  optionsMulti: CalendarComponentOptions = {
    pickMode: 'multi',
    daysConfig: this._daysConfig,
  };

  tasks: any = [];
  days: any [];
  class=["purple","blue","orange","pink","green"]
  task= { id:0, title:"", details:"", date:"", time:""}
  day: number; month:number; year:number; hour: number; minutes: number
  
  private timer;
  constructor(public backgroundMode : BackgroundMode ,public platform: Platform,public localNotifications: LocalNotifications,public alertCtrl: AlertController,public navCtrl: NavController,private sqlite: SQLite) { 
   this.backgroundFunction()
  }

  ionViewWillEnter() {
    this.getData();
  }
  backgroundFunction(){
    this.backgroundMode.setDefaults({
      title: "Tasks App est en éxécution",
      text: "Clickez ici pour reprendre l'application",
  })
    this.backgroundMode.enable();
    this.backgroundMode.on("activate").subscribe(()=>{
      this.timer = Observable.interval(30000)
      this.timer.subscribe((t) => this.getData());
    });
  }
  getData() {
    let currentdate = new Date();
    this.sqlite.create({
      name: 'tasks.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('CREATE TABLE IF NOT EXISTS task(id INTEGER PRIMARY KEY, title TEXT, date TEXT, time TEXT, details TEXT, notification TEXT)', [])
      .catch(e => alert("erreur table"));
      db.executeSql('SELECT * FROM task ORDER BY date', [])
      .then(res => {
        this.tasks = [];
        this.days=[];
        this.dateMulti=[]
        for(var i=0; i<res.rows.length; i++) {
          this.days.push(res.rows.item(i).date.substring(8, 10))
          this.day=res.rows.item(i).date.substring(8, 10)
          this.month=res.rows.item(i).date.substring(5, 7)
          this.year=res.rows.item(i).date.substring(0, 4)
          this.hour=res.rows.item(i).time.substring(0, 2)
          this.minutes=res.rows.item(i).time.substring(3, 5)
          if(this.month == (currentdate.getMonth() + 1)){
            this.tasks.push({id:res.rows.item(i).id,title:res.rows.item(i).title,date:res.rows.item(i).date,time:res.rows.item(i).time,details:res.rows.item(i).details,notification:res.rows.item(i).notification,class:this.class[i % 5]})
          }
          var d = new Date(this.year, this.month, this.day, this.hour, this.minutes).toLocaleDateString('en-US', { hour12: false,hour: "numeric",minute: "numeric"});
          var currentD = new Date(currentdate.getFullYear(), currentdate.getMonth() + 1, currentdate.getDate(), currentdate.getHours() +1, currentdate.getMinutes()).toLocaleDateString('en-US', { hour12: false,hour: "numeric",minute: "numeric"});
          if( (d==currentD) && (res.rows.item(i).notification)){
            // this.backgroundMode.moveToForeground();
            this.backgroundMode.wakeUp();
            let now = new Date().getTime();
            let time1=new Date(now);
            this.localNotifications.schedule({
              id: res.rows.item(i).id,
              text: res.rows.item(i).title,
              trigger: {at: time1},
              sound: this.setSound(),
              vibrate: true,
              led: 'FF0000' 
           });
          }
          this.dateMulti.push(res.rows.item(i).date)
          this._daysConfig.push({ date: new Date(res.rows.item(i).date), cssClass: 'dark-'+this.class[i % 5], })
        }
      })
      .catch(e => alert("erreur affichage"));
    }).catch(e => alert("erreur connexion"));
  }
  detailsTask(task){
    this.task.title=task.title
    this.task.details=task.details
    this.task.date=task.date
    this.task.time=task.time
    let overlay= document.getElementById('popup1')
    overlay.classList.add("active")
  }

  closeDetails(){
    let overlay= document.getElementById('popup1')
    overlay.classList.remove("active")
  }
  delete(event,id) {
    var c=event.target
    if(event.direction == 4 ) {
      c.classList.add("slide-right")
      // var r = confirm("Voulez-vous vraiment supprimer cet Task !!!");
      // if (r == true) {
      // }
      setTimeout(() => {
        this.sqlite.create({
          name: 'tasks.db',
          location: 'default'
        }).then((db: SQLiteObject) => {
          db.executeSql('DELETE FROM task WHERE id=?', [id])
          .then(res => {
            this.getData();
          })
          .catch(e => alert(e));
        }).catch(e => alert(e));
      }, 500);
      
    }
  }
  setSound() {
    if (this.platform.is('android')) {
      return 'file://assets/sounds/notification.mp3'
    }
  }
  monthChange(e){
    this.sqlite.create({
      name: 'tasks.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('CREATE TABLE IF NOT EXISTS task(id INTEGER PRIMARY KEY, title TEXT, date TEXT, time TEXT, details TEXT, notification TEXT)', [])
      .catch(e => alert("erreur table"));
      db.executeSql('SELECT * FROM task ORDER BY date', [])
      .then(res => {
        this.tasks = [];
        this.days=[];
        for(var i=0; i<res.rows.length; i++) {
          this.month=res.rows.item(i).date.substring(5, 7)
          this.year=res.rows.item(i).date.substring(0, 4)
          if(this.month == (e.newMonth.months) && this.year == e.newMonth.years){
            this.days.push(res.rows.item(i).date.substring(8, 10))
            this.tasks.push({id:res.rows.item(i).id,title:res.rows.item(i).title,date:res.rows.item(i).date,time:res.rows.item(i).time,details:res.rows.item(i).details,notification:res.rows.item(i).notification,class:this.class[i % 5]})
          }
        }
      })
      .catch(e => alert("erreur affichage"));
    }).catch(e => alert("erreur connexion"));
  }
}
