import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/Ionicons"; // Import icon

export default function Mypolls() {
    const [polls, setPolls] = useState([]); // Polls list
    const [question, setQuestion] = useState(""); // New poll question
    const [options, setOptions] = useState(""); // New poll options
    const [pollCount, setPollCount] = useState(0); // Poll count

    const handleCreatePoll = () => {
        if (question && options) {
            const newPoll = {
                id: String(pollCount + 1),
                user: "You", // Placeholder for user, replace with actual user info
                question,
                options: options.split(","),
                votes: Array(options.split(",").length).fill(0),
                profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
            };
            setPolls((prevPolls) => [...prevPolls, newPoll]);
            setPollCount(pollCount + 1);
            setQuestion("");
            setOptions("");
        } else {
            alert("Please provide both a question and options.");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Create Poll</Text>
            </View>

            {/* Create Poll Form */}
            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your question"
                    value={question}
                    onChangeText={setQuestion}
                    placeholderTextColor="#a0a0a0"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Enter options separated by commas"
                    value={options}
                    onChangeText={setOptions}
                    placeholderTextColor="#a0a0a0"
                />
                <TouchableOpacity style={styles.createButton} onPress={handleCreatePoll}>
                    <Text style={styles.createButtonText}>Create Poll</Text>
                </TouchableOpacity>
            </View>

            {/* Poll List */}
            <View style={styles.pollListContainer}>
                <Text style={styles.pollCountText}>Your Polls: {pollCount}</Text>
                <FlatList
                    data={polls}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.pollList}

                    renderItem={({ item }) => (
                        <View style={styles.pollCard}>
                            <Text style={styles.pollQuestion}>{item.question}</Text>
                            <Text style={styles.pollOptions}>
                                {item.options.join(", ")}
                            </Text>
                            <View style={styles.pollVotes}>
                                {item.votes.map((vote, index) => (
                                    <Text key={index} style={styles.voteText}>
                                        {item.options[index]}: {vote} votes
                                    </Text>
                                ))}
                            </View>
                            {/* Share Icon */}
                            <TouchableOpacity style={styles.shareIcon}>
                                <Icon name="share-social" size={22} color="#007bff" />
                            </TouchableOpacity>
                        </View>
                    )}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        paddingTop: hp("5%"),
        paddingHorizontal: wp("5%"),
    },
    header: {
        marginBottom: hp("3%"),
        alignItems: "center",
    },
    headerText: {
        fontSize: wp("5%"),
        fontWeight: "bold",
        color: "#333",
    },
    formContainer: {
        marginBottom: hp("3%"),
        backgroundColor: "#fff",
        padding: wp("4%"),
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    input: {
        borderWidth: 1,
        borderColor: "#007bff",
        borderRadius: 10,
        padding: wp("3%"),
        marginBottom: hp("2%"),
        fontSize: wp("4%"),
        backgroundColor: "#fff",
    },
    createButton: {
        backgroundColor: "#007bff",
        paddingVertical: hp("1.5%"),
        borderRadius: 10,
        alignItems: "center",
    },
    createButtonText: {
        color: "#fff",
        fontSize: wp("4.2%"),
        fontWeight: "bold",
    },
    pollListContainer: {
        flex: 1,
        marginTop: hp("3%"),
    },
    pollCountText: {
        fontSize: wp("4.5%"),
        fontWeight: "bold",
        color: "#333",
        marginBottom: hp("2%"),
    },
    pollCard: {
        backgroundColor: "#fff",
        padding: wp("4%"),
        borderRadius: 10,
        marginBottom: hp("2%"),
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    pollQuestion: {
        fontSize: wp("4.5%"),
        fontWeight: "bold",
        marginBottom: hp("1%"),
        color: "#333",
    },
    pollOptions: {
        fontSize: wp("4%"),
        color: "#777",
        marginBottom: hp("1%"),
    },
    pollVotes: {
        marginTop: hp("1%"),
    },
    voteText: {
        fontSize: wp("4%"),
        color: "#333",
        marginVertical: hp("0.5%"),
    },
    shareIcon: {
        marginTop: hp("2%"),
        alignSelf: "flex-end",
    },
    pollList: {
        paddingBottom: hp("10%"),
    },
});
