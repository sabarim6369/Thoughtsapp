import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ActivityIndicator,
} from 'react-native';
import { FileWarning } from 'lucide-react-native';
import axios from 'axios';
import API_URL from '../../../api';
import { useNavigation } from '@react-navigation/native';

const ReportScreen = () => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigation = useNavigation();

  const handleSubmit = async () => {

    if (!description.trim() || !title.trim() ||!name) {
      return alert('Please fill in all required fields.');
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/report/submit`, {
        name,
        title,
        description,
      });
      setShowSuccessModal(true);

      setLoading(false);
      setName('');
      setTitle('');
      setDescription('');
    } catch (err) {
      setLoading(false);
      alert('Something went wrong.');
      console.log(err);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigation.navigate('Profile');
  };

  return (
    <View style={styles.container}>
      <FileWarning color="#FF6B6B" size={50} />
      <Text style={styles.title}>🚨 Report an Issue</Text>

      <TextInput
        style={styles.input}
        placeholder="Your name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.textArea}
        placeholder="Please explain the problem you're facing"
        multiline
        numberOfLines={6}
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit</Text>}
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent
        visible={showSuccessModal}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✅ Thank you!</Text>
            <Text style={styles.modalMessage}>
              Thank you for letting us know! We will take a look at this immediately.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleModalClose}>
              <Text style={styles.modalButtonText}>Go to Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ReportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    fontSize: 16,
    elevation: 1,
  },
  textArea: {
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    textAlignVertical: 'top',
    fontSize: 16,
    elevation: 1,
  },
  button: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 18,
    alignItems: 'center',
    width: '100%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 2,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
