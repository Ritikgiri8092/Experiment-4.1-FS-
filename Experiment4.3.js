const express = require("express");
const crypto = require("crypto");

const app = express();
const PORT = 3000;
app.use(express.json());

// Seats: Map of seatId -> { status: "available"|"locked"|"booked", lockInfo: { lockId, userId, expiresAt } }
const seats = new Map();
// Active locks: Map lockId -> { lockId, userId, seatIds, expiresAt, timer }
const locks = new Map();

// Initialize seats: Rows A-C, Columns 1-5 (15 seats)
["A", "B", "C"].forEach(row => {
  for (let col = 1; col <= 5; col++) {
    const id = `${row}${col}`;
    seats.set(id, { status: "available", lockInfo: null });
  }
});

// Utility: generate unique lock ID
function genLockId() {
  return crypto.randomBytes(8).toString("hex");
}

// Utility: release a lock
function releaseLock(lockId) {
  const lock = locks.get(lockId);
  if (!lock) return;
  lock.seatIds.forEach(seatId => {
    const seat = seats.get(seatId);
    if (seat && seat.lockInfo?.lockId === lockId) {
      seat.status = "available";
      seat.lockInfo = null;
    }
  });
  clearTimeout(lock.timer);
  locks.delete(lockId);
}

// GET all seats
app.get("/seats", (req, res) => {
  const arr = Array.from(seats.entries()).map(([id, data]) => ({
    id,
    status: data.status,
    lockInfo: data.lockInfo || null
  }));
  res.json(arr);
});

// POST lock seats
app.post("/lock", (req, res) => {
  const { userId, seatIds, ttlSeconds } = req.body;
  if (!userId || !Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ error: "userId and seatIds required" });
  }
  const ttl = ttlSeconds || 30;

  // Check availability
  const conflict = seatIds.filter(id => {
    const seat = seats.get(id);
    return !seat || seat.status !== "available";
  });
  if (conflict.length > 0) {
    return res.status(409).json({ error: "Some seats not available", conflict });
  }

  // Lock seats
  const lockId = genLockId();
  const expiresAt = Date.now() + ttl * 1000;
  const timer = setTimeout(() => releaseLock(lockId), ttl * 1000);

  seatIds.forEach(id => {
    seats.get(id).status = "locked";
    seats.get(id).lockInfo = { lockId, userId, expiresAt };
  });

  locks.set(lockId, { lockId, userId, seatIds, expiresAt, timer });
  res.status(201).json({ lockId, seatIds, expiresAt });
});

// POST confirm booking
app.post("/confirm", (req, res) => {
  const { userId, lockId } = req.body;
  const lock = locks.get(lockId);
  if (!lock) return res.status(404).json({ error: "Lock not found" });
  if (lock.userId !== userId) return res.status(403).json({ error: "Lock owned by another user" });

  lock.seatIds.forEach(id => {
    const seat = seats.get(id);
    if (seat && seat.lockInfo?.lockId === lockId) {
      seat.status = "booked";
      seat.lockInfo = null;
    }
  });

  clearTimeout(lock.timer);
  locks.delete(lockId);

  res.json({ success: true, bookedSeats: lock.seatIds });
});

// POST release lock
app.post("/release", (req, res) => {
  const { userId, lockId } = req.body;
  const lock = locks.get(lockId);
  if (!lock) return res.status(404).json({ error: "Lock not found" });
  if (lock.userId !== userId) return res.status(403).json({ error: "Lock owned by another user" });

  releaseLock(lockId);
  res.json({ success: true, releasedSeats: lock.seatIds });
});

app.listen(PORT, () => {
  console.log(`Ticket Booking API running at http://localhost:${PORT}`);
});
