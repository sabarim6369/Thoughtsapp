import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from "react-native";
import Icon from "react-native-vector-icons/Ionicons"; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from "../../api";
import axios from "axios";

export default function Home() {
    const [selectedPolls, setSelectedPolls] = useState({});
    const [userId, setUserId] = useState(null);
    const [loadingUserId, setLoadingUserId] = useState(true);
    const [polls1, setPolls1] = useState([]);
    const [friendList, setFriendList] = useState([]);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userId');
                if (storedUserId) {
                    setUserId(storedUserId);
                }
            } catch (error) {
                console.error('Error fetching userId:', error);
            } finally {
                setLoadingUserId(false);
            }
        };
        fetchUserId();
    }, []);

    useEffect(() => {
        if (!loadingUserId && userId) {
            axios.get(`${API_URL}/poll/getallPolls/${userId}`)
                .then((response) => setPolls1(response.data))
                .catch((error) => console.error("API Error:", error));

            axios.get(`${API_URL}/friends/getFriends/${userId}`)
                .then((response) => setFriendList(response.data)) // Store the friend list
                .catch((error) => console.error("Friend List API Error:", error));
        }
    }, [userId, loadingUserId]);

    const handleFriendRequest = (friendId) => {
        axios.post(`${API_URL}/friends/sendRequest`, { senderId: userId, receiverId: friendId })
            .then(() => {
                setFriendList([...friendList, friendId]); // Update UI immediately
            })
            .catch(error => console.error("Friend Request Error:", error));
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image source={require("../../assets/download.png")} style={styles.logo} />
            </View>
            {loadingUserId ? (
                <Text>Loading...</Text>
            ) : polls1.length === 0 ? (
                <Text>No polls available</Text>
            ) : (
                <FlatList
                    data={polls1}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.pollList}
                    renderItem={({ item }) => {
                        const isFriend = friendList.includes(item.userId);

                        return (
                            <View style={styles.card}>
                                <View style={styles.profileRow}>
                                    <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
                                    <Text style={styles.userName}>{item.user}</Text>
                                </View>
                                <Text style={styles.question}>{item.question}</Text>

                                {/* Friend Request Button */}
                                {!isFriend && (
                                    <TouchableOpacity
                                        style={styles.friendRequestButton}
                                        onPress={() => handleFriendRequest(item.userId)}
                                    >
                                        <Text style={styles.friendRequestText}>Send Friend Request</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", paddingTop: 20 },
    header: { alignItems: "center", marginBottom: 20 },
    logo: { width: 60, height: 60, resizeMode: "contain" },
    pollList: { paddingBottom: 100 },
    card: { width: "90%", backgroundColor: "#fff", padding: 15, borderRadius: 10, elevation: 3, marginBottom: 15, alignSelf: "center" },
    profileRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    profileImage: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    userName: { fontSize: 16, fontWeight: "bold" },
    question: { fontSize: 16, marginVertical: 10 },
    friendRequestButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 5, alignItems: "center", marginTop: 10 },
    friendRequestText: { color: "#fff", fontSize: 14, fontWeight: "bold" }
});
