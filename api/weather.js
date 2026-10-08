const BASE_URL = "https://api.weatherapi.com/v1/forecast.json";

export default async function handler(req, res) {
    
    if (!process.env.WEATHER_API_KEY) {
		console.error("WEATHER_API_KEY manquante");
		return res.status(500).json({ error: { message: "Server misconfigured" } });
	}

	// 1. N'accepter que GET
	if (req.method !== "GET") {
		return res.status(405).json({ error: { message: "Method not allowed" } });
	}

	// 2. Valider l'entrée
	const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
	if (!q || q.length > 100) {
		return res.status(400).json({ error: { message: "Invalid location" } });
	}

	// 3. Les paramètres sont fixés côté serveur
	const params = new URLSearchParams({
		key: process.env.WEATHER_API_KEY,
		q,
		days: "3",
		aqi: "yes",
		alerts: "yes",
	});

	try {
		const response = await fetch(`${BASE_URL}?${params}`);
		const json = await response.json();

		// 4. Cache CDN de 10 minutes
		res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=300");
		return res.status(response.status).json(json);
	} catch {
		return res.status(502).json({ error: { message: "Weather service unavailable" } });
	}
}
