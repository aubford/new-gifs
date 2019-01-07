import express from "express"
import path from "path"
import { server } from "../src/server/server"

server.use(express.static(path.join(__dirname, "public")))
server.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})
