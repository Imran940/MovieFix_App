import { GetMovieFilterTypes } from "../types";
import { BASE_URL, api_key } from "../constants";
import request from "superagent";

export const getListOfGenres = async () => {
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
}: Partial<GetMovieFilterTypes>) => {
  try {
    let query: Partial<
      GetMovieFilterTypes & { api_key: string; sort_by: string }
    > = {
      api_key,
      sort_by: "popularity.desc",
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
    return response.body.data;
  } catch (error) {
    throw error;
  }
};
