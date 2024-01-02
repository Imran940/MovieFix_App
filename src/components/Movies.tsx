import { View, Text, StyleSheet, Image, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
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
import { compressMoviesArrayObject } from "../functions/helper";

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
  } = useSelector((state: GlobalStoreTypes) => state.movies);
  const [movies, setMovies] = useState<MovieTypes[]>([]);
  const dispatch = useDispatch();

  const formatAndUpdateStates = ({
    data,
    currentYear,
    pagination,
  }: {
    data: OriginalMoviewDataTypes[];
    currentYear?: number;
    pagination?: PaginationForMoviesTypes;
  }) => {
    if (genres?.length) {
      let formattedMoviesData = compressMoviesArrayObject({
        values: data,
        genres,
      });
      setMovies(formattedMoviesData);
      dispatch(
        setMoviesForStore({
          ...(currentYear && { year: currentYear }),
          data: formattedMoviesData,
          ...(pagination && { pagination }),
        })
      );
    }
  };

  useEffect(() => {
    if (activeMovies.length) {
      setMovies(activeMovies);
    } else if (!movies?.length) {
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
    if (filters?.searchQuery) {
      (async () => {
        try {
          //To show loading..
          dispatch({
            type: GET_MOVIES_STARTED,
          });
          const response = await searchMoviesByQuery(filters.searchQuery!);
          formatAndUpdateStates({
            data: response?.results,
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
      let newPage = pagination?.page ? pagination.page + 1 : 0;
      const { genreSelected, searchQuery } = filters || {};
      dispatch({
        type: GET_MOVIES_STARTED,
      });

      if (!newPage) {
        // do year++
      } else if (filters && pagination && newPage < pagination.totalPages) {
        if (genreSelected) {
          const response = await getListOfMoviesWithFilters({
            with_genres: genreSelected,
          });
          formatAndUpdateStates({
            data: response.results,
            pagination: { page: newPage, totalPages: response.total_pages },
          });
        } else if (searchQuery) {
          const response = await searchMoviesByQuery(searchQuery);
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
    <View style={styles.movieBox} key={item.id}>
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
        data={movies}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        onEndReached={handleReachEnd}
        onStartReached={() => console.log("start reached..")}
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
