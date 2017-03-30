import { Component, OnInit } from '@angular/core';
import {UserService} from '../shared/services/user.service';
import {User} from '../shared/models/user';
import {Game} from '../shared/models/game';
import {BasicShip} from '../shared/models/basicShip';
import {MOCKSHIPS} from '../shared/models/mock-ships';
import {Player} from "../shared/models/player";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent  implements OnInit {
  users: User[] = [];
  currentPlayers: Player[];
  dummyShips: BasicShip[];
  game:Game;

  constructor(private userService: UserService) { }

  ngOnInit() {

    this.game = JSON.parse(localStorage.getItem('currentGame'));
    this.currentPlayers = this.game.players;
    // get users from secure api end point
    this.userService.getUsers()
      .subscribe(users => {
        this.users = users;
      });

    // load dummy/mock ships from model folder
    // TODO: get ships via polling of the game from the server
    this.dummyShips = MOCKSHIPS;
  }
}
