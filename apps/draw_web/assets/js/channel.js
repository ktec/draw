import {Presence} from "phoenix"

const successHandler = response =>
  console.log("Joined successfully", response)

const errorHandler = response =>
  console.log("Unable to join", response)

export const joinChannel = (socket, {payload, room, success, error}) => {
  console.log(`Joining ${room}`)
  let channel = socket.channel(`${room}`, payload)
  channel.join()
    .receive("ok", success || successHandler)
    .receive("error", error || errorHandler)
  return channel
}

export const setUpChannel = (socket, state, payload) => {
  // join the channel
  const channel = joinChannel(socket, {
    payload: payload,
    room: "drawing:lobby",
    success: ({user_id}) => {
      console.log("Joined successfully", user_id)
      state.id = user_id
    }
  })

  // // add listener for various channel messages
  // channel.on("drawing:update", (response) => {
  //   let {id} = response
  //   state.presences[id] = response
  // })

  // channel.on("drawing:update", (response) => {
  //   Object.keys(response).map((key) => {
  //     const payload = response[key].metas[0]["position"]
  //     if (payload) { state.presences[key] = payload }
  //   })
  // })

  // const updatePresences = (presences) => {
  //   console.log(presences)
  // }

  // handle presences
  channel.on("presence_state", state => {
    console.log("presence_state", state)
    // Presence.syncState(presences, state)
    // updatePresences(presences)
  })

  channel.on("presence_diff", diff => {
    console.log("presence_diff", diff)
  //   const {leaves} = diff
  //   Object.keys(leaves).map((key) => {
  //     delete state.presences[key]
  //   })
  //   // Presence.syncDiff(presences, diff)
  //   // updatePresences(presences)
  })

  return channel
}
