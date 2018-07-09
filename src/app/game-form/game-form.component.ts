import { Component, OnInit } from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth, AngularFireAuthModule } from 'angularfire2/auth';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { moveIn, fallIn, moveInLeft } from '../router.animations';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, docChanges } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { forEach } from '@firebase/util';

interface Player {
  UserName: string;
  acctId: string;
  isAdmin: boolean;
  winTypes: {
    '1PlayerWins': number,
    '2PlayerWins': number,
    '3PlayerWins': number,
    '4PlayerWins': number,
    '5PlayerWins': number,
    '6PlayerWins': number
  }
  totalWins:number;
  totalVictoryPoints: number;
  winPercent: number;
  gamesPlayed: number;
}
class Game {
  date: Date;
  numPlayers: number;
  players: string[];
  winner: string;
}

interface Room {
  games: string[];
  players: string[];
  name: string;
  pass: string;
  minPlayers: number;
  maxPlayers: number;
}

@Component({
  selector: 'app-game-form',
  templateUrl: './game-form.component.html',
  styleUrls: ['./game-form.component.scss'],
  animations: [moveIn(), fallIn(), moveInLeft()]
})
export class GameFormComponent implements OnInit {

  numPlayers: number;
  playersCol: AngularFirestoreCollection<Player>;
  players: Observable<Player[]>;
  gamePlayers: any[];
  roomDoc: AngularFirestoreDocument<Room>;
  currentRoom: Observable<Room>;
  roomId: string;
  winnerSelect: any;
  gForm:FormGroup;
  game: Game;
  temp : number = 0;
  winTypes: {};
  gameType:any;
  minPlayers: number;
  maxPlayers: number;
  winnerGLobal: AngularFirestoreDocument<Player>;
  winnerGlobalVC: Observable<Player>;
  globalWins: number;
  winner:any;
  error:string;

  constructor(public af: AngularFireAuth,private router: Router, private afs: AngularFirestore, private route: ActivatedRoute, private fb: FormBuilder) {
    this.winTypes = {};
    this.gForm = fb.group({
    'numPlayers' : [null, Validators.required],
    'gamePlayers' : new FormArray([]),
    'winner' : [null, Validators.required],
    'validate' : ''
  });
  }

  addGame(game){
    this.game = new Game();
    this.game.players = this.gamePlayers;
    this.game.date = new Date();
    this.game.numPlayers = this.gamePlayers.length;
    this.game.winner = JSON.parse(this.winner).UserName;
    this.updateWinnerStats();
    this.updateAllStats();
    try {
      this.afs.collection('Rooms/' + this.roomId+'/Games/').add({'date':this.game.date, 'players':this.game.players, 'numPlayers':this.game.numPlayers, 'winner':this.game.winner});
    } catch (e){
      this.afs.collection('Rooms/' + this.roomId+'/Games/').doc('game1').set({'date':this.game.date, 'players':this.game.players, 'numPlayers':this.game.numPlayers, 'winner':this.game.winner});
    }
    this.goBack();
  }

  updateWinnerStats() {
    var winman = JSON.parse(this.winner);
    this.currentRoom.subscribe(room => {
      this.minPlayers = room.minPlayers;
      this.maxPlayers = room.maxPlayers;
      for(var i = this.minPlayers; i <= this.maxPlayers; i++){
        if(this.gamePlayers.length == i){
          this.winTypes[i+'PlayerWins'] = winman.winTypes[i+'PlayerWins'] +1;
        } else {
          this.winTypes[i+'PlayerWins'] = winman.winTypes[i+'PlayerWins'];
        }
      }
      this.afs.doc('Rooms/'+this.roomId+'/Players/'+winman.acctId).update({'winTypes':this.winTypes});
    });
    
    this.winnerGLobal = this.afs.doc('Players/'+winman.acctId);
    this.winnerGlobalVC = this.winnerGLobal.valueChanges();
    this.winnerGlobalVC.take(1).subscribe(playerW => {
      this.globalWins = playerW.totalWins;
      this.winnerGLobal.update({'totalWins': this.globalWins +1});
    });
    this.afs.doc('Rooms/'+this.roomId+'/Players/'+winman.acctId).update({'totalWins':winman.totalWins+1});
  }

  async updateAllStats() {
    await Promise.all(this.gamePlayers.map(async (p:any) => {
      const pDocumentRef = this.afs.doc(`Players/`+JSON.parse(p).acctId).ref;
      await this.afs.firestore.runTransaction(transaction => {
        return transaction.get(pDocumentRef).then(memberDoc => {
          transaction.update(pDocumentRef, {'gamesPlayed':memberDoc.get('gamesPlayed')+1});//update projects on each member
        });
      });
      const gDocumentRef = this.afs.doc(`Rooms/`+this.roomId+'/Players/'+JSON.parse(p).acctId).ref;
      await this.afs.firestore.runTransaction(transaction => {
        return transaction.get(gDocumentRef).then(memberDoc => {
          transaction.update(gDocumentRef, {'gamesPlayed':memberDoc.get('gamesPlayed')+1});//update projects on each member
        });
      });
    }));
    
  }

  goBack() {
    this.router.navigate(['/room', {'roomId':this.roomId}]);
  }

  ngOnInit() {
    this.gamePlayers = [];
    this.route.paramMap.subscribe((params: ParamMap) => {
      let id = params.get('roomId');
      this.roomId = id;
    });
    
    this.getRoomInfo();
    
    this.currentRoom.subscribe(room => {
      this.minPlayers = room.minPlayers;
      this.maxPlayers = room.maxPlayers;
    });

    this.numPlayers = 2;
  }

  getRoomInfo() {
    this.roomDoc = this.afs.doc('Rooms/' + this.roomId);
    this.currentRoom = this.roomDoc.valueChanges();
    this.getPlayersInfo();
  }

  getPlayersInfo() {
    this.playersCol = this.afs.collection('Rooms/'+this.roomId+'/Players/');
    this.players = this.playersCol.valueChanges();
  }

  onCheckChange(event) {
    /* Selected */
    if(event.target.checked){
      // Add a new control in the arrayForm
      this.gamePlayers.push(event.target.value);
    }
    /* unselected */
    else{
      // find the unselected element
      let i: number = 0;
  
      this.gamePlayers.forEach((player: string) => {
        if(player == event.target.value) {
          // Remove the unselected element from the arrayForm
        var index = this.gamePlayers.indexOf(event.target.value);
        if (index > -1) {
          this.gamePlayers.splice(index,1);
        }
        return;
        }
        i++;
      });
    }
    this.temp = this.gamePlayers.length;
    console.log(this.gamePlayers);
  }

  isChecked(name) {
    for(let player of this.gamePlayers){
      if(JSON.parse(player).UserName == name){
        return false;
      }
    }
    return true;
  }

}
