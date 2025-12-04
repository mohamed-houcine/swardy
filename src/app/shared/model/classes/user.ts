export interface User {
    userID: string
    fullName: string
    email: string
    bio: string
    avatarImg: string
    coverImg: string
    followers: string[] // IDs
    following: string[] // IDs
    journeys: string[]  // IDs
    spacesCreated: string[] // IDs
    spacesJoined: string[] // IDs
    /** Methods */
    getUser(): User
    editProfile(user: User): void
}