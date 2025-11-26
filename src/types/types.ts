export type sum = (a: number, b: number) => number

export type User =  {
    id:Int16Array
    fullname:string
    nicname:string
    age:string
    role:Role
    tag:Tag
    email:"/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/";
}

type Role = {
    name:string
    prev:"admin"|"user"|"viewer"|"superadmin"
}

export type Data = {
    hour:Int16Array
    minuta:Int16Array
    second:Int16Array
}

export type video = {
    id:Int16Array
    file:File
    name:string
    tags:Tag[]
    status:boolean
    published:boolean
    payment:boolean
}

type Tag = {
    name: string
}

export type Comment = {
    id:Int16Array
    value:string
    user:User
    createAt:Data
    video:video
}