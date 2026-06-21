import { defineCommand } from "citty"
import { connect } from "../lib.js"

const list = defineCommand({
  meta: { name: "list", description: "List your playlists" },
  run: async () => {
    const client = await connect()
    const playlists = await client.playlists.listForUser()
    for (const playlist of playlists) {
      console.log(
        `  ${playlist.id}  ${playlist.name}  (${playlist.tracksCount ?? 0} tracks)`,
      )
    }
  },
})

const show = defineCommand({
  meta: { name: "show", description: "Show a playlist" },
  args: {
    id: { type: "positional", description: "Playlist ID", required: true },
  },
  run: async ({ args }) => {
    const client = await connect()
    const playlist = await client.playlists.get(Number(args.id))
    console.log(`${playlist.name}  (${playlist.tracksCount ?? 0} tracks)`)
    if (playlist.description) console.log(playlist.description)
    console.log(`open: ${client.deepLink.playlist(playlist.id)}`)
  },
})

const create = defineCommand({
  meta: { name: "create", description: "Create a playlist" },
  args: {
    name: { type: "positional", description: "Playlist name", required: true },
    public: {
      type: "boolean",
      description: "Make the playlist public",
      default: false,
    },
  },
  run: async ({ args }) => {
    const client = await connect()
    const playlist = await client.playlists.create({
      name: args.name,
      isPublic: args.public,
    })
    console.log(`✓ created playlist "${playlist.name}" [${playlist.id}]`)
  },
})

const add = defineCommand({
  meta: { name: "add", description: "Add a track to a playlist" },
  args: {
    playlist: {
      type: "positional",
      description: "Playlist ID",
      required: true,
    },
    track: { type: "positional", description: "Track ID", required: true },
  },
  run: async ({ args }) => {
    const client = await connect()
    await client.playlists.addTracks(Number(args.playlist), [
      Number(args.track),
    ])
    console.log(`✓ added track ${args.track} to playlist ${args.playlist}`)
  },
})

const remove = defineCommand({
  meta: { name: "remove", description: "Delete a playlist" },
  args: {
    id: { type: "positional", description: "Playlist ID", required: true },
  },
  run: async ({ args }) => {
    const client = await connect()
    await client.playlists.remove(Number(args.id))
    console.log(`✓ deleted playlist ${args.id}`)
  },
})

export const playlist = defineCommand({
  meta: { name: "playlist", description: "Manage playlists" },
  subCommands: { list, show, create, add, remove },
})
