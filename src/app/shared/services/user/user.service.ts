import {Injectable, isDevMode} from '@angular/core';

// requests
import {Http, Headers, RequestOptions, Response} from "@angular/http";
import {Observable} from "rxjs";
import {environment} from '../../../../environments/environment';

// services
import {AuthenticationService} from "../authentication/authentication.service";

// models
import {User} from "../../models/user";

@Injectable()
export class UserService {
    private apiUrl: string;

    constructor(private http: Http,
                private authenticationService: AuthenticationService) {
        this.apiUrl = environment.apiUrl;
    }

    getUsers(): Observable<User[]> {
        // add authorization header with token
        let headers = new Headers({'Authorization': 'Bearer ' + this.authenticationService.token});
        let options = new RequestOptions({headers: headers});

        const url = `/users`;

        // get users from api
        return this.http.get(this.apiUrl + url, options)
            .map((response: Response) => response.json());
    }
}
