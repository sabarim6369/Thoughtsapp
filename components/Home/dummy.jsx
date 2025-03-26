import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Modal, Button } from "react-native";
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
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPoll, setSelectedPoll] = useState(null);
    const [selectedFriends, setSelectedFriends] = useState([]);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userId');
                if (storedUserId) {
                    setUserId(storedUserId);  
                }
            } catch (error) {
                console.error('Error fetching userId from AsyncStorage:', error);
            } finally {
                setLoadingUserId(false);  
            }
        };
        fetchUserId();
    }, []);  

    useEffect(() => {
        if (!loadingUserId && userId) {
            axios.get(`${API_URL}/poll/getallPolls/${userId}`)
                .then(response => setPolls1(response.data))
                .catch(error => console.error("API Error:", error));
        }
    }, [userId, loadingUserId]);

    useEffect(() => {
        if (userId) {
            axios.get(`${API_URL}/friend/getFriends/${userId}`)
                .then(response => setFriendList(response.data))
                .catch(error => console.error("Friend List Error:", error));
        }
    }, [userId]);

    const handleVote = async (pollId, index) => {
        if (!userId) {
            alert("User ID not found!");
            return;
        }

        if (selectedPolls[pollId] !== undefined) {
            alert("You have already voted on this poll.");
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/poll/vote`, { pollId, userId, optionIndex: index });
            if (response.status === 200) {
                setSelectedPolls(prev => ({ ...prev, [pollId]: index }));
            }
        } catch (error) {
            console.error("Voting error:", error);
            alert(error.response?.data?.message || "Failed to submit vote. Please try again.");
        }
    };

    const handleSharePress = (poll) => {
        setSelectedPoll(poll);
        setModalVisible(true);
    };

    const toggleFriendSelection = (friendId) => {
        setSelectedFriends(prev =>
            prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
        );
    };

    const handleShare = () => {
        if (!selectedPoll || selectedFriends.length === 0) {
            alert("Select at least one friend to share.");
            return;
        }

        axios.post(`${API_URL}/poll/sharePoll`, {
            pollId: selectedPoll.id,
            userId,
            friends: selectedFriends
        })
        .then(response => {
            alert(response.data.message);
            setModalVisible(false);
            setSelectedFriends([]);
        })
        .catch(error => {
            console.error("Share Error:", error);
            alert("Failed to share poll. Please try again.");
        });
    };

    return (
      <View style={styles.container}>
        <FlatList
          data={polls1}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.pollList}
          renderItem={({ item }) => {
              return (
                  <View style={styles.card}>
                      <Text style={styles.question}>{item.question}</Text>
                      {item.options.map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.optionButton,
                            selectedPolls[item.id] === index ? styles.selectedOption : null,
                          ]}
                          onPress={() => handleVote(item.id, index)}
                        >
                          <Text style={styles.optionText}>{option.text}</Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity onPress={() => handleSharePress(item)} style={styles.iconSpacing}>
                          <Icon name="share-social-outline" size={24} color="#007bff" />
                      </TouchableOpacity>
                  </View>
              );
          }}
        />

        {/* Share Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Friends to Share</Text>
              <FlatList
                data={friendList}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.friendItem, selectedFriends.includes(item.id) && styles.selectedFriend]}
                    onPress={() => toggleFriendSelection(item.id)}
                  >
                    <Text style={styles.friendName}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
              <Button title="Share" onPress={handleShare} />
              <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
      </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", paddingTop: 20 },
    pollList: { paddingBottom: 50 },
    card: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        marginBottom: 15,
    },
    question: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
    optionButton: {
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: "#007bff",
        borderRadius: 10,
        marginVertical: 5,
        alignItems: "center",
    },
    selectedOption: { backgroundColor: "#007bff" },
    optionText: { color: "#007bff", fontSize: 14 },
    iconSpacing: { marginTop: 10, alignSelf: "flex-end" },
    
    // Modal Styles
    modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
    modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    friendItem: { padding: 10, borderBottomWidth: 1, borderColor: "#ccc" },
    selectedFriend: { backgroundColor: "#007bff", color: "#fff" },
    friendName: { fontSize: 16 }
});

