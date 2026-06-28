/** Curated IMDb IDs for browse when using OMDb/ReelDB (no trending API) */
export const CURATED_LISTS = {
  trending: [
    "tt0111161", "tt0468569", "tt0137523", "tt0109830", "tt0133093",
    "tt0110912", "tt0167260", "tt1375666", "tt0816692", "tt0120737",
  ],
  action: [
    "tt2911666", "tt0499549", "tt0848228", "tt0371746", "tt1431045",
    "tt1825683", "tt4154756", "tt4154796", "tt0816692", "tt0379786",
  ],
  comedy: [
    "tt1119646", "tt0386676", "tt1049413", "tt1431045", "tt0443453",
    "tt0107048", "tt0120737", "tt0095953", "tt0102926", "tt0109686",
  ],
  drama: [
    "tt0111161", "tt0109830", "tt0169547", "tt0120338", "tt0993846",
    "tt2582802", "tt0407887", "tt0332280", "tt0120382", "tt0114369",
  ],
  horror: [
    "tt0081505", "tt1457767", "tt1392170", "tt5052448", "tt7349950",
    "tt7069210", "tt2380307", "tt0084787", "tt0266697", "tt0114369",
  ],
  scifi: [
    "tt0133093", "tt0816692", "tt1375666", "tt0088763", "tt0088247",
    "tt0114814", "tt0480249", "tt0317705", "tt0118884", "tt0499549",
  ],
} as const;

export const GENRE_SEARCH_MAP: Record<string, string> = {
  action: "action",
  comedy: "comedy",
  drama: "drama",
  horror: "horror",
  romance: "romance",
  "sci-fi": "sci-fi",
  thriller: "thriller",
  animation: "animation",
  adventure: "adventure",
  fantasy: "fantasy",
};

export const MOOD_GENRE_SEARCH: Record<string, string[]> = {
  happy: ["comedy", "animation", "family"],
  chill: ["drama", "documentary"],
  excited: ["action", "adventure"],
  emotional: ["drama", "romance"],
  scared: ["horror", "thriller"],
  curious: ["sci-fi", "mystery"],
  romantic: ["romance", "comedy"],
  funny: ["comedy"],
};
