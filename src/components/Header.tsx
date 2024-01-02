import { View, Text, StyleSheet, ScrollView, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import { GenreTypes, GlobalStoreTypes, MovieInitialStateTypes } from "../types";
import { getListOfGenres, getListOfMoviesWithFilters } from "../functions";
import { useDispatch, useSelector } from "react-redux";
import MovieAction from "../redux/actions";
import { compressMoviesArrayObject, debounce } from "../functions/helper";

const { setGenres, setMovies, applyFilters, GET_MOVIES_STARTED } = MovieAction;
const Header = () => {
  const [genres, setGenresData] = useState<GenreTypes[]>([]);
  const [genreFilterSelected, setGenreFilterSelected] = useState<number[]>([]);
  const { cachedYearsMovies, activeYear } = useSelector(
    (state: GlobalStoreTypes) => state.movies
  );
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const data = await getListOfGenres();
        setGenresData(data);

        //storing on global store
        dispatch(setGenres(data));
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const handleGenreSelection = async (genreId: number) => {
    try {
      let genreValue = "";
      let newGenreFilterSelected = [...genreFilterSelected];
      let response;

      //To show loading..
      dispatch({
        type: GET_MOVIES_STARTED,
      });

      if (!newGenreFilterSelected.includes(genreId)) {
        newGenreFilterSelected.push(genreId);
      } else {
        let index = newGenreFilterSelected.findIndex((gfs) => gfs == genreId);
        newGenreFilterSelected.splice(index, 1);
      }

      if (newGenreFilterSelected.length) {
        genreValue = newGenreFilterSelected.join(",");

        response = await getListOfMoviesWithFilters({
          with_genres: genreValue,
        });
      }

      dispatch(
        setMovies({
          filters: newGenreFilterSelected.length
            ? {
                genreSelected: genreValue,
              }
            : {},
          data: newGenreFilterSelected.length
            ? compressMoviesArrayObject({ values: response?.results!, genres })
            : cachedYearsMovies?.[activeYear].length
            ? [...cachedYearsMovies[activeYear]]
            : [],
          pagination: {
            page: response?.page!,
            totalPages: response?.total_pages!,
          },
        })
      );
      setGenreFilterSelected(newGenreFilterSelected);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSearchMoview = (text: string) =>
    dispatch(
      applyFilters({
        searchQuery: text,
      })
    );

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.movieFixTextStyle}>MOVIEFIX</Text>
        <TextInput
          style={styles.inputBox}
          onChangeText={debounce({ func: handleSearchMoview, delay: 2000 })}
          placeholder="search movies by text"
          placeholderTextColor="white"
        />
      </View>

      <ScrollView contentContainerStyle={styles.genreContainer} horizontal>
        {genres?.length ? (
          genres.map((genre) => (
            <Text
              onPress={() => handleGenreSelection(genre.id)}
              style={
                genreFilterSelected.includes(genre.id)
                  ? styles.genreTextSelected
                  : styles.genreText
              }
              key={genre.id}
            >
              {genre.name}
            </Text>
          ))
        ) : (
          <Text style={styles.genreText}>"No Genres Found"</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 15,
    backgroundColor: "#373738",
    height: "20%",
    width: "100%",
  },
  movieFixTextStyle: {
    color: "red",
    fontSize: 25,
    fontWeight: "700",
    letterSpacing: 1,
  },

  topSection: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  inputBox: {
    borderWidth: 0.8,
    borderColor: "white",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    color: "white",
    width: 180,
  },

  genreContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 15,
  },

  genreText: {
    color: "#fff",
    backgroundColor: "#535454",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  genreTextSelected: {
    color: "#fff",
    backgroundColor: "red",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});
export default Header;
