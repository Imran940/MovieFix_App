import { View, Text, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { GenreTypes } from "../types";
import { getListOfGenres } from "../functions";

const Header = () => {
  const [genres, setGenres] = useState<GenreTypes[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getListOfGenres();
        setGenres(data);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.movieFixTextStyle}>MOVIEFIX</Text>
      <View style={styles.genreContainer}>
        {genres?.length ? (
          genres.map((genre) => (
            <Text style={styles.genreText} key={genre.id}>
              {genre.name}
            </Text>
          ))
        ) : (
          <Text style={styles.genreText}>"No Genres Found"</Text>
        )}
      </View>
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

  genreContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 15,
    maxWidth: "100%",
    overflow: "scroll",
  },

  genreText: {
    color: "#fff",
    backgroundColor: "#535454",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});
export default Header;
