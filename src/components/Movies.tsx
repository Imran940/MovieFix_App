import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,

} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { getListOfMoviesWithFilters, searchMoviesByQuery } from "../functions";
import { useDispatch, useSelector } from "react-redux";
import {
  GlobalStoreTypes,
  MovieTypes,
  OriginalMoviewDataTypes,
  PaginationForMoviesTypes,
} from "../types";
import MovieAction from "../redux/actions";
import { compressMoviesArrayObject } from "../functions/helper";

const { setMovies: setMoviesForStore, GET_MOVIES_STARTED } = MovieAction;
let currentPage: number;

const Movies = () => {
  const [year, setYear] = useState(2012);
  const {
    genres,
    activeMovies,
    cachedYearsMovies,
    filters,
    loading,
    pagination,
    cachedFilteredMovies,
  } = useSelector((state: GlobalStoreTypes) => state.movies);
  const [movies, setMovies] = useState<MovieTypes[]>([]);
  const dispatch = useDispatch();
  const flatListRef = useRef<FlatList<any>>(null);
  const { genreSelected, searchQuery } = filters || {};

  const formatAndUpdateStates = ({
    data,
    currentYear,
    pagination,
  }: {
    data: OriginalMoviewDataTypes[];
    currentYear?: number;
    pagination?: PaginationForMoviesTypes;
  }) => {
    // this genres check if for adding genre tag on the movie tag

    if (genres?.length) {
      let formattedMoviesData = compressMoviesArrayObject({
        values: [...data],
        genres,
      });

      let cachedData = !filters
        ? null
        : filters?.searchQuery
        ? cachedFilteredMovies?.search
        : cachedFilteredMovies?.genre;
      if (
        pagination &&
        pagination?.page >= 2 &&
        cachedData &&
        cachedData?.[1]
      ) {
        formattedMoviesData = [
          ...cachedData?.[pagination.page - 1],
          ...formattedMoviesData,
        ];
      } else if (
        currentYear &&
        cachedYearsMovies &&
        Object.keys(cachedYearsMovies).length
      ) {
        formattedMoviesData = [
          ...cachedYearsMovies?.[currentYear - 1],
          ...formattedMoviesData,
        ];
      }

      if (formattedMoviesData.length) {
        dispatch(
          setMoviesForStore({
            ...(currentYear && { year: currentYear }),
            data: [...formattedMoviesData],
            ...(pagination && { pagination }),
          })
        );
      }
    }
  };

  useEffect(() => {
    if (activeMovies.length) {
      setMovies(activeMovies);
    } else if (!movies?.length && genres.length) {
      (async () => {
        try {
          const response = await getListOfMoviesWithFilters({
            primary_release_year: year,
          });
          formatAndUpdateStates({ data: response.results, currentYear: year });
        } catch (err) {
          console.log(err);
        }
      })();
    }
  }, [genres, activeMovies]);

  useEffect(() => {
    if (filters?.searchQuery) {
      (async () => {
        try {
          //To show loading..
          dispatch({
            type: GET_MOVIES_STARTED,
          });
          const response = await searchMoviesByQuery({
            search: filters.searchQuery!,
          });
          formatAndUpdateStates({
            data: [...response?.results],
            pagination: {
              page: response.page,
              totalPages: response.total_pages,
            },
          });
        } catch (error) {}
      })();
    } else if (filters?.searchQuery == "") {
      dispatch(
        setMoviesForStore({
          data: cachedYearsMovies?.[year].length
            ? [...cachedYearsMovies[year]]
            : [],
        })
      );
    }
  }, [filters]);

  const checkAndReturnDataFromCacheMemory = ({
    data,
    key,
  }: {
    data:
      | {
          [key: number]: MovieTypes[];
        }
      | undefined;
    key: number;
  }): MovieTypes[] | null =>
    !data ? null : data[key]?.length ? [...data[key]] : null;

  const handleReachEnd = async (data?: MovieTypes[] | null) => {
    try {
      //To show loading..
      dispatch({
        type: GET_MOVIES_STARTED,
      });

      if (searchQuery || genreSelected) {
        if (pagination && pagination?.page >= currentPage + 2) currentPage += 2;

        let cachedData = checkAndReturnDataFromCacheMemory({
          data: genreSelected
            ? cachedFilteredMovies?.genre
            : cachedFilteredMovies?.search,
          key: currentPage,
        });
        if (cachedData && data?.length) {
          // Here I'm using cached data to avoid unnecessory api calls
          let newData = [...data, ...cachedData];
          dispatch(
            setMoviesForStore({
              data: newData,
            })
          );
          return;
        }

        let newPage = pagination?.page ? pagination.page + 1 : 1;
        currentPage = newPage;
        let response;

        if (pagination && newPage <= pagination.totalPages) {
          if (genreSelected) {
            response = await getListOfMoviesWithFilters({
              with_genres: genreSelected,
              page: newPage,
            });
          } else if (searchQuery) {
            response = await searchMoviesByQuery({
              search: searchQuery,
              page: newPage,
            });
          }

          formatAndUpdateStates({
            data: response?.results!,
            pagination: { page: newPage, totalPages: response?.total_pages! },
          });
        }
      } else {
        let newYear = year + 1;
        let cachedData = checkAndReturnDataFromCacheMemory({
          data: cachedYearsMovies,
          key: year + 2,
        });

        if (cachedData && data?.length) {
          let newData = [...data, ...cachedData];
          setYear(year + 2);
          dispatch(
            setMoviesForStore({
              data: newData,
            })
          );
          return;
        }
        const response = await getListOfMoviesWithFilters({
          primary_release_year: newYear,
        });
        setYear(newYear);
        formatAndUpdateStates({ data: response.results, currentYear: newYear });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleStartEnd = async (data: MovieTypes[]) => {
    try {
      if (
        (genreSelected || searchQuery) &&
        pagination &&
        pagination?.page >= 3 &&
        currentPage &&
        currentPage >= 1
      ) {
        //To show loading..
        dispatch({
          type: GET_MOVIES_STARTED,
        });

        currentPage -= 2;
        let cachedData = checkAndReturnDataFromCacheMemory({
          data: genreSelected
            ? cachedFilteredMovies?.genre
            : cachedFilteredMovies?.search,
          key: currentPage,
        });

        if (cachedData) {
          dispatch(
            setMoviesForStore({
              data: [...cachedData, ...data],
            })
          );
        }
      } else if (
        year > 2012 &&
        cachedYearsMovies &&
        Object.keys(cachedYearsMovies).length
      ) {
        let cachedData = checkAndReturnDataFromCacheMemory({
          data: cachedYearsMovies,
          key: year - 2,
        });
        if (cachedData) {
          setYear(year - 2);
          dispatch(
            setMoviesForStore({
              data: [...cachedData, ...data],
            })
          );
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const renderItem = ({ item }: { item: MovieTypes }) => (
    <View style={styles.movieBox} key={item.id + Math.random()}>
      <Image style={styles.movieBoxImage} source={{ uri: item.imageUrl }} />
      <Text style={styles.movieBoxTitle}>{item.title}</Text>
      {item.genres?.length ? (
        <View style={styles.genresbox}>
          {item.genres.map((genre) => (
            <Text style={styles.genre} key={genre.id}>
              {genre.name}
            </Text>
          ))}
        </View>
      ) : null}
      <Text style={styles.ratings}>Ratings: {item.ratings}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={loading ? styles.loadingText : styles.yearText}>
        {loading
          ? "Loading.."
          : genreSelected
          ? "Genres Filter Applied"
          : searchQuery
          ? "Search Filter Applied"
          : year}
      </Text>

      <FlatList
        ref={flatListRef}
        data={movies}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        onEndReached={() => {
          if (movies.length == 40) {
            // making space for the next upcoming movies
            let data = [...movies.slice(20, 40)];
            setMovies(data);
            setTimeout(() => handleReachEnd(data), 1000);
          } else {
            handleReachEnd();
          }
        }}
        onStartReached={() => {
          if (movies.length == 40) {
            // removing the first 20 movies for the space
            let data = [...movies.slice(0, 20)];
            handleStartEnd(data);
          }
        }}
        // olny re-render the new item which got added to the list
        extraData={movies}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "80%",
    paddingHorizontal: 20,
    paddingVertical: 30,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    backgroundColor: "#1c1c1c",
  },
  yearText: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
  },

  loadingText: {
    fontSize: 20,
    fontWeight: "600",
    color: "red",
  },

  movieBox: {
    width: "48%",
    marginVertical: 5,
    backgroundColor: "#545454",
    marginRight: 10,
    padding: 10,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  movieBoxTitle: {
    color: "white",
  },
  movieBoxImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  genresbox: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  genre: {
    padding: 3,
    borderColor: "white",
    borderWidth: 0.5,
    color: "#f0ab0c",
  },
  ratings: {
    color: "white",
  },
});
export default Movies;
