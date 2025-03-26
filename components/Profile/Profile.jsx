import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/Ionicons";

export default function Profile() {
    const [friends, setFriends] = useState([
        { id: '1', name: 'John Doe', profilePic: 'https://randomuser.me/api/portraits/men/1.jpg' },
        { id: '2', name: 'Jane Smith', profilePic: 'https://randomuser.me/api/portraits/women/1.jpg' },
        { id: '3', name: 'Alice Brown', profilePic: 'https://randomuser.me/api/portraits/men/2.jpg' },
        { id: '4', name: 'Chris Evans', profilePic: 'https://randomuser.me/api/portraits/men/3.jpg' },
    ]);

    const [user, setUser] = useState({
        name: "Sabari",
        bio: "Software Developer | Tech Enthusiast",
        profilePic: "https://randomuser.me/api/portraits/men/4.jpg",
        followersCount: 1200,
        followingCount: 850,
    });

    const [activeTab, setActiveTab] = useState("Friends");

    const renderFriends = () => (
        <FlatList
            data={friends}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View style={styles.friendCard}>
                    <Image source={{ uri: item.profilePic }} style={styles.friendPic} />
                    <Text style={styles.friendName}>{item.name}</Text>
                </View>
            )}
        />
    );

    const renderMessages = () => (
        <FlatList
            data={friends}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View style={styles.messageCard}>
                    <Image source={{ uri: item.profilePic }} style={styles.friendPic} />
                    <Text style={styles.friendName}>{item.name}</Text>
                </View>
            )}
        />
    );

    return (
        <View style={styles.container}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <Image source={{ uri: user.profilePic }} style={styles.profilePic} />
                <View style={styles.profileInfo}>
                    <Text style={styles.username}>{user.name}</Text>
                    <Text style={styles.bio}>{user.bio}</Text>
                    <View style={styles.followerInfo}>
                        <Text style={styles.followerCount}>{user.followersCount} Followers</Text>
                        <Text style={styles.followingCount}>{user.followingCount} Following</Text>
                    </View>
                    <TouchableOpacity style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabBar}>
                <TouchableOpacity onPress={() => setActiveTab("Friends")} style={[styles.tabButton, activeTab === "Friends" && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === "Friends" && styles.activeTabText]}>Friends</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab("Messages")} style={[styles.tabButton, activeTab === "Messages" && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === "Messages" && styles.activeTabText]}>Messages</Text>
                </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <ScrollView style={styles.tabContent}>
                {activeTab === "Friends" ? renderFriends() : renderMessages()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: hp("5%"),
        paddingHorizontal: wp("5%"),
    },
    profileHeader: {
        flexDirection: "row",
        marginBottom: hp("3%"),
        alignItems: "center",
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
    followerInfo: {
        flexDirection: "row",
        marginTop: hp("1%"),
    },
    followerCount: {
        fontSize: wp("4%"),
        color: "#007bff",
        marginRight: wp("5%"),
    },
    followingCount: {
        fontSize: wp("4%"),
        color: "#007bff",
    },
    editButton: {
        marginTop: hp("2%"),
        paddingVertical: hp("1%"),
        backgroundColor: "#f0f0f0",
        borderRadius: 10,
        alignItems: "center",
    },
    editButtonText: {
        color: "#007bff",
        fontSize: wp("4%"),
        fontWeight: "bold",
    },
    tabBar: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: hp("3%"),
        marginBottom: hp("2%"),
    },
    tabButton: {
        paddingVertical: hp("1%"),
        paddingHorizontal: wp("5%"),
        borderRadius: 10,
        backgroundColor: "#f0f0f0",
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
    friendCard: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: hp("2%"),
    },
    messageCard: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: hp("2%"),
    },
    friendPic: {
        width: wp("12%"),
        height: wp("12%"),
        borderRadius: wp("6%"),
        marginRight: wp("4%"),
    },
    friendName: {
        fontSize: wp("4%"),
        color: "#333",
    },
});
