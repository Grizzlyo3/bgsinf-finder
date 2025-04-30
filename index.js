// rift-finder-backend/index.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Dozvoljavamo pristup sa bilo kog frontenda
app.use(cors());

// Zameni PLACE_ID sa stvarnim ID-em igre Bubble Gum Simulator: Infinity
const PLACE_ID = '85896571713843'; // Primer iz slike - proveri da li je tačan

app.get('/get-rift-servers', async (req, res) => {
  try {
    const servers = [];
    let nextPageCursor = null;
    let pageCount = 0;

    do {
      const response = await axios.get(`https://games.roblox.com/v1/games/${PLACE_ID}/servers/Public`, {
        params: {
          limit: 100,
          cursor: nextPageCursor
        }
      });

      const data = response.data;
      nextPageCursor = data.nextPageCursor;

      for (const server of data.data) {
        // Pošto opis nije direktno dostupan, koristićemo height kao workaround (primer sa slike: Height = 12623)
        if (server.playing && server.playing > 0 && server.ping && server.ping < 200) {
          if (server.id && server.maxPlayers && server.playing <= server.maxPlayers) {
            // Možda dodatna logika ako znamo tačne uslove za "25x Rift"
            servers.push({
              id: server.id,
              playing: server.playing,
              maxPlayers: server.maxPlayers,
              ping: server.ping,
              teleportCode: `game:GetService('TeleportService'):TeleportToPlaceInstance(${PLACE_ID}, '${server.id}', game.Players.LocalPlayer)`
            });
          }
        }
      }

      pageCount++;
      if (pageCount >= 5) break; // Ograničimo na 5 stranica da ne preteramo

    } while (nextPageCursor);

    res.json(servers);
  } catch (error) {
    console.error('Greška:', error.message);
    res.status(500).json({ error: 'Došlo je do greške prilikom preuzimanja servera.' });
  }
});

app.listen(PORT, () => {
  console.log(`Rift Finder backend pokrenut na http://localhost:${PORT}`);
});
