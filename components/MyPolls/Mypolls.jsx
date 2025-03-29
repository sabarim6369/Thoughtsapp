import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator,Modal,Image } from "react-native";
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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [friendList, setFriendList] = useState([]);

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
      axios
        .get(`${API_URL}/poll/getPolls/${userId}`)
        .then((response) => {
          setPolls(response.data);
          setPollCount(response.data.length);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching polls:", error);
          setLoading(false);
        });
    }
  }, [userId, loadingUserId]);

  useEffect(() => {
    if (userId) {
      axios
        .get(`${API_URL}/friend/list/${userId}`)
        .then((response) => {
          console.log("\n\nFriend List:", response.data);
          // Ensure `friends` exists and is an array before setting state
          setFriendList(
            Array.isArray(response.data.friends) ? response.data.friends : []
          );
        })
        .catch((error) => {
          console.error("Error fetching friends:", error);
          setFriendList([]); // Prevent undefined issues
        });
    }
  }, [userId]);

  const handleSharePress = (poll) => {
    setSelectedPoll(poll);
    setModalVisible(true);
  };
  const toggleFriendSelection = (id) => {
    setSelectedFriends((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };
  const handleShare = () => {
    if (!selectedPoll || selectedFriends.length === 0) {
      alert("Select at least one friend to share.");
      return;
    }
    console.log(selectedPoll)
    console.log("😍😍😍😍😍😂😂😂😂", selectedPoll._id);
    axios
      .post(`${API_URL}/poll/sharepoll`, {
        pollId: selectedPoll._id, // Ensure _id is used
        userId,
        friends: selectedFriends,
      })
      .then((response) => {
        alert(response.data.message);
        setModalVisible(false);
        setSelectedFriends([]);
      })
      .catch((error) => {
        console.error("Share Error:", error);
        alert(
          error.response?.data?.message ||
            "Failed to share poll. Please try again."
        );
      });
  };
  const handleCreatePoll = () => {
    if (question && options) {
      const newPoll = { question, options: options.split(","), userId };
      axios
        .post(`${API_URL}/poll/create`, newPoll)
        .then((response) => {
          setPolls((prevPolls) => [...prevPolls, response.data]);
          setPollCount((prevCount) => prevCount + 1);
          setQuestion("");
          setOptions("");
        })
        .catch((error) => {
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
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreatePoll}
        >
          <LinearGradient
            colors={["#007bff", "#0056b3"]}
            style={styles.gradientButton}
          >
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
              {item.options &&
                item.options.map((option) => (
                  <View key={option._id} style={styles.voteBadge}>
                    <Text style={styles.voteText}>{option.text}</Text>
                    <Text style={styles.voteCount}>{option.votes} votes</Text>
                  </View>
                ))}
            </View>
            <TouchableOpacity
              style={styles.shareIcon}
              onPress={() => handleSharePress(item)}
            >
              <Icon name="share-social" size={22} color="#007bff" />
            </TouchableOpacity>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Friends to Share</Text>

            {/* Friend List - Limited to 5 Visible */}
            <FlatList
              data={friendList}
              keyExtractor={(item, index) =>
                item?._id?.toString() || index.toString()
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.friendItem,
                    selectedFriends.includes(item._id) && styles.selectedFriend,
                  ]}
                  onPress={() => toggleFriendSelection(item._id)}
                >
                  <View style={styles.checkbox}>
                    {selectedFriends.includes(item._id) && (
                      <Text style={styles.checkmark}>✔</Text>
                    )}
                  </View>
                  <Image
                    source={{
                      uri:
                        item.profileImage || "https://via.placeholder.com/50",
                    }}
                    style={styles.profileImage}
                  />
                  <Text style={styles.friendName}>{item.username}</Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 300 }} // Keeps list limited
              showsVerticalScrollIndicator={false}
            />

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.shareButton]}
                onPress={() => handleShare(selectedFriends)}
              >
                <Text style={styles.buttonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
      },
      modalContent: {
        backgroundColor: "#fff",
        padding: 25,
        borderRadius: 15,
        width: "85%",
        alignItems: "center",
        elevation: 10, // Android shadow
        shadowColor: "#000", // iOS shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
      },
      friendItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        marginVertical: 5,
        width: "100%",
        backgroundColor: "#f2f2f2",
        borderRadius: 10,
        height: 65,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      selectedFriend: {
        backgroundColor: "#e6f9e6",
        borderColor: "#4CAF50",
        borderWidth: 1,
      },
      checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: "#4CAF50",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        borderRadius: 6,
        backgroundColor: "#fff",
      },
      checkmark: {
        fontSize: 16,
        color: "#4CAF50",
        fontWeight: "bold",
      },
      profileImage: {
        width: 45,
        height: 45,
        borderRadius: 25,
        marginRight: 12,
      },
      friendName: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
      },
      buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        width: "100%",
      },
      button: {
        flex: 1,
        padding: 12,
        alignItems: "center",
        borderRadius: 8,
      },
      shareButton: {
        backgroundColor: "#4CAF50",
        marginRight: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      cancelButton: {
        backgroundColor: "#FF3B30",
        marginLeft: 8,
      },
      buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
      },
});
