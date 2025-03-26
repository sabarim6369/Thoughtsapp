import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/Ionicons"; // Import icon
import axios from 'axios';
import API_URL from "../../api";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Mypolls() {
    const [polls, setPolls] = useState([]); 
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(""); 
    const [pollCount, setPollCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingUserId, setLoadingUserId] = useState(true); // Track userId loading state
    const [userId, setUserId] = useState(null);

    // Fetch userId from AsyncStorage
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userId');
                if (storedUserId) {
                    setUserId(storedUserId);  // Set userId to state
                }
            } catch (error) {
                console.error('Error fetching userId from AsyncStorage:', error);
            } finally {
                setLoadingUserId(false);  // Stop loading state once done
            }
        };

        fetchUserId();
    }, []);  // Only run once when the component mounts

    // Fetch polls after userId is retrieved
    useEffect(() => {
        if (userId && !loadingUserId) {  // Ensure userId is available and not still loading
            axios.get(`${API_URL}/poll/getPolls/${userId}`)
                .then(response => {
                    setPolls(response.data);
                    setPollCount(response.data.length);
                    setLoading(false);  // Stop loading when data is fetched
                })
                .catch(error => {
                    console.error("Error fetching polls:", error);
                    setLoading(false);  // Stop loading in case of error
                });
        }
    }, [userId, loadingUserId]);  // Trigger the effect when userId is set

    // Handle poll creation
    const handleCreatePoll = () => {
        if (question && options) {
            const newPoll = {
                question,
                options: options.split(","),
                userId
            };
            axios.post(`${API_URL}/poll/create`, newPoll)
                .then(response => {
                    setPolls(prevPolls => [...prevPolls, response.data]);
                    setPollCount(prevCount => prevCount + 1);
                    setQuestion("");
                    setOptions("");
                })
                .catch(error => {
                    console.error("There was an error creating the poll:", error);
                });
        } else {
            alert("Please provide both a question and options.");
        }
    };

    if (loading || loadingUserId) {
        return <ActivityIndicator size="large" color="#007bff" />;  // Show loading spinner if still loading
    }

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

            <View style={styles.pollListContainer}>
                <Text style={styles.pollCountText}>Your Polls: {pollCount}</Text>
                <FlatList
    data={polls}
    keyExtractor={(item) => item._id}
    contentContainerStyle={styles.pollList}
    renderItem={({ item }) => (
        <View style={styles.pollCard}>
            <Text style={styles.pollQuestion}>{item.question}</Text>
            <View style={styles.pollOptions}>
                {item.options && item.options.map((option) => (
                    <Text key={option._id} style={styles.voteText}>
                        {option.text} - {option.votes} votes
                    </Text>
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
