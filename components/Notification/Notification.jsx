import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/Ionicons";

export default function Notifications() {
    const [notifications, setNotifications] = useState([
        { id: '1', type: 'friendRequest', user: 'John Doe', message: 'sent you a friend request', status: 'pending' },
        { id: '2', type: 'like', user: 'Jane Smith', message: 'liked your post', status: 'read' },
        { id: '3', type: 'friendRequest', user: 'Alice Brown', message: 'sent you a friend request', status: 'pending' },
    ]);

    const handleAccept = (id) => {
        setNotifications(notifications.map(notification =>
            notification.id === id ? { ...notification, status: 'accepted' } : notification
        ));
    };

    const handleReject = (id) => {
        setNotifications(notifications.map(notification =>
            notification.id === id ? { ...notification, status: 'rejected' } : notification
        ));
    };

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Notifications</Text>
            </View>

            {/* Notifications List */}
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.notificationCard}>
                        <Text style={styles.notificationMessage}>
                            <Text style={styles.userName}>{item.user}</Text> {item.message}
                        </Text>

                        {item.type === 'friendRequest' && (
                            <View style={styles.friendRequestActions}>
                                {item.status === 'pending' ? (
                                    <>
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.acceptButton]}
                                            onPress={() => handleAccept(item.id)}>
                                            <Text style={styles.actionButtonText}>Accept</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.rejectButton]}
                                            onPress={() => handleReject(item.id)}>
                                            <Text style={styles.actionButtonText}>Reject</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : item.status === 'accepted' ? (
                                    <View style={styles.statusLabel}>
                                        <Icon name="checkmark-circle" size={22} color="#28a745" />
                                        <Text style={styles.statusText}>Accepted</Text>
                                    </View>
                                ) : (
                                    <View style={styles.statusLabel}>
                                        <Icon name="close-circle" size={22} color="#FF6347" />
                                        <Text style={styles.statusText}>Rejected</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {item.type === 'like' && (
                            <View style={styles.likeActions}>
                                <Icon name="heart" size={22} color="#FF6347" />
                                <Text style={styles.likeText}>Liked your post</Text>
                            </View>
                        )}
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
    likeActions: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: hp("1%"),
    },
    likeText: {
        marginLeft: wp("2%"),
        fontSize: wp("4%"),
        color: "#333",
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
});
