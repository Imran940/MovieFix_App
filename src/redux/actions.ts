import { GenreTypes, MovieTypes, setMovieParameterType } from "../types";

const MovieAction = {
  GET_GENRES_DONE: "GET_GENRES_DONE",
  GET_MOVIES_DONE: "GET_MOVIES_DONE",

  setGenres: (data: GenreTypes[]) => (dispatch) => {
    dispatch({
      type: MovieAction.GET_GENRES_DONE,
      payload: data,
    });
  },

  setMovies: (data: setMovieParameterType) => (dispatch) => {
    dispatch({
      type: MovieAction.GET_MOVIES_DONE,
      payload: data,
    });
  },
};

export default MovieAction;
