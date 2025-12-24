import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { X, Plus } from "lucide-react-native";
import axios from "axios";
import API_URL from "../../api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Mypolls() {
  const [userId, setUserId] = useState(null);
  const [loadingUserId, setLoadingUserId] = useState(true);
  const [pollData, setPollData] = useState({
    question: "",
    options: ["", "", ""],
  });

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

  const updateOption = (index, text) => {
    const newOptions = [...pollData.options];
    newOptions[index] = text;
    setPollData({ ...pollData, options: newOptions });
  };

  const handleCreatePoll = async () => {
    if (!pollData.question.trim()) {
      alert("Please enter a question");
      return;
    }

    const validOptions = pollData.options.filter((text) => text.trim());

    if (validOptions.length < 2) {
      alert("Please add at least two thoughts");
      return;
    }

    const uniqueOptions = new Set(validOptions);
    if (uniqueOptions.size !== validOptions.length) {
      alert("All options must be unique.");
      return;
    }

    try {
      await axios.post(`${API_URL}/poll/create`, {
        question: pollData.question,
        options: validOptions,
        userId,
      });

      alert("Poll created successfully!");
      setPollData({
        question: "",
        options: ["", "", ""],
      });
    } catch (error) {
      console.error("Error creating poll:", error);
      alert("Failed to create poll. Please try again.");
    }
  };

  
  if (loadingUserId) {
    return <ActivityIndicator size="large" color="#007bff" style={styles.loader} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Share your thoughts</Text>

      <TextInput
        style={styles.questionInput}
        placeholder="Say something!"
        value={pollData.question}
        onChangeText={(text) =>
          setPollData({ ...pollData, question: text })
        }
        placeholderTextColor="#999"
        multiline
      />

      {pollData.options.map((option, index) => (
        <TextInput
          key={index}
          style={styles.thoughtInput}
          placeholder={`Thought ${index + 1}`}
          placeholderTextColor="#999"
          value={option}
          onChangeText={(text) => updateOption(index, text)}
        />
      ))}

      <TouchableOpacity
        style={styles.postButton}
        activeOpacity={0.8}
        onPress={handleCreatePoll}
      >
        <Text style={styles.postButtonText}>Post</Text>
      </TouchableOpacity>
    </ScrollView>
  );
  
}
const styles = StyleSheet.create({
  container: {
    padding: wp('5%'),
    backgroundColor: '#f2f4f8',
    flexGrow: 1,
    

  },

  title: {
    fontSize: wp('7%'),
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: hp('3%'),
    marginTop:hp("4%")
  },

  questionInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: wp('2%'),
    padding: wp('4%'),
    fontSize: wp('4%'),
    color: '#333',
    textAlignVertical: 'top',
    minHeight: hp('20%'),
    marginBottom: hp('3%'),
  },

  thoughtInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: wp('2%'),
    padding: wp('4%'),
    fontSize: wp('4%'),
    color: '#333',
    marginBottom: hp('2%'),
  },

  postButton: {
    backgroundColor: '#4A90E2',
    borderRadius: wp('2%'),
    paddingVertical: hp('1.8%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('2%'),
  },

  postButtonText: {
    color: '#ffffff',
    fontSize: wp('4.5%'),
    fontWeight: '600',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
