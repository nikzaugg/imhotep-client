import { Component, OnInit, AfterViewInit } from '@angular/core';
import {ScoreBoardService} from '../../shared/services/score-board/score-board.service';
import { Game } from '../../shared/models/game';
import { Player } from '../../shared/models/player';
let $ = require('../../../../node_modules/jquery/dist/jquery.slim.js');

import Timer = NodeJS.Timer;

declare var jQuery:any;

@Component({
  selector: 'score-board',
  templateUrl: './score-board.component.html',
  styleUrls: ['./score-board.component.css'],
  providers: [ScoreBoardService]
})
export class ScoreBoardComponent implements OnInit, AfterViewInit  {

  game:Game; // current game
  players: Player[]; // players of the current game

  private timoutInterval: number = 2000;
  private timoutId: Timer;

  constructor(private scoreBoardService:ScoreBoardService) {

  }


  ngOnInit(): void {
    this.game = JSON.parse(localStorage.getItem('currentGame'));
    this.updatePoints(this.game.id);

    /* POLLING */
    var that = this;
    this.timoutId = setInterval(function () {

      that.updatePoints(that.game.id);

    }, this.timoutInterval)
  }

  ngAfterViewInit():void{
    var clicked=true;
    $("#ScoreBoardDropDownClicker").on('click', function(){
      if(clicked)
      {
        clicked=false;
        $("#scoreBoard").css({"top": 0});
      }
      else
      {
        clicked=true;
        $("#scoreBoard").css({"top": "-200px"});
      }
    });

    $(document).click(function(){
      clicked = true;
      $("#scoreBoard").css({"top": "-200px"});
    });

    $("#ScoreBoardDropDownClicker").click(function(e){
      e.stopPropagation();
    });

  }

  // gets the updated Players and their points
  updatePoints(gameId:number):void{
    this.scoreBoardService.updatePoints(gameId)
        .subscribe(players => {
          if (players) {
            // updates the players array in this component
            this.players = players;
          } else {
            console.log("no players found");
          }
        })
  }

}
