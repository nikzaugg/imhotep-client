import {Injectable, isDevMode} from '@angular/core';
import {Http, Headers, RequestOptions, Response} from "@angular/http";
import {AuthenticationService} from "./authentication.service";
import {Observable} from "rxjs";
import {User} from "../models/user";

@Injectable()
export class UserService {
  private apiUrl:string;

  constructor(
    private http: Http,
    private authenticationService: AuthenticationService) {

    //TODO fill in your heroku-backend URL
    if (isDevMode()) {
      this.apiUrl = 'http://localhost:8080';
    } else {
      this.apiUrl = 'https://sopra-fs17-group09.herokuapp.com';
    }
  }

  getUsers(): Observable<User[]> {
    // add authorization header with token
    let headers = new Headers({ 'Authorization': 'Bearer ' + this.authenticationService.token });
    let options = new RequestOptions({ headers: headers });

    // get users from api
    return this.http.get(this.apiUrl +'/users', options)
      .map((response: Response) => response.json());
  }
}

