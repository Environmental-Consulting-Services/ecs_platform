import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import Agenda from "agenda";

const connectionString = 'mongodb://localhost/agenda';
const agenda = new Agenda({ 
              db: {
                address: connectionString, 
                collection: 'agendaJobs'}});


await agenda.start();

async function graceful() {
  await agenda.stop();
  process.exit(0);
}

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);
