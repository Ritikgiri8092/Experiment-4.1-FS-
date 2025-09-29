// app.js
const express = require("express");
const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Sample card collection (in-memory)
let cards = [
  { id: 1, suit: "Hearts", rank: "Ace" },
  { id: 2, suit: "Spades", rank: "King" },
  { id: 3, suit: "Diamonds", rank: "Queen" },
];

// Get all cards
app.get("/cards", (req, res) => {
  res.json(cards);
});

// Get a card by ID
app.get("/cards/:id", (req, res) => {
  const card = cards.find((c) => c.id === parseInt(req.params.id));
  if (!card) return res.status(404).json({ error: "Card not found" });
  res.json(card);
});

// Add a new card
app.post("/cards", (req, res) => {
  const { suit, rank } = req.body;
  if (!suit || !rank) {
    return res.status(400).json({ error: "Suit and Rank are required" });
  }
  const newCard = {
    id: cards.length ? cards[cards.length - 1].id + 1 : 1,
    suit,
    rank,
  };
  cards.push(newCard);
  res.status(201).json(newCard);
});

// Update a card
app.put("/cards/:id", (req, res) => {
  const card = cards.find((c) => c.id === parseInt(req.params.id));
  if (!card) return res.status(404).json({ error: "Card not found" });

  const { suit, rank } = req.body;
  if (suit) card.suit = suit;
  if (rank) card.rank = rank;

  res.json(card);
});

// Delete a card
app.delete("/cards/:id", (req, res) => {
  const index = cards.findIndex((c) => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Card not found" });

  const deletedCard = cards.splice(index, 1);
  res.json(deletedCard[0]);
});

// Start server
app.listen(port, () => {
  console.log(`Card Collection API running at http://localhost:${port}`);
});
showMenu();