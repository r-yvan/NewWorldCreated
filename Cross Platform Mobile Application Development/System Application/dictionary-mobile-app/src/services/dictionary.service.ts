import { DICTIONARY_API } from "@/constants/config";
import { dictionaryClient, normalizeAxiosError } from "@/lib/http";
import type { ApiError, DictionaryApiResponse, DictionaryEntry, Phonetic } from "@/types";

/**
 * Fetch a word from the Free Dictionary API.
 * The word is trimmed, validated and URL-encoded before the dynamic URL is built.
 * Returns a safely-parsed, non-empty array of entries or throws an ApiError.
 */
export async function fetchWord(rawWord: string): Promise<DictionaryEntry[]> {
  const word = rawWord.trim();
  if (!word) {
    const err: ApiError = { kind: "malformed", message: "Please enter a word to search." };
    throw err;
  }

  const url = `${DICTIONARY_API.entriesPath}/${encodeURIComponent(word.toLowerCase())}`;

  try {
    const { data } = await dictionaryClient.get<DictionaryApiResponse>(url);

    // Defensive parsing: the public API can occasionally return unexpected shapes.
    if (!Array.isArray(data) || data.length === 0) {
      const err: ApiError = { kind: "malformed", message: "Unexpected response from the dictionary." };
      throw err;
    }

    return data.map(sanitizeEntry).filter((entry) => entry.meanings.length > 0);
  } catch (error) {
    // Re-throw already-normalized ApiError objects untouched.
    if (isApiError(error)) throw error;
    throw normalizeAxiosError(error);
  }
}

/** Find the first phonetic that exposes a playable audio URL. */
export function findAudioUrl(entry: DictionaryEntry | undefined): string | null {
  if (!entry?.phonetics?.length) return null;
  const withAudio = entry.phonetics.find((p) => typeof p.audio === "string" && p.audio.trim().length > 0);
  if (!withAudio?.audio) return null;
  return withAudio.audio.startsWith("//") ? `https:${withAudio.audio}` : withAudio.audio;
}

/** Return all phonetics that have audio (for an optional selector). */
export function collectAudioPhonetics(entry: DictionaryEntry | undefined): Phonetic[] {
  if (!entry?.phonetics?.length) return [];
  return entry.phonetics.filter((p) => typeof p.audio === "string" && p.audio.trim().length > 0);
}

/** Pick the best phonetic text label for display. */
export function findPhoneticText(entry: DictionaryEntry | undefined): string | null {
  if (!entry) return null;
  if (entry.phonetic) return entry.phonetic;
  const withText = entry.phonetics?.find((p) => p.text);
  return withText?.text ?? null;
}

/** Guarantee every field is present and never null/undefined before render. */
function sanitizeEntry(entry: DictionaryEntry): DictionaryEntry {
  return {
    word: entry?.word ?? "",
    phonetic: entry?.phonetic,
    phonetics: Array.isArray(entry?.phonetics) ? entry.phonetics : [],
    origin: entry?.origin,
    license: entry?.license,
    sourceUrls: Array.isArray(entry?.sourceUrls) ? entry.sourceUrls : [],
    meanings: Array.isArray(entry?.meanings)
      ? entry.meanings
          .filter((m) => m && Array.isArray(m.definitions))
          .map((m) => ({
            partOfSpeech: m.partOfSpeech ?? "—",
            synonyms: Array.isArray(m.synonyms) ? m.synonyms : [],
            antonyms: Array.isArray(m.antonyms) ? m.antonyms : [],
            definitions: m.definitions
              .filter((d) => d && typeof d.definition === "string")
              .map((d) => ({
                definition: d.definition,
                example: d.example,
                synonyms: Array.isArray(d.synonyms) ? d.synonyms : [],
                antonyms: Array.isArray(d.antonyms) ? d.antonyms : [],
              })),
          }))
      : [],
  };
}

function isApiError(error: unknown): error is ApiError {
  return typeof error === "object" && error !== null && "kind" in error && "message" in error;
}
