export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const symbol = req.query.symbol;
  const avFunction = req.query.avFunction || "GLOBAL_QUOTE";
  const apiKey = process.env.ALPHA_VANTAGE_KEY;

  if (!symbol) {
    res.status(400).json({ error: "Missing symbol query parameter" });
    return;
  }

  if (!apiKey) {
    res.status(500).json({ error: "Missing ALPHA_VANTAGE_KEY environment variable" });
    return;
  }

  const allowedFunctions = new Set(["GLOBAL_QUOTE", "TIME_SERIES_DAILY"]);
  if (!allowedFunctions.has(avFunction)) {
    res.status(400).json({ error: "Unsupported avFunction value" });
    return;
  }

  const params = new URLSearchParams({
    function: avFunction,
    symbol: String(symbol),
    apikey: apiKey
  });

  if (avFunction === "TIME_SERIES_DAILY") {
    params.set("outputsize", "full");
  }

  const url = "https://www.alphavantage.co/query?" + params.toString();

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({
        error: "Alpha Vantage request failed",
        details: data
      });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch Alpha Vantage data",
      details: String(error)
    });
  }
}
