import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import API_URL from "../../api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Mypolls() {
    const [polls, setPolls] = useState([]); 
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(""); 
    const [pollCount, setPollCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingUserId, setLoadingUserId] = useState(true);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem("userId");
                if (storedUserId) {
                    setUserId(storedUserId);
                }
            } catch (error) {
                console.error("Error fetching userId from AsyncStorage:", error);
            } finally {
                setLoadingUserId(false);
            }
        };
        fetchUserId();
    }, []);

    useEffect(() => {
        if (userId && !loadingUserId) {
            axios.get(`${API_URL}/poll/getPolls/${userId}`)
                .then(response => {
                    setPolls(response.data);
                    setPollCount(response.data.length);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Error fetching polls:", error);
                    setLoading(false);
                });
        }
    }, [userId, loadingUserId]);

    const handleCreatePoll = () => {
        if (question && options) {
            const newPoll = { question, options: options.split(","), userId };
            axios.post(`${API_URL}/poll/create`, newPoll)
                .then(response => {
                    setPolls(prevPolls => [...prevPolls, response.data]);
                    setPollCount(prevCount => prevCount + 1);
                    setQuestion("");
                    setOptions("");
                })
                .catch(error => {
                    console.error("Error creating poll:", error);
                });
        } else {
            alert("Please enter both a question and options.");
        }
    };

    if (loading || loadingUserId) {
        return <ActivityIndicator size="large" color="#007bff" />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create a New Poll</Text>

            <View style={styles.inputContainer}>
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
                    <LinearGradient colors={["#007bff", "#0056b3"]} style={styles.gradientButton}>
                        <Text style={styles.createButtonText}>Create Poll</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <Text style={styles.pollCount}>Your Polls ({pollCount})</Text>

            <FlatList
                data={polls}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.pollList}
                renderItem={({ item }) => (
                    <View style={styles.pollCard}>
                        <Text style={styles.pollQuestion}>{item.question}</Text>
                        <View style={styles.pollOptions}>
                            {item.options && item.options.map((option) => (
                                <View key={option._id} style={styles.voteBadge}>
                                    <Text style={styles.voteText}>{option.text}</Text>
                                    <Text style={styles.voteCount}>{option.votes} votes</Text>
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.shareIcon}>
                            <Icon name="share-social" size={22} color="#007bff" />
                        </TouchableOpacity>
                    </View>
                )}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fa",
        paddingTop: hp("5%"),
        paddingHorizontal: wp("5%"),
    },
    title: {
        fontSize: wp("6%"),
        fontWeight: "bold",
        color: "#333",
        marginBottom: hp("2%"),
        textAlign: "center",
    },
    inputContainer: {
        backgroundColor: "#fff",
        padding: wp("4%"),
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        marginBottom: hp("3%"),
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
        borderRadius: 10,
        overflow: "hidden",
    },
    gradientButton: {
        paddingVertical: hp("1.8%"),
        borderRadius: 10,
        alignItems: "center",
    },
    createButtonText: {
        color: "#fff",
        fontSize: wp("4.2%"),
        fontWeight: "bold",
    },
    pollCount: {
        fontSize: wp("4.5%"),
        fontWeight: "bold",
        color: "#333",
        marginBottom: hp("2%"),
    },
    pollList: {
        paddingBottom: hp("10%"),
    },
    pollCard: {
        backgroundColor: "#fff",
        padding: wp("4%"),
        borderRadius: 12,
        marginBottom: hp("2%"),
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    pollQuestion: {
        fontSize: wp("4.5%"),
        fontWeight: "bold",
        color: "#333",
        marginBottom: hp("1%"),
    },
    pollOptions: {
        marginTop: hp("1%"),
    },
    voteBadge: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#eef3ff",
        borderRadius: 8,
        paddingVertical: hp("1%"),
        paddingHorizontal: wp("3%"),
        marginVertical: hp("0.5%"),
    },
    voteText: {
        fontSize: wp("4%"),
        color: "#333",
    },
    voteCount: {
        fontSize: wp("4%"),
        fontWeight: "bold",
        color: "#007bff",
    },
    shareIcon: {
        marginTop: hp("2%"),
        alignSelf: "flex-end",
    },
});
