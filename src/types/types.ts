export type sum = (a: number, b: number) => number

export type User =  {
    fullname:string
    nicname:string
    age:string
    role:Role
    email:"/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/";
}

type Role = {
    name:string
    prev:"admin"|"user"|"viewer"|"superadmin"
}

export type Time = {
    hour:Int16Array
    minuta:Int16Array
    second:Int16Array
}

export type video = {
    file:File
    name:string
    tags:tag[]
    status:boolean
    published:boolean
    payment:boolean
}

type tag = {
    name: string
}