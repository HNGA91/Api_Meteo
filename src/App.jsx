import { useState, useCallback } from "react";

// Custom hook for weather data
function useWeather() {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchWeather = useCallback(async (location) => {
		setLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams({
				q: location
			});

			const response = await fetch(`/api/weather?${params}`);
			const json = await response.json();

			if (!response.ok) {
				throw new Error(json.error?.message || "Failed to fetch weather");
			}

			setData(json);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, []);

	return { data, loading, error, fetchWeather };
}

// Air quality label helper
function getAQILabel(index) {
	const labels = ["", "Good", "Moderate", "Unhealthy (Sensitive)", "Unhealthy", "Very Unhealthy", "Hazardous"];
	const colors = ["", "#00e400", "#ffff00", "#ff7e00", "#ff0000", "#8f3f97", "#7e0023"];
	return { label: labels[index] || "Unknown", color: colors[index] || "#ccc" };
}

// Weather icon component (uses WeatherAPI's icon URLs)
function WeatherIcon({ iconUrl, size = 64, alt }) {
	return <img src={`https:${iconUrl}`} alt={alt} width={size} height={size} />;
}

// Current weather card
function CurrentWeather({ location, current }) {
	const aqi = current.air_quality?.["us-epa-index"];
	const aqiInfo = aqi ? getAQILabel(aqi) : null;

	return (
		<div style={styles.card}>
			<div style={styles.locationHeader}>
				<h2 style={styles.locationName}>{location.name}</h2>
				<p style={styles.locationSub}>
					{location.region}, {location.country}
				</p>
				<p style={styles.localTime}>🕐 {location.localtime}</p>
			</div>

			<div style={styles.currentMain}>
				<WeatherIcon iconUrl={current.condition.icon} size={80} alt={current.condition.text} />
				<div>
					<p style={styles.tempLarge}>{current.temp_c}°C</p>
					<p style={styles.conditionText}>{current.condition.text}</p>
					<p style={styles.feelsLike}>Feels like {current.feelslike_c}°C</p>
				</div>
			</div>

			<div style={styles.detailsGrid}>
				<DetailItem icon="💨" label="Wind" value={`${current.wind_kph} km/h ${current.wind_dir}`} />
				<DetailItem icon="💧" label="Humidity" value={`${current.humidity}%`} />
				<DetailItem icon="👁️" label="Visibility" value={`${current.vis_km} km`} />
				<DetailItem icon="📊" label="Pressure" value={`${current.pressure_mb} mb`} />
				<DetailItem icon="☀️" label="UV Index" value={current.uv} />
				<DetailItem icon="💨" label="Gusts" value={`${current.gust_kph} km/h`} />
			</div>

			{aqiInfo && <div style={{ ...styles.aqiBadge, backgroundColor: aqiInfo.color }}>Air Quality: {aqiInfo.label}</div>}
		</div>
	);
}

function DetailItem({ icon, label, value }) {
	return (
		<div style={styles.detailItem}>
			<span>{icon}</span>
			<span style={styles.detailLabel}>{label}</span>
			<span style={styles.detailValue}>{value}</span>
		</div>
	);
}

// Forecast day card
function ForecastDay({ day }) {
	return (
		<div style={styles.forecastDay}>
			<p style={styles.forecastDate}>{new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
			<WeatherIcon iconUrl={day.day.condition.icon} size={40} alt={day.day.condition.text} />
			<p style={styles.forecastCondition}>{day.day.condition.text}</p>
			<p style={styles.forecastTemp}>
				<span style={{ color: "#e74c3c" }}>{day.day.maxtemp_c}°</span>
				{" / "}
				<span style={{ color: "#3498db" }}>{day.day.mintemp_c}°</span>
			</p>
			<p style={styles.forecastRain}>🌧 {day.day.daily_chance_of_rain}%</p>
			<p style={styles.forecastAstro}>
				🌅 {day.astro.sunrise} · 🌇 {day.astro.sunset}
			</p>
		</div>
	);
}

// Main weather widget
export default function App() {
	const [query, setQuery] = useState("");
	const { data, loading, error, fetchWeather } = useWeather();

	const handleSubmit = (e) => {
		e.preventDefault();
		if (query.trim()) fetchWeather(query.trim());
	};

	return (
		<div style={styles.container}>
			<h1 style={styles.title}>🌤️ Weather Forecast</h1>
			<p style={styles.subtitle}>Powered by WeatherAPI.com</p>

			<form onSubmit={handleSubmit} style={styles.form}>
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Enter city, zip code, or coordinates..."
					style={styles.input}
				/>
				<button type="submit" disabled={loading} style={styles.button}>
					{loading ? "Loading..." : "Get Weather"}
				</button>
			</form>

			{error && <div style={styles.error}>⚠️ {error}</div>}

			{data && (
				<>
					<CurrentWeather location={data.location} current={data.current} />

					<h3 style={styles.forecastTitle}>3-Day Forecast</h3>
					<div style={styles.forecastGrid}>
						{data.forecast.forecastday.map((day) => (
							<ForecastDay key={day.date} day={day} />
						))}
					</div>

					{data.alerts?.alert?.length > 0 && (
						<div style={styles.alertBox}>
							<h4>⚠️ Weather Alerts</h4>
							{data.alerts.alert.map((alert, i) => (
								<p key={i}>
									<strong>{alert.headline}</strong> — {alert.desc}
								</p>
							))}
						</div>
					)}
				</>
			)}
		</div>
	);
}

const styles = {
	container: { maxWidth: 700, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif" },
	title: { fontSize: 28, fontWeight: 700, marginBottom: 4 },
	subtitle: { color: "#666", marginBottom: 24 },
	form: { display: "flex", gap: 8, marginBottom: 24 },
	input: { flex: 1, padding: "10px 14px", fontSize: 16, border: "1px solid #ddd", borderRadius: 8 },
	button: { padding: "10px 20px", fontSize: 16, background: "#3498db", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" },
	card: { background: "#f8f9fa", borderRadius: 12, padding: 24, marginBottom: 24 },
	locationHeader: { marginBottom: 16 },
	locationName: { fontSize: 24, fontWeight: 700, margin: 0 },
	locationSub: { color: "#666", margin: "4px 0" },
	localTime: { color: "#888", margin: 0, fontSize: 14 },
	currentMain: { display: "flex", alignItems: "center", gap: 16, marginBottom: 16 },
	tempLarge: { fontSize: 48, fontWeight: 700, margin: 0 },
	conditionText: { fontSize: 18, color: "#555", margin: 0 },
	feelsLike: { color: "#888", margin: "4px 0 0 0" },
	detailsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
	detailItem: { display: "flex", flexDirection: "column", background: "#fff", padding: "8px 12px", borderRadius: 8 },
	detailLabel: { fontSize: 12, color: "#888" },
	detailValue: { fontSize: 14, fontWeight: 600 },
	aqiBadge: { display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600, marginTop: 12, color: "#333" },
	forecastTitle: { fontSize: 18, fontWeight: 600, marginBottom: 12 },
	forecastGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 },
	forecastDay: { background: "#f8f9fa", borderRadius: 12, padding: 16, textAlign: "center" },
	forecastDate: { fontWeight: 600, margin: "0 0 8px" },
	forecastCondition: { fontSize: 13, color: "#555", margin: "4px 0" },
	forecastTemp: { fontSize: 16, fontWeight: 600, margin: "4px 0" },
	forecastRain: { fontSize: 13, color: "#3498db", margin: "4px 0" },
	forecastAstro: { fontSize: 11, color: "#888", margin: "4px 0 0" },
	error: { background: "#fee", border: "1px solid #fcc", borderRadius: 8, padding: 12, marginBottom: 16, color: "#c33" },
	alertBox: { background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 8, padding: 16 },
};
