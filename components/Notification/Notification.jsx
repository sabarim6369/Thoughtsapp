import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import API_URL from "../../api";
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingUserId, setLoadingUserId] = useState(true); // Track userId loading state
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        if (userId && !loadingUserId) {  

        fetchFriendRequests();
        }
    }, [userId, loadingUserId]);
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
    }, []); 
    const fetchFriendRequests = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/friend/requests/${userId}`);
            const friendRequests = response.data.friendRequests.map(request => ({
                id: request._id,
                type: "friendRequest",  
                user: request.username,
                message: "sent you a friend request",
                status: "pending",
                requesterId: request._id,
            }));
            setNotifications(friendRequests);
        } catch (error) {
            console.error("Error fetching friend requests", error);
        }
        setLoading(false);
    };

    const handleAccept = async (requesterId) => {
        try {
            await axios.post(`${API_URL}/friend/acceptRequest`, {
                userId: userId,
                requesterId,
            });

            setNotifications(notifications.map(notification =>
                notification.id === requesterId ? { ...notification, status: "accepted" } : notification
            ));
        } catch (error) {
            console.error("Error accepting friend request", error);
        }
    };

    const handleReject = async (requesterId) => {
        try {
            await axios.post(`${API_URL}/friend/rejectRequest`, {
                userId: userId,
                requesterId,
            });
    
            setNotifications(notifications.filter(notification => notification.id !== requesterId));
    
            alert("Success", "Friend request rejected successfully");
        } catch (error) {
            console.error("Error rejecting friend request", error);
            alert("Error", "Failed to reject friend request");
        }
    };
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Notifications</Text>
            </View>
    
            {loading ? (
                <ActivityIndicator size="large" color="#007bff" />
            ) : notifications.length === 0 ? ( // Show "No notifications" if the list is empty
                <View style={styles.noNotificationsContainer}>
                    <Text style={styles.noNotificationsText}>No notifications</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.notificationCard}>
                            <Text style={styles.notificationMessage}>
                                <Text style={styles.userName}>{item.user}</Text> {item.message}
                            </Text>
    
                            {item.type === "friendRequest" && (
                                <View style={styles.friendRequestActions}>
                                    {item.status === "pending" ? (
                                        <>
                                            <TouchableOpacity
                                                style={[styles.actionButton, styles.acceptButton]}
                                                onPress={() => handleAccept(item.requesterId)}>
                                                <Text style={styles.actionButtonText}>Accept</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.actionButton, styles.rejectButton]}
                                                onPress={() => handleReject(item.requesterId)}>
                                                <Text style={styles.actionButtonText}>Reject</Text>
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <View style={styles.statusLabel}>
                                            <Icon
                                                name={item.status === "accepted" ? "checkmark-circle" : "close-circle"}
                                                size={22}
                                                color={item.status === "accepted" ? "#28a745" : "#FF6347"}
                                            />
                                            <Text style={styles.statusText}>
                                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    )}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
        fontWeight: "600",
        color: "#333",
        letterSpacing: 0.5,
    },
    notificationCard: {
        backgroundColor: "#fff",
        padding: wp("4%"),
        borderRadius: 12,
        marginBottom: hp("2%"),
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    notificationMessage: {
        fontSize: wp("4.2%"),
        color: "#333",
        lineHeight: hp("2.8%"),
    },
    userName: {
        fontWeight: "bold",
        color: "#007bff",
    },
    friendRequestActions: {
        flexDirection: "row",
        marginTop: hp("1%"),
        justifyContent: "space-between",
    },
    actionButton: {
        paddingVertical: hp("1%"),
        paddingHorizontal: wp("4%"),
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        marginHorizontal: wp("1%"),
    },
    acceptButton: {
        backgroundColor: "#007bff",
    },
    rejectButton: {
        backgroundColor: "#FF6347",
    },
    actionButtonText: {
        color: "#fff",
        fontSize: wp("4%"),
        fontWeight: "500",
    },
    statusLabel: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: hp("1%"),
    },
    statusText: {
        marginLeft: wp("2%"),
        fontSize: wp("4%"),
        color: "#333",
        fontWeight: "500",
    },
    noNotificationsContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    noNotificationsText: {
        fontSize: wp("4.5%"),
        color: "#888",
        fontStyle: "italic",
    },
    
});
