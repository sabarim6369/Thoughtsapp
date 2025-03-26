import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, TextInput, Button } from "react-native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from "../../api";

export default function Profile() {
    const [friends, setFriends] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Friends");
    const [userId, setUserId] = useState(null);
    const [selectedChat, setSelectedChat] = useState(null);
    
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem("userId");
                if (storedUserId) {
                    setUserId(storedUserId);
                }
            } catch (error) {
                console.error("Error fetching userId:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserId();
    }, []);

    useEffect(() => {
        if (userId) {
            fetchFriends();
            fetchMessages();
        }
    }, [userId]);

    const fetchFriends = async () => {
        try {
            const response = await axios.get(`${API_URL}/friend/list/${userId}`);
            setFriends(response.data.friends || []);
        } catch (err) {
            Alert.alert("Error", "Unable to fetch friends");
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${API_URL}/messages/list/${userId}`);
            setMessages(response.data.messages || []);
        } catch (err) {
            Alert.alert("Error", "Unable to fetch messages");
        }
    };

    const renderFriendsList = () => (
        <FlatList
            data={friends}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => (
                <View style={styles.card}>
                    <Image source={{ uri: item.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png" }} style={styles.friendPic} />
                    <Text style={styles.friendName}>{item.username}</Text>
                </View>
            )}
        />
    );

    const renderMessagesList = () => (
        <FlatList
            data={messages}
            keyExtractor={(item) => item.senderId.toString()}
            renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setSelectedChat(item)} style={styles.card}>
                    <Image source={{ uri: item.senderProfilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png" }} style={styles.friendPic} />
                    <Text style={styles.friendName}>{item.senderName}</Text>
                </TouchableOpacity>
            )}
        />
    );

    const renderChat = () => (
        <View style={styles.chatContainer}>
            <Text style={styles.chatHeader}>{selectedChat?.senderName}</Text>
            <FlatList
                data={selectedChat?.messages || []}
                keyExtractor={(msg, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={[styles.messageBubble, item.isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
                        <Text style={styles.messageText}>{item.text}</Text>
                    </View>
                )}
            />
            <Button title="Back" onPress={() => setSelectedChat(null)} />
        </View>
    );

    if (loading) {
        return <ActivityIndicator size="large" color="#007bff" style={styles.loader} />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                <TouchableOpacity onPress={() => setActiveTab("Friends")} style={[styles.tabButton, activeTab === "Friends" && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === "Friends" && styles.activeTabText]}>Friends</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab("Messages")} style={[styles.tabButton, activeTab === "Messages" && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === "Messages" && styles.activeTabText]}>Messages</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.tabContent}>
                {activeTab === "Friends" && renderFriendsList()}
                {activeTab === "Messages" && (selectedChat ? renderChat() : renderMessagesList())}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9fa", paddingTop: 20 },
    tabBar: { flexDirection: "row", justifyContent: "center", marginVertical: 10 },
    tabButton: { padding: 10, borderRadius: 10, backgroundColor: "#e9ecef", margin: 5 },
    activeTab: { backgroundColor: "#007bff" },
    tabText: { fontSize: 16, color: "#333" },
    activeTabText: { color: "#fff" },
    tabContent: { flex: 1 },
    card: { flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "#fff", margin: 5, borderRadius: 10 },
    friendPic: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
    friendName: { fontSize: 16, color: "#333" },
    chatContainer: { flex: 1, padding: 10 },
    chatHeader: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
    messageBubble: { padding: 10, borderRadius: 10, marginVertical: 5 },
    ownMessage: { alignSelf: "flex-end", backgroundColor: "#007bff" },
    otherMessage: { alignSelf: "flex-start", backgroundColor: "#e9ecef" },
    messageText: { color: "#fff" },
});
