
const arr = {
    "a": 1,
    "message": "Hello",
    "data": {
        "b": 2
    }
}

const receiver = "jfjj233"

Object.assign(arr.data, { receiverId: receiver })

console.log(arr)