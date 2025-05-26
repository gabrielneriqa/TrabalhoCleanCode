
const http = require("http");
const https = require("https");

let cache = {};
let debug_mode = true;
let timeout = 5000;
let err_count = 0;

function logDebugInfo(endpoint, parsedData) {
    cache[endpoint] = parsedData;
    if (debug_mode) {
        console.log(`Successfully fetched data for ${endpoint}`);
        console.log(`Cache size: ${Object.keys(cache).length}`);
    }
}

function createRequest(endpoint, resolve, reject) {
    let rawData = "";
    const request = https.get(`https://swapi.dev/api/${endpoint}`, { rejectUnauthorized: false }, (response) => {
        if (response.statusCode >= 400) return reject(new Error(`Request failed with status code ${response.statusCode}`));
        response.on("data", chunk => rawData += chunk);
        response.on("end", () => parseResponse(rawData, endpoint, resolve, reject));
    });
    handleRequestErrors(request, endpoint, reject);
}

function handleRequestErrors(request, endpoint, reject) {
    request.on("error", (err) => { err_count++; reject(err); });
    request.setTimeout(timeout, () => {
        request.abort();
        err_count++;
        reject(new Error(`Request timeout for ${endpoint}`));
    });
}

function parseResponse(rawData, endpoint, resolve, reject) {
    try {
        const parsedData = JSON.parse(rawData);
        logDebugInfo(endpoint, parsedData);
        resolve(parsedData);
    } catch (err) {
        err_count++;
        reject(err);
    }
}

async function fetchFromApi(endpoint) {
    if (cache[endpoint]) {
        if (debug_mode) console.log("Using cached data for", endpoint);
        return cache[endpoint];
    }
    return new Promise((resolve, reject) => {
        createRequest(endpoint, resolve, reject);
    });
}

let lastId = 1;
let fetch_count = 0;
let total_size = 0;

function printCharacterDetails(person) {
    console.log("Character:", person.name);
    console.log("Height:", person.height);
    console.log("Mass:", person.mass);
    console.log("Birthday:", person.birth_year);
    if (person.films?.length) console.log("Appears in", person.films.length, "films");
}

function printStarship(ship, index) {
    console.log(`\nStarship ${index + 1}:`);
    console.log("Name:", ship.name);
    console.log("Model:", ship.model);
    console.log("Manufacturer:", ship.manufacturer);
    console.log("Cost:", ship.cost_in_credits !== "unknown" ? `${ship.cost_in_credits} credits` : "unknown");
    console.log("Speed:", ship.max_atmosphering_speed);
    console.log("Hyperdrive Rating:", ship.hyperdrive_rating);
    if (ship.pilots?.length) console.log("Pilots:", ship.pilots.length);
}

function printStarshipDetails(starships) {
    console.log("\nTotal Starships:", starships.count);
    const maxToPrint = Math.min(3, starships.results.length);
    for (let i = 0; i < maxToPrint; i++) {
        const ship = starships.results[i];
        if (ship) printStarship(ship, i);
    }
}

function isLargePlanet(planet) {
    const population = parseInt(planet.population);
    const diameter = parseInt(planet.diameter);
    return !isNaN(population) && population > 1_000_000_000 && !isNaN(diameter) && diameter > 10000;
}

function printPlanetDetails(planet) {
    console.log(`${planet.name} - Pop: ${planet.population} - Diameter: ${planet.diameter} - Climate: ${planet.climate}`);
    if (planet.films?.length) console.log(`  Appears in ${planet.films.length} films`);
}

function printLargePlanets(planets) {
    console.log("\nLarge populated planets:");
    for (const planet of planets.results) {
        if (isLargePlanet(planet)) printPlanetDetails(planet);
    }
}

function printFilms(films) {
    console.log("\nStar Wars Films in chronological order:");
    films.forEach((film, index) => {
        console.log(`${index + 1}. ${film.title} (${film.release_date})`);
        console.log(`   Director: ${film.director}`);
        console.log(`   Producer: ${film.producer}`);
        console.log(`   Characters: ${film.characters.length}`);
        console.log(`   Planets: ${film.planets.length}`);
    });
}

function printVehicle(vehicle) {
    console.log("\nFeatured Vehicle:");
    console.log("Name:", vehicle.name);
    console.log("Model:", vehicle.model);
    console.log("Manufacturer:", vehicle.manufacturer);
    console.log("Cost:", vehicle.cost_in_credits, "credits");
    console.log("Length:", vehicle.length);
    console.log("Crew Required:", vehicle.crew);
    console.log("Passengers:", vehicle.passengers);
}

function printDebugStats() {
    console.log("\nStats:");
    console.log("API Calls:", fetch_count);
    console.log("Cache Size:", Object.keys(cache).length);
    console.log("Total Data Size:", total_size, "bytes");
    console.log("Error Count:", err_count);
}

async function fetchDataSequence() {
    try {
        if (debug_mode) console.log("Starting data fetch...");
        fetch_count++;

        const person = await fetchFromApi(`people/${  lastId}`);
        total_size += JSON.stringify(person).length;
        printCharacterDetails(person);

        const starships = await fetchFromApi("starships/?page=1");
        total_size += JSON.stringify(starships).length;
        printStarshipDetails(starships);

        await fetchPlanetAndFilmData();
        await fetchVehicleIfNeeded();

        if (debug_mode) printDebugStats();
    } catch (error) {
        console.error("Error:", error.message);
        err_count++;
    }
}

async function fetchPlanetAndFilmData() {
    const planets = await fetchFromApi("planets/?page=1");
    total_size += JSON.stringify(planets).length;
    printLargePlanets(planets);

    const filmsData = await fetchFromApi("films/");
    total_size += JSON.stringify(filmsData).length;
    const films = filmsData.results.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
    printFilms(films);
}

async function fetchVehicleIfNeeded() {
    if (lastId <= 4) return;
    try {
        const vehicle = await fetchFromApi(`vehicles/${  lastId}`);
        total_size += JSON.stringify(vehicle).length;
        printVehicle(vehicle);
        lastId++;
    } catch (error) {
        console.error("Failed to fetch vehicle:", error.message);
        err_count++;
    }
}

const args = process.argv.slice(2);
if (args.includes("--no-debug")) debug_mode = false;
if (args.includes("--timeout")) {
    const index = args.indexOf("--timeout");
    if (index < args.length - 1) timeout = parseInt(args[index + 1]);
}

const server = http.createServer((req, res) => {
    if (req.url === "/" || req.url === "/index.html") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Star Wars API Demo</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                        h1 { color: #FFE81F; background-color: #000; padding: 10px; }
                        button { background-color: #FFE81F; border: none; padding: 10px 20px; cursor: pointer; }
                        .footer { margin-top: 50px; font-size: 12px; color: #666; }
                        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <h1>Star Wars API Demo</h1>
                    <p>This page demonstrates fetching data from the Star Wars API.</p>
                    <p>Check your console for the API results.</p>
                    <button onclick="fetchData()">Fetch Star Wars Data</button>
                    <div id="results"></div>
                    <script>
                        function fetchData() {
                            document.getElementById('results').innerHTML = '<p>Loading data...</p>';
                            fetch('/api')
                                .then(res => res.text())
                                .then(text => {
                                    alert('API request made! Check server console.');
                                    document.getElementById('results').innerHTML = '<p>Data fetched! Check server console.</p>';
                                })
                                .catch(err => {
                                    document.getElementById('results').innerHTML = '<p>Error: ' + err.message + '</p>';
                                });
                        }
                    </script>
                    <div class="footer">
                        <p>API calls: ${fetch_count} | Cache entries: ${Object.keys(cache).length} | Errors: ${err_count}</p>
                        <pre>Debug mode: ${debug_mode ? 'ON' : 'OFF'} | Timeout: ${timeout}ms</pre>
                    </div>
                </body>
            </html>
        `);
    } else if (req.url === "/api") {
        fetchDataSequence();
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Check server console for results");
    } else if (req.url === "/stats") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
            api_calls: fetch_count,
            cache_size: Object.keys(cache).length,
            data_size: total_size,
            errors: err_count,
            debug: debug_mode,
            timeout: timeout
        }));
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log("Open the URL in your browser and click the button to fetch Star Wars data");
    if (debug_mode) {
        console.log("Debug mode: ON");
        console.log("Timeout:", timeout, "ms");
    }
});