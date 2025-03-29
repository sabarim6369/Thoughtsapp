import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Modal, Image, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Plus, X, Share2, ChevronRight } from 'lucide-react-native';
import axios from "axios";
import API_URL from "../../api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Mypolls() {
  const [polls, setPolls] = useState([]);
  const [pollCount, setPollCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingUserId, setLoadingUserId] = useState(true);
  const [userId, setUserId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [friendList, setFriendList] = useState([]);
  const [createPollVisible, setCreatePollVisible] = useState(false);

  // Move poll creation state into the CreatePollModal component
  const CreatePollModal = () => {
    const [pollData, setPollData] = useState({
      question: "",
      options: [{ id: 1, text: "" }]
    });

    const addOption = () => {
      if (pollData.options.length < 10) {
        setPollData(prev => ({
          ...prev,
          options: [...prev.options, { id: Date.now(), text: "" }]
        }));
      }
    };

    const removeOption = (id) => {
      if (pollData.options.length > 1) {
        setPollData(prev => ({
          ...prev,
          options: prev.options.filter(option => option.id !== id)
        }));
      }
    };

    const updateOption = (id, text) => {
      setPollData(prev => ({
        ...prev,
        options: prev.options.map(option => 
          option.id === id ? { ...option, text } : option
        )
      }));
    };

    const handleCreatePoll = async () => {
      if (!pollData.question.trim()) {
        alert("Please enter a question");
        return;
      }

      const validOptions = pollData.options.filter(opt => opt.text.trim());
      if (validOptions.length < 2) {
        alert("Please add at least two options");
        return;
      }

      try {
        const response = await axios.post(`${API_URL}/poll/create`, {
          question: pollData.question,
          options: validOptions.map(opt => opt.text),
          userId
        });
        
        setPolls(prevPolls => [...prevPolls, response.data]);
        setPollCount(prev => prev + 1);
        setPollData({
          question: "",
          options: [{ id: 1, text: "" }]
        });
        setCreatePollVisible(false);
        fetchPolls();
      } catch (error) {
        console.error("Error creating poll:", error);
        alert("Failed to create poll. Please try again.");
      }
    };

    return (
      <Modal
        visible={createPollVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreatePollVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.createPollModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Poll</Text>
              <TouchableOpacity onPress={() => setCreatePollVisible(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <TextInput
                style={styles.questionInput}
                placeholder="Ask a question..."
                value={pollData.question}
                onChangeText={(text) => setPollData(prev => ({ ...prev, question: text }))}
                multiline
              />

              <Text style={styles.optionsLabel}>Options</Text>
              {pollData.options.map((option, index) => (
                <View key={option.id} style={styles.optionContainer}>
                  <TextInput
                    style={styles.optionInput}
                    placeholder={`Option ${index + 1}`}
                    value={option.text}
                    onChangeText={(text) => updateOption(option.id, text)}
                  />
                  {pollData.options.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeOption}
                      onPress={() => removeOption(option.id)}
                    >
                      <X size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {pollData.options.length < 10 && (
                <TouchableOpacity style={styles.addOptionButton} onPress={addOption}>
                  <Plus size={20} color="#007AFF" />
                  <Text style={styles.addOptionText}>Add Option</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.createButton} onPress={handleCreatePoll}>
                <LinearGradient
                  colors={["#007AFF", "#0056b3"]}
                  style={styles.gradientButton}
                >
                  <Text style={styles.createButtonText}>Create Poll</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
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
        setLoadingUserId(false);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId && !loadingUserId) {
      fetchPolls();
    }
  }, [userId, loadingUserId]);

  const fetchPolls = async () => {
    try {
      const response = await axios.get(`${API_URL}/poll/getPolls/${userId}`);
      setPolls(response.data);
      setPollCount(response.data.length);
    } catch (error) {
      console.error("Error fetching polls:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      axios.get(`${API_URL}/friend/list/${userId}`)
        .then((response) => {
          setFriendList(Array.isArray(response.data.friends) ? response.data.friends : []);
        })
        .catch((error) => {
          console.error("Error fetching friends:", error);
          setFriendList([]);
        });
    }
  }, [userId]);

  const handleSharePress = (poll) => {
    setSelectedPoll(poll);
    setModalVisible(true);
  };

  const toggleFriendSelection = (id) => {
    setSelectedFriends(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const handleShare = async () => {
    if (!selectedPoll || selectedFriends.length === 0) {
      alert("Please select at least one friend to share with.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/poll/sharepoll`, {
        pollId: selectedPoll._id,
        userId,
        friends: selectedFriends,
      });
      alert(response.data.message);
      setModalVisible(false);
      setSelectedFriends([]);
    } catch (error) {
      console.error("Share Error:", error);
      alert(error.response?.data?.message || "Failed to share poll. Please try again.");
    }
  };

  if (loading || loadingUserId) {
    return <ActivityIndicator size="large" color="#007bff" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Polls</Text>
        <TouchableOpacity
          style={styles.newPollButton}
          onPress={() => setCreatePollVisible(true)}
        >
          <Plus size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={polls}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.pollList}

        renderItem={({ item }) => (
          <View style={styles.pollCard}>
            <Text style={styles.pollQuestion}>{item.question}</Text>
            <View style={styles.pollOptions}>
              {item.options?.map((option) => (
                <View key={option._id} style={styles.optionBar}>
                  <View style={[styles.optionProgress, { width: `${(option.votes / Math.max(...item.options.map(o => o.votes), 1)) * 100}%` }]} />
                  <View style={styles.optionContent}>
                    <Text style={styles.optionText}>{option.text}</Text>
                    <Text style={styles.voteCount}>{option.votes}</Text>
                  </View>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => handleSharePress(item)}
            >
              <Share2 size={20} color="#007AFF" />
              <Text style={styles.shareText}>Share Poll</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.shareModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share with Friends</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={friendList}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.friendItem,
                    selectedFriends.includes(item._id) && styles.selectedFriend
                  ]}
                  onPress={() => toggleFriendSelection(item._id)}
                >
                  <Image
                    source={{ uri: item.profilePic || "https://via.placeholder.com/50" }}
                    style={styles.friendAvatar}
                  />
                  <Text style={styles.friendName}>{item.username}</Text>
                  <View style={[
                    styles.checkbox,
                    selectedFriends.includes(item._id) && styles.checkedBox
                  ]}>
                    {selectedFriends.includes(item._id) && (
                      <ChevronRight size={16} color="#FFF" />
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={[
                styles.shareConfirmButton,
                { opacity: selectedFriends.length === 0 ? 0.5 : 1 }
              ]}
              onPress={handleShare}
              disabled={selectedFriends.length === 0}
            >
              <Text style={styles.shareConfirmText}>
                Share with {selectedFriends.length} friend{selectedFriends.length !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CreatePollModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  newPollButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  pollList: {
    padding: 16,
    paddingBottom:35
  },
  pollCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pollQuestion: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 16,
  },
  optionBar: {
    height: 44,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
    position: "relative",
  },
  optionProgress: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  optionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    zIndex: 1,
  },
  optionText: {
    fontSize: 16,
    color: "#000",
  },
  voteCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    padding: 12,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
  },
  shareText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  createPollModal: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    margin: 16,
    maxHeight: "80%",
  },
  shareModal: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    margin: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  modalScroll: {
    padding: 16,
  },
  questionInput: {
    fontSize: 18,
    padding: 16,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    marginBottom: 16,
  },
  optionsLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  optionInput: {
    flex: 1,
    fontSize: 16,
    padding: 12,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
  },
  removeOption: {
    marginLeft: 12,
  },
  addOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 24,
  },
  addOptionText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  createButton: {
    marginBottom: 16,
  },
  gradientButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  friendName: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
  },
  checkedBox: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  shareConfirmButton: {
    margin: 16,
    padding: 16,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
  },
  shareConfirmText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  selectedFriend: {
    backgroundColor: "#F2F2F7",
  },
});