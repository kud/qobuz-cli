import { defineCommand } from "citty"
import type { FavouriteType } from "@kud/qobuz"
import { connect } from "../lib.js"

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
    for (const album of favourites.albums)
      console.log(
        `  ${album.id}  ${album.artist?.name ?? "?"} — ${album.title}`,
      )
    for (const artist of favourites.artists)
      console.log(`  ${artist.id}  ${artist.name}`)
    for (const track of favourites.tracks)
      console.log(
        `  ${track.id}  ${track.artist?.name ?? "?"} — ${track.title}`,
      )
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
    console.log(`✓ added ${args.type} ${args.id} to favourites`)
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
    console.log(`✓ removed ${args.type} ${args.id} from favourites`)
  },
})

export const fav = defineCommand({
  meta: { name: "fav", description: "Manage favourites" },
  subCommands: { list, add, remove },
})
