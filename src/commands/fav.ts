import { defineCommand } from "citty"
import type { FavouriteType } from "@kud/qobuz"
import { connect } from "../lib.js"
import { accent, columns, dim, heading, muted, success } from "../ui.js"

const list = defineCommand({
  meta: { name: "list", description: "List favourites" },
  args: {
    type: {
      type: "string",
      description: "albums | artists | tracks",
      default: "albums",
    },
  },
  run: async ({ args }) => {
    const client = await connect()
    const favourites = await client.favourites.list(args.type as FavouriteType)
    if (favourites.albums.length) {
      heading("💿  Albums")
      console.log(
        columns(
          favourites.albums.map((album) => [
            accent(album.title),
            dim(album.artist?.name ?? "?"),
            muted(String(album.id)),
          ]),
        ),
      )
    }
    if (favourites.artists.length) {
      heading("🎤  Artists")
      console.log(
        columns(
          favourites.artists.map((artist) => [
            accent(artist.name),
            muted(String(artist.id)),
          ]),
        ),
      )
    }
    if (favourites.tracks.length) {
      heading("🎵  Tracks")
      console.log(
        columns(
          favourites.tracks.map((track) => [
            accent(track.title),
            dim(track.artist?.name ?? "?"),
            muted(String(track.id)),
          ]),
        ),
      )
    }
  },
})

const add = defineCommand({
  meta: { name: "add", description: "Add a favourite" },
  args: {
    type: {
      type: "positional",
      description: "albums | artists | tracks",
      required: true,
    },
    id: {
      type: "positional",
      description: "Album/artist/track ID",
      required: true,
    },
  },
  run: async ({ args }) => {
    const client = await connect()
    await client.favourites.add(args.type as FavouriteType, args.id)
    success(`added ${args.type} ${args.id} to favourites`)
  },
})

const remove = defineCommand({
  meta: { name: "remove", description: "Remove a favourite" },
  args: {
    type: {
      type: "positional",
      description: "albums | artists | tracks",
      required: true,
    },
    id: {
      type: "positional",
      description: "Album/artist/track ID",
      required: true,
    },
  },
  run: async ({ args }) => {
    const client = await connect()
    await client.favourites.remove(args.type as FavouriteType, args.id)
    success(`removed ${args.type} ${args.id} from favourites`)
  },
})

export const fav = defineCommand({
  meta: { name: "fav", description: "Manage favourites" },
  subCommands: { list, add, remove },
})
