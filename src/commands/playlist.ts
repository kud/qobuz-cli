import { defineCommand } from "citty"
import { connect } from "../lib.js"
import {
  accent,
  bold,
  columns,
  dim,
  heading,
  link,
  muted,
  success,
} from "../ui.js"

const list = defineCommand({
  meta: { name: "list", description: "List your playlists" },
  run: async () => {
    const client = await connect()
    const playlists = await client.playlists.listForUser()
    if (!playlists.length) return
    heading("📝  Playlists")
    console.log(
      columns(
        playlists.map((playlist) => [
          accent(playlist.name),
          dim(`${playlist.tracksCount ?? 0} tracks`),
          muted(String(playlist.id)),
        ]),
      ),
    )
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
    console.log(`\n${bold(`📝  ${playlist.name}`)}`)
    console.log(`  ${dim(`${playlist.tracksCount ?? 0} tracks`)}`)
    if (playlist.description) console.log(`  ${dim(playlist.description)}`)
    console.log(`  ${link(client.deepLink.playlist(playlist.id))}`)
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
    success(`created playlist "${playlist.name}" [${playlist.id}]`)
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
    success(`added track ${args.track} to playlist ${args.playlist}`)
  },
})

const edit = defineCommand({
  meta: { name: "edit", description: "Edit a playlist's description" },
  args: {
    id: { type: "positional", description: "Playlist ID", required: true },
    description: {
      type: "positional",
      description: "New description",
      required: true,
    },
  },
  run: async ({ args }) => {
    const client = await connect()
    await client.playlists.update(Number(args.id), {
      description: args.description,
    })
    success(`updated description for playlist ${args.id}`)
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
    success(`deleted playlist ${args.id}`)
  },
})

export const playlist = defineCommand({
  meta: { name: "playlist", description: "Manage playlists" },
  subCommands: { list, show, create, add, edit, remove },
})
