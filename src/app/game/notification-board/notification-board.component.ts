import {Component, OnInit, AfterViewInit, Input, Output, OnDestroy, OnChanges, EventEmitter} from '@angular/core';

// polling
import {componentPollingIntervall} from '../../../settings/settings';
import Timer = NodeJS.Timer;

// services
import {NotificationBoardService} from '../../shared/services/notification-board/notification-board.service';
import {Page} from "../../shared/models/page";
import {PageElement} from "../../shared/models/page-element";
// others
let $ = require('../../../../node_modules/jquery/dist/jquery.slim.js');

@Component({
    selector: 'notification-board',
    templateUrl: './notification-board.component.html',
    styleUrls: ['./notification-board.component.css'],
    providers: [NotificationBoardService]
})
export class NotificationBoardComponent implements OnInit, AfterViewInit {

    gameLog: Page;
    gameMessages: PageElement[] = [];
    stagedMessages: PageElement[] = [];
    detailMove: PageElement = new PageElement();
    lastMove: PageElement = new PageElement;
    messagesInitialised: boolean = false;

    gameName: string;
    gameId: number;

    showMove: boolean = false;
    moveMade: boolean = false;
    isHoveringPopup: boolean = false;
    shipHasSailed: boolean = false;

    // polling
    private timeoutId: Timer;
    private timeoutInterval: number = componentPollingIntervall;

    constructor(private notificationBoardService: NotificationBoardService) {
    }

    ngOnInit() {
// get game id from local storage
        let game = JSON.parse(localStorage.getItem('game'));
        this.gameName = game.name;
        this.gameId = game.id;

        this.updateLastMovePopup();
        this.updateGameLog(this.gameId);
        // polling
        let that = this;
        this.timeoutId = setInterval(function () {
            that.updateGameLog(that.gameId);
        }, this.timeoutInterval)
    }

    ngAfterViewInit(): void {
        var clicked = true;
        $("#notificationBoardDropDownClicker").on('click', function () {
            if (clicked) {
                clicked = false;
                $("#notifications").css({"right": "35px"});
            }
            else {
                clicked = true;
                $("#notifications").css({"right": "-500px"});
            }
        });

        $(document).click(function () {
            clicked = true;
            $("#notifications").css({"right": "-500px"});
        });

        $("#notificationBoardDropDownClicker").click(function (e) {
            e.stopPropagation();
        });

    }

    updateGameLog(gameId: number): void {
        this.notificationBoardService.updateGameLog(gameId)
            .subscribe(Page => {
                if (Page) {
                    if (Page.content.length > 0) {
                        // updates the players array in this component
                        this.gameLog = Page;
                        if (!this.messagesInitialised) {
                            this.stagedMessages = Page.content;
                            this.gameMessages = Page.content;
                            this.lastMove = Page.content[0];
                            this.updateLastMovePopup();
                            this.messagesInitialised = true;
                        }
                        this.compareChanges(Page);
                    }
                } else {
                    console.log("no messages found");
                }
            })
    }

    compareChanges(page: Page): void {
        let changesMade: boolean = false;

        if (page.content.length > 0) {
            for (var i = 0; i < page.content.length; i++) {
                if (page.content[i].id != this.stagedMessages[i].id) {
                    changesMade = true;
                    break;
                }
            }
            if (changesMade) {
                this.gameMessages = page.content;
                this.stagedMessages = page.content;
            }

            if (this.gameMessages[0] != undefined) {
                if (this.lastMove.id != this.gameMessages[0].id) {
                    this.lastMove = page.content[0];
                    this.updateLastMovePopup();
                }
            }
        }
    }

    showMoveDetails(message: PageElement): void {
        this.detailMove = message;
        this.showMove = true;

        switch (message.moveType) {
            case 'PLACE_STONE':
                this.highlightPlaceStoneMove(message);
                break;
            case 'GET_STONES':
                this.highlightGetStoneMove(message);
                break;
            case 'SAIL_SHIP':
                this.highlightSailMove(message);
                break;
            case 'GET_CARD':
                this.highlightGetCardMove(message);
                break;
            case 'PLAY_CARD':
                this.highlightPlayCardMove(message);
                break;
        }
    }

    highlightPlaceStoneMove(message: PageElement): void {
        var $exists = $('#ship' + message.shipId).children().length > 0;
        if ($exists) {
            let ship = document.getElementById("ship" + message.shipId);
            let count = $('#ship' + message.shipId + ' .ship-middle .place').length;
            let position = count - message.placeOnShip + 1;
            $('.ship-container').css("opacity", "0.5");
            $('.harbor-container').css("z-index", "600");
            $('#supplySled' + message.playerNr + ' .player').css("z-index", "600");


            ship.style.opacity = "1.0";
            ship.style.backgroundColor = "grey";
            ship.style.border = "1px solid lime";
            ship.style.borderRadius = "5px";
            ship.style.zIndex = "1000";

            $('#ship' + message.shipId + ' .ship-middle .place:nth-child(' + position + ') .stone').css("border", "2px solid lime");
        } else {
            this.shipHasSailed = true;
            $('#supplySled' + message.playerNr + ' .player').css("z-index", "600");
        }
    }

    highlightGetStoneMove(message: PageElement): void {
        let sled = document.getElementById("supplySled" + message.playerNr);

        sled.style.backgroundColor = "grey";
        sled.style.border = "1px solid lime";
        sled.style.borderRadius = "5px";
        sled.style.zIndex = "1000";
    }

    highlightSailMove(message: PageElement): void {
        $('#supplySled' + message.playerNr + ' .player').css("z-index", "1000");
        console.log("ship sailed");
    }

    highlightGetCardMove(message: PageElement): void {
        $('#supplySled' + message.playerNr + ' .player').css("z-index", "1000");
    }

    highlightPlayCardMove(message: PageElement): void {
        $('#supplySled' + message.playerNr + ' .player').css("z-index", "1000");
    }



    hideMoveDetails(message: PageElement): void {
        this.detailMove = null;
        this.showMove = false;

        switch (message.moveType) {
            case 'PLACE_STONE':
                this.hidePlaceStoneMove(message);
                break;
            case 'GET_STONES':
                this.hideGetStoneMove(message);
                break;
            case 'SAIL_SHIP':
                this.hideSailMove(message);
                break;
            case 'GET_CARD':
                this.hideGetCardMove(message);
                break;
            case 'PLAY_CARD':
                this.hidePlayCardMove(message);
                break;
        }
    }

    hidePlaceStoneMove(message: PageElement): void {
        var $exists = $('#ship' + message.shipId).children().length > 0;
        if ($exists) {
            let ship = document.getElementById("ship" + message.shipId);
            let count = $('#ship' + message.shipId + ' .ship-middle .place').length;
            let position = count - message.placeOnShip + 1;
            $('.ship-container').css("opacity", "1");
            $('.harbor-container').css("z-index", "0");
            $('#supplySled' + message.playerNr + ' .player').css("z-index", "20");

            ship.style.opacity = "1.0";
            ship.style.backgroundColor = "transparent";
            ship.style.border = "none";
            ship.style.borderRadius = "none";

            $('#ship' + message.shipId + ' .ship-middle .place:nth-child(' + position + ') .stone').css("border", "none");
            //$('#ship'+message.shipId+' .ship-middle .place:nth-child('+ position).css("border", "none");
        } else {
            $('#supplySled' + message.playerNr + ' .player').css("z-index", "20");
            this.shipHasSailed = false;
        }
    }

    hideGetStoneMove(message: PageElement): void {
        let sled = document.getElementById("supplySled" + message.playerNr);

        sled.style.opacity = "1.0";
        sled.style.backgroundColor = "transparent";
        sled.style.border = "none";
        sled.style.borderRadius = "none";
        sled.style.zIndex = "auto";
    }

    hideSailMove(message: PageElement): void {
        $('#supplySled' + message.playerNr + ' .player').css("z-index", "20");
    }

    hideGetCardMove(message: PageElement): void {
        $('#supplySled' + message.playerNr + ' .player').css("z-index", "20");
    }

    hidePlayCardMove(message: PageElement): void {
        $('#supplySled' + message.playerNr + ' .player').css("z-index", "20");
    }

    updateLastMovePopup(): void {
        if (!this.isHoveringPopup) {
            $("#lastMovePopup").removeClass("step");
            setTimeout(function () {
                $("#lastMovePopup").addClass("step");
            }, 5000);
        }
    }

    displayPopup(lastMove: PageElement): void {
        this.isHoveringPopup = true;
        this.showMoveDetails(lastMove);
        $("#lastMovePopup").removeClass("step");
    }

    hidePopup(lastMove: PageElement): void {
        this.isHoveringPopup = false;
        this.hideMoveDetails(lastMove);
        $("#lastMovePopup").addClass("step");
    }

}
