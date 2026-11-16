import { test, expect } from "@playwright/test";

function media(type, offset = 0) {
  return Array.from({ length: 20 }, (_, index) => ({
    id: (type === "movie" ? 100 : 200) + index + offset,
    [type === "movie" ? "title" : "name"]: `${type === "movie" ? "Film" : "Serie"} ${index + 1}`,
    poster_path: index === 19 ? null : `/poster-${index}.jpg`,
    backdrop_path: "/backdrop.jpg",
    overview: "Una storia da scoprire, tra nuove avventure e incontri inattesi.",
    release_date: "2025-06-01", first_air_date: "2025-06-01", genre_ids: [28, 18],
  }));
}

async function mockCatalog(page) {
  await page.route("https://api.themoviedb.org/3/**", async route => {
    const url = new URL(route.request().url());
    const type = url.pathname.includes("/tv") ? "tv" : "movie";
    if (/\/(movie|tv)\/\d+$/.test(url.pathname)) {
      const id = Number(url.pathname.split("/").at(-1));
      return route.fulfill({ json: { ...media(type)[0], id, runtime: 120, genres: [{ id: 18, name: "Dramma" }],
        seasons: [{ id: 1, season_number: 1, name: "Stagione 1", episode_count: 8 }, { id: 2, season_number: 2, name: "Stagione 2", episode_count: 3 }],
      } });
    }
    const number = Number(url.searchParams.get("page") || 1);
    const empty = url.searchParams.get("primary_release_year") === "1900";
    return route.fulfill({ json: { results: empty ? [] : media(type, (number - 1) * 1000), page: number, total_pages: empty ? 0 : 3 } });
  });
  await page.route("https://image.tmdb.org/**", route => route.fulfill({
    contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#29445c"/><stop offset="1" stop-color="#0d1724"/></linearGradient></defs><path fill="url(#g)" d="M0 0h600v900H0z"/><circle fill="#bad4d6" opacity=".5" cx="380" cy="260" r="110"/></svg>',
  }));
  await page.route(/https:\/\/(vixsrc\.to|vidsrc\.to|vidsrc\.cc|multiembed\.mov)\//, route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Test player</title><button>Play</button>" }));
}

test.beforeEach(async ({ page }) => { await mockCatalog(page); });

for (const [width, height] of [[320, 740], [390, 844], [768, 1024], [1280, 720], [1920, 1080]]) {
  test(`layout and navigation remain usable at ${width}×${height}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(page.locator(".movie-card")).toHaveCount(40);
    const links = page.getByRole("navigation", { name: "Navigazione principale" }).getByRole("link");
    await expect(links).toHaveText(["Home", "Film", "Serie TV"]);
    await expect(page.getByRole("searchbox")).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.screenshot({ path: testInfo.outputPath("home.png") });
    await links.nth(1).click();
    await expect(page.getByRole("button", { name: /Genere/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Anno Tutti/ })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await expect(page.locator(".movie-card")).toHaveCount(20);
    await page.screenshot({ path: testInfo.outputPath("catalog.png") });
  });
}

test("remote scrolls offscreen cards, crosses rows and restores focus after Back", async ({ page }) => {
  await page.goto("/?tv=1");
  await expect(page.locator('[data-focus-id="hero-details"]')).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator('[data-focus-id="home-movies-movie-100"]')).toBeFocused();
  for (let index = 0; index < 12; index++) await page.keyboard.press("ArrowRight");
  const selected = page.locator('[data-focus-id="home-movies-movie-112"]');
  await expect(selected).toBeFocused();
  await expect.poll(() => page.locator(".media-rail").first().evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
  await expect(selected).toBeInViewport({ ratio: 1 });
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/watch\/movie\/112$/);
  await expect(page.locator('[data-focus-id="play"]')).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(selected).toBeFocused();
  await expect(selected).toBeInViewport({ ratio: 1 });
  await page.keyboard.press("ArrowDown");
  await expect(page.locator(".media-rail").nth(1).locator(".movie-card:focus")).toHaveCount(1);
  await page.keyboard.press("ArrowUp");
  await expect(page.locator(".media-rail").first().locator(".movie-card:focus")).toHaveCount(1);
  for (let index = 0; index < 25; index++) await page.keyboard.press("ArrowRight");
  await expect(page.locator('[data-focus-id="home-movies-movie-119"]')).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('[data-focus-id="home-movies-movie-119"]')).toBeFocused();
});

test("genre and year work together with only the keyboard, including reset and pagination", async ({ page }) => {
  await page.goto("/film?tv=1");
  const genre = page.locator('[data-focus-id="filter-genre"]');
  await expect(genre).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/genre=28/);
  await expect(genre).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('[data-focus-id="filter-year"]')).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  const request = page.waitForRequest(request => request.url().includes("primary_release_year="));
  await page.keyboard.press("Enter");
  const url = new URL((await request).url());
  expect(url.searchParams.get("with_genres")).toBe("28");
  expect(url.searchParams.get("primary_release_year")).toBe(String(new Date().getFullYear() - 1));
  await expect(page.locator(".movie-card")).toHaveCount(20);
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Escape");
  await expect(page.locator('[role="listbox"]')).toHaveCount(0);
  await expect(page).toHaveURL(/year=/);
  const next = page.locator('[data-focus-id="next-page"]');
  await next.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/page=2/);
  await expect(page.locator('[data-focus-id="catalog-movie-movie-1100"]')).toBeVisible();
  await page.locator('[data-focus-id="reset-filters"]').focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/film$/);
  await expect(genre).toBeFocused();
});

test("TV discovery uses first-air year and a series opens its selected episode", async ({ page }) => {
  const requests = [];
  page.on("request", request => { if (request.url().includes("discover/tv")) requests.push(new URL(request.url())); });
  await page.goto("/series?genre=18&year=2020&tv=1");
  await expect(page.locator(".movie-card")).toHaveCount(20);
  expect(requests.at(-1).searchParams.get("first_air_date_year")).toBe("2020");
  expect(requests.at(-1).searchParams.has("primary_release_year")).toBeFalsy();
  await page.locator('[data-focus-id="catalog-tv-tv-200"]').focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('[data-focus-id="play"]')).toBeFocused();
  await page.locator('[data-focus-id="season"]').focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.locator('[data-focus-id="play"]').focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".player-frame")).toHaveAttribute("src", "https://vixsrc.to/tv/200/2/3?lang=it");
  await expect(page.locator(".navbar")).toHaveCount(0);
  await expect(page.locator('[data-focus-id="enter-player"]')).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(".player-frame")).toBeFocused();
  await page.goBack();
  await expect(page.locator('[data-focus-id="season"]')).toContainText("Stagione 2");
  await expect(page.locator('[data-focus-id="episode"]')).toContainText("Episodio 3");
});

test("search editing keeps cursor keys and clearing restores both shelves", async ({ page }) => {
  await page.goto("/?tv=1");
  const input = page.getByRole("searchbox");
  await input.fill("Titolo alternativo");
  await page.keyboard.press("ArrowLeft");
  await expect(input).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: /Risultati per/ })).toBeVisible();
  // The API can match translated/alternative titles: do not filter them again by substring.
  await expect(page.locator(".movie-card")).toHaveCount(40);
  await page.getByRole("link", { name: "Cancella ricerca" }).click();
  await expect(page.getByRole("heading", { name: "Film del momento" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Serie TV del momento" })).toBeVisible();
});

test("failed and empty catalogs are recoverable without a mouse", async ({ page }) => {
  let fail = true;
  await page.route("**/3/discover/movie?**", route => fail ? route.fulfill({ status: 503, json: {} }) : route.fallback());
  await page.goto("/film?tv=1");
  await expect(page.getByRole("alert")).toContainText("Impossibile caricare");
  fail = false;
  await page.getByRole("button", { name: "Riprova" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".movie-card")).toHaveCount(20);
  await page.goto("/film?year=1900&tv=1");
  await expect(page.getByRole("status").first()).toContainText("Nessun titolo trovato");
  await expect(page.locator('[data-focus-id="next-page"]')).toBeDisabled();
});

test("Tab reveals clipped cards and reduced motion is respected", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/film");
  await expect(page.locator(".movie-card")).toHaveCount(20);
  await page.locator(".movie-card").first().focus();
  for (let index = 0; index < 12; index++) await page.keyboard.press("Tab");
  await expect(page.locator(".movie-card").nth(12)).toBeFocused();
  await expect(page.locator(".movie-card").nth(12)).toBeInViewport({ ratio: 1 });
});
