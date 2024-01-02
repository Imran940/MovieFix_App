import { BASE_IMAGE_URL } from "../constants";
import { GenreTypes, MovieTypes, OriginalMoviewDataTypes } from "../types";

export const compressMoviesArrayObject = ({
  values,
  genres,
}: {
  values: OriginalMoviewDataTypes[];
  genres: GenreTypes[];
}): MovieTypes[] =>
  values?.map(
    ({
      id,
      original_title,
      overview,
      genre_ids,
      released_date,
      vote_count,
      poster_path,
      vote_average,
    }) => ({
      id,
      title: original_title,
      description: overview,
      genres: genres?.length
        ? genres.filter((genre) => genre_ids.includes(genre.id))
        : [],
      releasedDate: released_date,
      voteCount: vote_count,
      imageUrl: BASE_IMAGE_URL + poster_path,
      ratings: vote_average,
    })
  );

export const debounce = ({
  func,
  delay,
}: {
  func: (text: string) => void;
  delay: number;
}) => {
  let timeoutId: NodeJS.Timeout;
  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};
