import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/Ionicons"; 
import axios from "axios";
import API_URL from "../../../api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Plus, X, Share2, ChevronRight } from 'lucide-react-native';

const ChatDetails = ({ route }) => {
  const { friendid, userid, chat } = route.params;
  const navigation = useNavigation();
  
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'polls'
  const [message, setMessage] = useState("");
  const flatListRef = useRef(null);
  const [friendList, setFriendList] = useState([]);
  const [selectedPolls, setSelectedPolls] = useState({});
  const [Polls, setPolls] = useState([]);
  const [userId, setUserId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [selectedFriends, setSelectedFriends] = useState([]);

  // Static messages for the chat tab
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hey there! How are you?',
      sentByUser: false,
      timestamp: '09:30 AM'
    },
    {
      id: '2',
      text: 'I\'m good, thanks! How about you?',
      sentByUser: true,
      timestamp: '09:31 AM'
    },
    {
      id: '3',
      text: 'Great! Just working on some new features.',
      sentByUser: false,
      timestamp: '09:32 AM'
    },
    {
      id: '4',
      text: 'That sounds interesting! Can\'t wait to see them.',
      sentByUser: true,
      timestamp: '09:33 AM'
    }
  ]);

  // ... (keep all your existing useEffect and other functions)

  const sendMessage = () => {
    if (message.trim().length === 0) return;

    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sentByUser: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setMessage("");

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sentByUser ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      <Text style={[
        styles.messageText,
        { color: item.sentByUser ? '#fff' : '#000' }
      ]}>
        {item.text}
      </Text>
      <Text style={[
        styles.timestamp,
        { color: item.sentByUser ? '#fff' : '#666' }
      ]}>
        {item.timestamp}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.username}>{chat.sharedPersonId?.username}</Text>
        <Image source={{ uri: chat.profilePic || "https://via.placeholder.com/50" }} style={styles.profilePic} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'polls' && styles.activeTab]}
          onPress={() => setActiveTab('polls')}
        >
          <Text style={[styles.tabText, activeTab === 'polls' && styles.activeTabText]}>Polls</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'chat' ? (
        // Chat Tab Content
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        // Polls Tab Content - Your existing polls FlatList
        <FlatList
          data={Polls}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.pollList}
          renderItem={({ item }) => {
            // ... (keep your existing poll render item code)
          }}
        />
      )}

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Message..."
          placeholderTextColor="#888"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Keep your existing Modal component */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        {/* ... (keep your existing modal code) */}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (keep all your existing styles)

  // Add these new styles
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  chatContainer: {
    padding: 10,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 20,
    marginVertical: 4,
    maxWidth: '75%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default ChatDetails;