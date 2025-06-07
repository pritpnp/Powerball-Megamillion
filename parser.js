function parseMegaMillions(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // Match line with exactly 6 numbers (5 white balls + Mega)
  let numbers = null;
  for (const line of lines) {
    const nums = line.split(/\s+/).map(n => parseInt(n)).filter(n => !isNaN(n));
    if (nums.length === 6) {
      numbers = nums;
      break;
    }
  }
  if (!numbers) throw new Error("❌ Mega Millions winning numbers not found.");

  // Match drawing date like FRIDAY, 6/6/2025
  const dateLine = lines.find(line => /^[A-Z]+, \d{1,2}\/\d{1,2}\/\d{4}$/i.test(line));
  if (!dateLine) throw new Error("❌ Mega Millions date line not found.");
  const [, month, day, year] = dateLine.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  const drawDate = new Date(`${year}-${month}-${day}`);
  const formattedDate = drawDate.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  }) + " Drawing";

  // Find jackpot amount
  const jackpotLine = lines.find(line => /\$\d/.test(line) && /million/i.test(line));
  if (!jackpotLine) throw new Error("❌ Mega Millions jackpot not found.");

  // Match "Next Drawing:" and read the next line
  const nextDrawLine = lines.find(line => /Next\s*Drawing/i.test(line));
  const nextDateRaw = lines[lines.indexOf(nextDrawLine) + 1]?.replace(/\u00A0/g, ' ') || "";
  const match = nextDateRaw.match(/([A-Za-z]+), (\d{1,2})\/(\d{1,2})/);
  if (!match) throw new Error("❌ Mega Millions next draw line not found.");

  const [, weekday, month2, day2] = match;
  const nextDrawDate = new Date(`${new Date().getFullYear()}-${month2}-${day2}`);
  const formattedNextDrawing = nextDrawDate.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  return {
    numbers,
    date: formattedDate,
    nextDrawing: formattedNextDrawing,
    nextJackpot: jackpotLine
  };
}

function parsePowerball(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  const dayOfWeekMap = {
    Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday",
    Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday"
  };

  const monthMap = {
    Jan: "January", Feb: "February", Mar: "March", Apr: "April",
    May: "May", Jun: "June", Jul: "July", Aug: "August",
    Sep: "September", Oct: "October", Nov: "November", Dec: "December"
  };

  // Find the line like: "Wed, Jun 4, 2025"
  const drawDateLine = lines.find(l => /^[A-Za-z]{3}, [A-Za-z]{3} \d{1,2}, \d{4}$/.test(l));
  if (!drawDateLine) throw new Error("❌ Powerball draw date line not found.");

  const [, dowAbbr, monthAbbr, day, year] = drawDateLine.match(/^([A-Za-z]{3}), ([A-Za-z]{3}) (\d{1,2}), (\d{4})/);
  const drawDate = `${monthMap[monthAbbr]} ${day}, ${year} Drawing`;

  const numbers = [];
  const dateIndex = lines.indexOf(drawDateLine);
  for (let i = dateIndex + 1; i < lines.length; i++) {
    const n = parseInt(lines[i]);
    if (!isNaN(n)) numbers.push(n);
    if (numbers.length === 6) break;
  }
  if (numbers.length < 6) throw new Error("❌ Powerball winning numbers incomplete.");

  // Find Next Drawing
  const nextDrawIndex = lines.findIndex(l => l.toLowerCase().includes("next drawing"));
  if (nextDrawIndex === -1) throw new Error("❌ Powerball next drawing line not found.");
  const nextDrawLine = lines[nextDrawIndex + 1].trim();
  const match = nextDrawLine.match(/^([A-Za-z]{3}), ([A-Za-z]{3}) (\d{1,2}), (\d{4})$/);
  if (!match) throw new Error("❌ Powerball next drawing date format is invalid.");
  const [_, nextDOW, nextMonth, nextDay, nextYear] = match;
  const nextDrawing = `${dayOfWeekMap[nextDOW]}, ${monthMap[nextMonth]} ${nextDay}, ${nextYear}`;

  // Find Jackpot
  const jackpotIndex = lines.findIndex(l => l.toLowerCase().includes("estimated jackpot"));
  const nextJackpot = jackpotIndex !== -1 ? lines[jackpotIndex + 1].trim() : "Unavailable";

  return {
    numbers,
    date: drawDate,
    nextDrawing,
    nextJackpot
  };
}


module.exports = { parseMegaMillions, parsePowerball };