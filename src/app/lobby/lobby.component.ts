import {Component, OnInit} from '@angular/core';
import {Game} from '../shared/models/game';
import {GameService} from "../shared/services/game.service";
import {User} from "../shared/models/user";
import Timer = NodeJS.Timer;

@Component({
    selector: 'app-lobby',
    templateUrl: './lobby.component.html',
    styleUrls: ['./lobby.component.css'],
    providers: [GameService],
})
export class LobbyComponent implements OnInit {
    games: Game[];
    user: User;
    private timoutInterval: number = 1000;
    private timoutId:Timer;

    constructor(private gameService: GameService) {
    }

    ngOnInit(): void {
        // get available games
        this.getGames();

        // get current logged in user
        this.user = JSON.parse(localStorage.getItem('currentUser'));

        var that = this;
       this.timoutId = setInterval(function () {
           that.getGames();
       }, this.timoutInterval)
    }

    ngOnDestrory(): void {
        clearInterval(this.timoutId);
    }

    // get list of games
    getGames(): void {
        //this.gameService.getGames().then(games => this.games = games);
       this.gameService.getGames()
        .subscribe(games => {this.games = games;})
    }

    // check whether a game is full or running
    isJoinable(status: String): boolean {
        // check if user owns one of the games
        for (var i = 0; i < this.games.length; i++) {
            if (this.games[i].owner === this.user.username) {
                return false;
            }
        }

        if(status === 'RUNNING') {
            return false;
        }
        return true;
    }

    // check if user owns a game
    isOwner(owner: String): boolean {
        // return true if the owner (input) is this the logged in user
        return owner === this.user.username;
    }

  /** This function is only for demonstration. It shows the behaviour of adding a new game.
   *  Later the add(name: string) function should trigger a POST request and register
   *  a new game on the server.
   *
   * @param name the name of the newly added game
   */
  add(name: string): void {
    name = name.trim();
    if (!name) { return; }
    var newGame = new Game();
    newGame.id = this.games.length+1;
    newGame.name = name;
    newGame.status = 'PENDING';
    newGame.amountOfPlayers = 1;
    this.games.push(newGame);
  }

}

/*

CODE FOR CHECKING IF USER OWNS A GAME WHEN LOBBY IS LOADED TO LATER DISABLE ALL JOIN BUTTONS

 // check if user owns one of the games
 for (var i = 0; i < this.games.length; i++) {
 if (this.games[i].owner === this.user.username) {
 this.isGameOwner = true;
 break;
 }
 }

// ADD THIS TO IS jOINABLE METHOD
 if (this.isGameOwner) {
 return false;
 }



 */

