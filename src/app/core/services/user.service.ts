import { Injectable, signal } from '@angular/core';
import { User } from '../../shared/model/classes/user';

@Injectable({
  providedIn: 'root' // ensures it is global/ singleton: design pattern
})
export class UserService {

  // global user 
  currentUser = signal<User | null>({
    /** initial object: mock data */
    userID: '1',
    fullName: 'Ismail Mechkene',
    email: 'test@gmail.com',
    bio: 'dfjsdhjfgsdf',
    avatarImg: 'assets/avatars/avatar-example.jpg',
    coverImg: '',
    followers: [],
    following: [],
    journeys: [],
    spacesCreated: [],
    spacesJoined: [],
    getUser: function (): User {
      throw new Error('Function not implemented yet.');
    },
    editProfile: function (user: User): void {
      throw new Error('Function not implemented yet.');
    }
  });
  

  constructor() {}

  // Set user after checking the JWT token data and fetching user data
  // JWT token would return usually the userID
  setUser(user: User) {
    // set the current user: here
    this.currentUser.set(user);
  }

  // clear user on logout
  clearUser() {
    this.currentUser.set(null);
  }
}