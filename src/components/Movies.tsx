import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ScrollView,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { getListOfMoviesWithFilters, searchMoviesByQuery } from "../functions";
import { useDispatch, useSelector } from "react-redux";
import {
  GlobalStoreTypes,
  MovieInitialStateTypes,
  MovieTypes,
  OriginalMoviewDataTypes,
  PaginationForMoviesTypes,
} from "../types";
import { BASE_IMAGE_URL } from "../constants";
import MovieAction from "../redux/actions";
import { compressMoviesArrayObject, debounce } from "../functions/helper";

const { setMovies: setMoviesForStore, GET_MOVIES_STARTED } = MovieAction;
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

  console.log({ movies: movies.length });
  const formatAndUpdateStates = ({
    data,
    currentYear,
    pagination = {
      page: 1,
      totalPages: 1,
    },
  }: {
    data: OriginalMoviewDataTypes[];
    currentYear?: number;
    pagination?: PaginationForMoviesTypes;
  }) => {
    // this genres check if for adding genre tag on the movie tag

    console.log({ pagination, cachedFilteredMovies });
    if (genres?.length) {
      let formattedMoviesData = compressMoviesArrayObject({
        values: [...data],
        genres,
      });

      if (pagination?.page >= 2 && cachedFilteredMovies?.genre?.[1]) {
        formattedMoviesData = [
          ...cachedFilteredMovies?.genre?.[pagination.page - 1],
          ...formattedMoviesData,
        ];
      }
      console.log(formattedMoviesData.length);
      if (formattedMoviesData.length) {
        dispatch(
          setMoviesForStore({
            ...(currentYear && { year: currentYear }),
            data: [...formattedMoviesData],
            ...(pagination && { pagination }),
            // filters,
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
            primary_released_year: year,
          });
          formatAndUpdateStates({ data: response.results, currentYear: year });
        } catch (err) {
          console.log(err);
        }
      })();
    }
  }, [genres, activeMovies]);

  useEffect(() => {
    console.log("called filter's one");
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
      setMovies(
        cachedYearsMovies?.[year].length ? [...cachedYearsMovies[year]] : []
      );
    }
  }, [filters]);

  const handleReachEnd = async () => {
    try {
      //To show loading..
      let newPage = pagination?.page ? pagination.page + 1 : 1;
      console.log({ newPage });
      const { genreSelected, searchQuery } = filters || {};

      dispatch({
        type: GET_MOVIES_STARTED,
      });

      if (!searchQuery && !genreSelected) {
        // do year++
      } else if (filters && pagination && newPage < pagination.totalPages) {
        if (genreSelected) {
          const response = await getListOfMoviesWithFilters({
            with_genres: genreSelected,
            page: newPage,
          });
          // flatListRef?.current?.scrollToIndex({ animated: true, index: 0 });

          formatAndUpdateStates({
            data: response.results,
            pagination: { page: newPage, totalPages: response.total_pages },
          });
        } else if (searchQuery) {
          const response = await searchMoviesByQuery({
            search: searchQuery,
            page: newPage,
          });
          formatAndUpdateStates({
            data: response?.results,
            pagination: {
              page: newPage,
              totalPages: response.total_pages,
            },
          });
        }
      }
    } catch (error) {
      console.log(error);
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
          : filters?.genreSelected
          ? "Genres Filter Applied"
          : filters?.searchQuery
          ? "Search Filter Applied"
          : year}
      </Text>

      <FlatList
        //ref={flatListRef}
        data={movies}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        onEndReached={() => {
          if (movies.length == 40) {
            // making space for the next upcoming movies
            setMovies((prevMovies) => prevMovies.slice(20, 40));
            setTimeout(handleReachEnd, 1000);
          } else {
            handleReachEnd();
          }
        }}
        onStartReached={() => console.log("start reached..")}
        // disableScrollViewPanResponder
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
