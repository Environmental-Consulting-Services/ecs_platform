import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import Agenda from "agenda";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const connectionString =
  process.env.AGENDA_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "mongodb://localhost/agenda";
const port = process.env.PORT || 8080;
const app = express();
let agendaStarted = false;
let agendaStartError = null;

app.use(cors());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    agendaStarted,
    agendaStartError,
  });
});

app.listen(port, () => {
  console.log(`Scheduler health server listening on ${port}`);
});

const agenda = new Agenda({
  db: {
    address: connectionString,
    collection: "agendaJobs",
  },
});


try {
  await agenda.start();
  agendaStarted = true;
  console.log("Agenda scheduler started");
} catch (error) {
  agendaStartError = error instanceof Error ? error.message : String(error);
  console.error("Agenda scheduler failed to start", error);
}

async function graceful() {
  await agenda.stop();
  process.exit(0);
}

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);
