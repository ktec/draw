// import socket from "./socket"
import draw from "./draw"
import {Socket} from "phoenix"

// const hash = window.location.hash.substr(1)
const token = document.head.querySelector("[name=token]").content
const socket = new Socket("/socket", {params: {token: token}})
socket.connect()

draw.init(socket, "#drawing svg", token)
