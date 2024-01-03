import {
  GenreTypes,
  GetMovieFilterTypes,
  GetMoviesResponseTypes,
  OriginalMoviewDataTypes,
} from "../types";
import { BASE_URL, api_key } from "../constants";
import request from "superagent";

export const getListOfGenres = async (): Promise<GenreTypes[]> => {
  try {
    const response = await request.get(
      `${BASE_URL}/genre/movie/list?language=en&api_key=${api_key}`
    );
    return response.body.genres;
  } catch (err) {
    throw err;
  }
};

export const getListOfMoviesWithFilters = async ({
  primary_released_year = 2012,
  vote_gte = 100,
  with_genres,
  with_keywords,
  page = 1,
}: Partial<GetMovieFilterTypes>): Promise<GetMoviesResponseTypes> => {
  try {
    let query: Partial<
      GetMovieFilterTypes & { api_key: string; sort_by: string }
    > = {
      api_key,
      sort_by: "popularity.desc",
      page,
    };
    if (with_genres) query.with_genres = with_genres;
    if (with_keywords) query.with_keywords = with_keywords;
    if (!with_genres && !with_keywords) {
      query = {
        ...query,
        primary_released_year,
        vote_gte,
      };
    }

    const response = await request
      .get(`${BASE_URL}/discover/movie`)
      .query(query);

    return response.body;
  } catch (error) {
    throw error;
  }
};

export const searchMoviesByQuery = async ({
  search,
  page = 1,
}: {
  search: string;
  page?: number;
}): Promise<GetMoviesResponseTypes> => {
  try {
    const response = await request
      .get(`${BASE_URL}/search/movie`)
      .query({ query: search, api_key });

    return response.body;
  } catch (error) {
    throw error;
  }
};
