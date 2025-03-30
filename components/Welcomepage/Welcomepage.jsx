import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const messages = [
  "The human brain generates an estimated 6,000 to 70,000 thoughts per day",
  "A snapshot of billion thoughts",
  "Welcome to Thoughts",
];

const WelcomeScreen = () => {
  const [index, setIndex] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => {
        if (prevIndex === messages.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            navigation.replace("Login"); // Navigate after last message
          }, 5000);
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
        <LinearGradient colors={["#07F2DF", "#458FD0"]} style={styles.container}>
    
    <View style={styles.container}>
      <Text style={styles.text}>{messages[index]}</Text>
      <View style={styles.loader}></View> 
    </View>
    </LinearGradient>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  loader: {
    width: 60,
    height: 10,
    backgroundColor: "#00A8E8",
    marginTop: 20,
    borderRadius: 5,
  },
});
