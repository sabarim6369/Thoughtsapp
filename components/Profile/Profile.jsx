import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert,Modal,TextInput,Button} from "react-native";
import axios from "axios";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import API_URL from "../../api";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Profile() {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("Friends");
    const [userId, setUserId] = useState(null);
    const[userdata,setuserdata]=useState();
    const [modalVisible, setModalVisible] = useState(false);
    const [editedUsername, setEditedUsername] = useState("");
    const [editedbio, seteditedbio] = useState("");

    const user = {
        name: "Sabari",
        bio: "Software Developer | Tech Enthusiast",
        profilePic: "https://randomuser.me/api/portraits/men/4.jpg",
        followersCount: 1200,
        followingCount: 850,
        Friends:2
    };

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
        }
    }, [userId]);

    const fetchFriends = async () => {
        try {
            const response = await axios.get(`${API_URL}/friend/list/${userId}`);
            setFriends(response.data.friends || []);
            setuserdata(response.data.user);

        } catch (err) {
            setError("Failed to fetch data. Please try again.");
            Alert.alert("Error", "Unable to fetch data from server");
        } finally {
            setLoading(false);
        }
    };
    const handleSave = async () => {
        try {
          const response = await axios.post(
            `${API_URL}/auth/edit`, // Replace with your actual API URL
            {
              username: editedUsername,
              bio: editedbio,
              userId:userId
            }
          );
      
          if (response.status === 200) {
            setuserdata((prev) => ({
                ...prev,
                username: editedUsername || prev.username,
                bio: editedbio || prev.bio || "No bio",
              }));
      
            setModalVisible(false);
          }
        } catch (error) {
          console.error("Error updating details:", error.response?.data || error.message);
        }
      };
    const renderFriendsList = () => (
        <FlatList
            data={friends}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => (
                <View style={styles.card}>
                    <Image 
                        source={{ uri: item.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png" }} 
                        style={styles.friendPic} 
                    />
                    <Text style={styles.friendName}>{item.username}</Text>
                </View>
            )}
        />
    );

    if (loading) {
        return <ActivityIndicator size="large" color="#007bff" style={styles.loader} />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.profileHeader}>
                <Image source={{ uri: user.profilePic }} style={styles.profilePic} />
                <View style={styles.profileInfo}>
                    <Text style={styles.username}>{userdata?.username}</Text>
                    <Text style={styles.bio}>{userdata?.bio||"No bio"}</Text>
                    <View style={styles.followerContainer}>
                        <Text style={styles.followerCount}>Friends:{userdata?.friends.length}</Text>
                    </View>
                    <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.tabBar}>
                <TouchableOpacity onPress={() => setActiveTab("Friends")} style={[styles.tabButton, activeTab === "Friends" && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === "Friends" && styles.activeTabText]}>Friends</Text>
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Profile</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter new username"
                            value={editedUsername}
                            onChangeText={setEditedUsername}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Bio"
                            value={editedbio}
                            onChangeText={seteditedbio}
                        />
                        <View style={styles.buttonRow}>
                            <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
                            <Button title="Save" onPress={handleSave} color="blue" />
                        </View>
                    </View>
                </View>
            </Modal>
            <ScrollView style={styles.tabContent}>
                {activeTab === "Friends" && renderFriendsList()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
        paddingTop: hp("5%"),
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    profileHeader: {
        backgroundColor: "#fff",
        padding: hp("3%"),
        borderRadius: 15,
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: wp("5%"),
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    profilePic: {
        width: wp("20%"),
        height: wp("20%"),
        borderRadius: wp("10%"),
        marginRight: wp("5%"),
    },
    profileInfo: {
        flex: 1,
    },
    username: {
        fontSize: wp("6%"),
        fontWeight: "bold",
        color: "#333",
    },
    bio: {
        fontSize: wp("4%"),
        color: "#666",
        marginTop: hp("1%"),
    },
    followerContainer: {
        flexDirection: "row",
        marginTop: hp("1%"),
        justifyContent: "space-between",
        width: "70%",
    },
    followerCount: {
        fontSize: wp("4%"),
        color: "#007bff",
    },
    followingCount: {
        fontSize: wp("4%"),
        color: "#007bff",
    },
    editButton: {
        marginTop: hp("2%"),
        paddingVertical: hp("1.2%"),
        backgroundColor: "#007bff",
        borderRadius: 8,
        alignItems: "center",
    },
    editButtonText: {
        color: "#fff",
        fontSize: wp("4%"),
        fontWeight: "bold",
    },
    tabBar: {
        flexDirection: "row",
        justifyContent: "center",
        marginVertical: hp("3%"),
    },
    tabButton: {
        paddingVertical: hp("1.5%"),
        paddingHorizontal: wp("8%"),
        borderRadius: 10,
        backgroundColor: "#e9ecef",
    },
    activeTab: {
        backgroundColor: "#007bff",
    },
    tabText: {
        fontSize: wp("4%"),
        color: "#333",
    },
    activeTabText: {
        color: "#fff",
    },
    tabContent: {
        flex: 1,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: hp("2%"),
        backgroundColor: "#fff",
        marginHorizontal: wp("5%"),
        borderRadius: 10,
        elevation: 2,
    },
    friendPic: {
        width: wp("12%"),
        height: wp("12%"),
        borderRadius: wp("6%"),
        marginRight: wp("4%"),
    },
    friendName: {
        fontSize: wp("4.5%"),
        color: "#333",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        width: "80%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
});