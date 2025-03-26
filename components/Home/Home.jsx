import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

// Sample Poll Data
const polls = [
    {
        id: "1",
        user: "Abigail",
        question: "Which is the ultimate weekend vibe?",
        options: ["Beach time", "Netflix & Chill", "Hiking Adventure"],
        votes: [40, 30, 30], // Example poll percentages
        profileImage: "https://randomuser.me/api/portraits/women/1.jpg",
    },
    {
        id: "2",
        user: "John",
        question: "What's your favorite pet?",
        options: ["Dog", "Cat", "Rabbit"],
        votes: [50, 40, 10],
        profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
        id: "3",
        user: "Emma",
        question: "Best morning drink?",
        options: ["Coffee", "Tea", "Juice"],
        votes: [60, 25, 15],
        profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
    },
];

export default function Home() {
    const [selectedPolls, setSelectedPolls] = useState({}); // Store selected options

    const handleVote = (pollId, index) => {
        setSelectedPolls((prev) => {
            if (prev[pollId] === index) {
                // If the same option is clicked again, deselect it
                const updatedPolls = { ...prev };
                delete updatedPolls[pollId];
                return updatedPolls;
            }
            return { ...prev, [pollId]: index };
        });
    };

    return (
        <View style={styles.container}>
            {/* Header with Logo */}
            <View style={styles.header}>
                <Image source={require("../../assets/download.png")} style={styles.logo} />
            </View>

            <FlatList
                data={polls}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.pollList}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        {/* User Info */}
                        <View style={styles.profileRow}>
                            <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
                            <Text style={styles.userName}>{item.user}</Text>
                        </View>
                        <Text style={styles.question}>{item.question}</Text>

                        {/* Poll Options */}
                        {item.options.map((option, index) => {
                            const isSelected = selectedPolls[item.id] === index;
                            return (
                              <TouchableOpacity
                                key={index}
                                style={[
                                  styles.optionButton,
                                  isSelected ? styles.selectedOption : null,
                                ]}
                                onPress={() => handleVote(item.id, index)}
                              >
                                <Text
                                  style={[
                                    styles.optionText,
                                    isSelected && styles.selectedOptionText,
                                  ]}
                                >
                                  {option}{" "}
                                  {selectedPolls[item.id] !== undefined
                                    ? `(${item.votes[index]}%)`
                                    : ""}
                                </Text>
                              </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: hp("5%"),
    },
    header: {
        alignItems: "center",
        marginBottom: hp("2%"),
    },
    logo: {
        width: wp("15%"),
        height: wp("15%"),
        resizeMode: "contain",
    },
    pollList: {
        paddingBottom: hp("10%"),
    },
    card: {
        width: wp("90%"),
        backgroundColor: "#fff",
        padding: wp("5%"),
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        marginBottom: hp("2%"),
        alignSelf: "center",
    },
    profileRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: hp("1%"),
    },
    profileImage: {
        width: wp("10%"),
        height: wp("10%"),
        borderRadius: 50,
        marginRight: wp("3%"),
    },
    userName: {
        fontSize: wp("4%"),
        fontWeight: "bold",
    },
    question: {
        fontSize: wp("4%"),
        marginVertical: hp("1%"),
    },
    optionButton: {
        width: "100%",
        paddingVertical: hp("1.5%"),
        borderWidth: 1,
        borderColor: "#007bff",
        borderRadius: 10,
        marginVertical: hp("0.5%"),
        alignItems: "center",
    },
    selectedOption: {
        backgroundColor: "#007bff",
    },
    selectedOptionText: {
        color: "#fff",
    },
    optionText: {
        color: "#007bff",
        fontSize: wp("4%"),
    },
});
