import db from './config/database.js'

class User{
    constructor(username,password,type){
        this.username = username
        this.password = password
        this.type = type
    }
}

class Admin extends User{
    constructor(){
        super(username,password,"admin")
    }

    
}