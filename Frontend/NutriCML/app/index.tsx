import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Button,
} from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';

export default function FoodScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [nutritionalInfo, setNutritionalInfo] = useState(null);
  const cameraRef = useRef<CameraView | null>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>We need your permission to use the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const takePicture = async () => {
    setLoading(true);
    try {
      if (cameraRef.current) {
        const options = { base64: true };
        const photo = await cameraRef.current.takePictureAsync(options);
        if (photo && photo.base64) {
          const info = await processImage(photo.base64);
          setNutritionalInfo(info);
        } else {
          console.error('Failed to capture image or get base64 data');
        }
      }
    } catch (error) {
      console.error('Error taking picture:', error);
    } finally {
      setLoading(false);
    }
  };

  const processImage = async (imageBase64: string) => {
    const apiUrl = 'https://api.edamam.com/api/food-database/v2/parser';
    const response = await fetch(
      `${apiUrl}?app_id=YOUR_APP_ID&app_key=YOUR_APP_KEY`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageBase64 }),
      }
    );
    const data = await response.json();
    return data;
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            disabled={loading}
          >
            <Text style={styles.text}>Capture</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {nutritionalInfo && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            {JSON.stringify(nutritionalInfo, null, 2)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  captureButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 50,
  },
  text: {
    fontSize: 16,
    color: '#000',
  },
  infoContainer: {
    padding: 10,
    backgroundColor: '#fff',
  },
  infoText: {
    fontSize: 14,
  },
});
