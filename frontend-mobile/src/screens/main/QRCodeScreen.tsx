import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const QRCodeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [qrData, setQrData] = useState('');
  const [qrType, setQrType] = useState('payment');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateQRCode();
  }, [qrType, amount, description]);

  const generateQRCode = () => {
    setLoading(true);
    
    // Simulate QR code generation
    setTimeout(() => {
      const qrContent = {
        type: qrType,
        userId: 'demo-user',
        amount: amount || '0',
        description: description || '',
        timestamp: new Date().toISOString(),
      };
      
      setQrData(JSON.stringify(qrContent));
      setLoading(false);
    }, 1000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Scan this QR code to send me money',
        url: 'https://malpay.com/qr',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  const handleDownload = () => {
    Alert.alert('Success', 'QR Code downloaded successfully!');
  };

  const qrTypes = [
    { id: 'payment', name: 'Payment Request', icon: 'business-outline', description: 'Request money from others' },
    { id: 'profile', name: 'Profile Share', icon: 'person-outline', description: 'Share your profile' },
    { id: 'contact', name: 'Contact Info', icon: 'card-outline', description: 'Share contact details' },
  ];

  const recentQRs = [
    { id: '1', type: 'payment', amount: '$50.00', description: 'Coffee money', date: '2 hours ago' },
    { id: '2', type: 'profile', amount: '', description: 'Profile share', date: '1 day ago' },
    { id: '3', type: 'payment', amount: '$25.00', description: 'Lunch split', date: '3 days ago' },
  ];

  const renderQRCode = () => (
    <View style={styles.qrCodeContainer}>
      {loading ? (
        <View style={styles.qrCodeLoading}>
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      ) : (
        <View style={styles.qrCode}>
          {/* Mock QR Code Pattern */}
          <View style={styles.qrCodePattern}>
            {Array.from({ length: 64 }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.qrCodeDot,
                  { backgroundColor: Math.random() > 0.5 ? '#000' : '#fff' },
                ]}
              />
            ))}
          </View>
          
          {/* Corner squares */}
          <View style={[styles.qrCorner, { top: 8, left: 8 }]} />
          <View style={[styles.qrCorner, { top: 8, right: 8 }]} />
          <View style={[styles.qrCorner, { bottom: 8, left: 8 }]} />
        </View>
      )}

      {amount && (
        <Text style={styles.qrAmount}>${amount}</Text>
      )}

      {description && (
        <Text style={styles.qrDescription}>{description}</Text>
      )}

      <Text style={styles.qrInstruction}>
        Scan this QR code to {qrType === 'payment' ? 'send money' : 'connect'}
      </Text>
    </View>
  );

  const renderQRTypes = () => (
    <View style={styles.typesContainer}>
      <Text style={styles.sectionTitle}>QR Code Types</Text>
      
      {qrTypes.map((type) => (
        <TouchableOpacity
          key={type.id}
          style={[
            styles.typeItem,
            qrType === type.id && styles.typeItemSelected,
          ]}
          onPress={() => setQrType(type.id)}
        >
          <View style={styles.typeInfo}>
            <Ionicons name={type.icon as any} size={24} color="#1976d2" />
            <View style={styles.typeDetails}>
              <Text style={styles.typeName}>{type.name}</Text>
              <Text style={styles.typeDescription}>{type.description}</Text>
            </View>
          </View>
          {qrType === type.id && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>Selected</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderRecentQRs = () => (
    <View style={styles.recentContainer}>
      <Text style={styles.sectionTitle}>Recent QR Codes</Text>
      
      {recentQRs.map((qr) => (
        <View key={qr.id} style={styles.recentItem}>
          <View style={styles.recentIcon}>
            <Ionicons name="qr-code-outline" size={20} color="white" />
          </View>
          <View style={styles.recentInfo}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentType}>
                {qrTypes.find(t => t.id === qr.type)?.name}
              </Text>
              {qr.amount && (
                <View style={styles.amountBadge}>
                  <Text style={styles.amountBadgeText}>{qr.amount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.recentDescription}>{qr.description}</Text>
            <Text style={styles.recentDate}>{qr.date}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" />
      
      {/* Header */}
      <LinearGradient colors={['#1976d2', '#1565c0']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR Code</Text>
        <TouchableOpacity onPress={generateQRCode} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* QR Code Display */}
        <View style={styles.qrCard}>
          <Text style={styles.qrTitle}>
            {qrTypes.find(t => t.id === qrType)?.name}
          </Text>
          {renderQRCode()}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#1976d2" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
            <Ionicons name="download-outline" size={20} color="#1976d2" />
            <Text style={styles.actionButtonText}>Download</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Print', 'Print functionality would be implemented here')}>
            <Ionicons name="print-outline" size={20} color="#1976d2" />
            <Text style={styles.actionButtonText}>Print</Text>
          </TouchableOpacity>
        </View>

        {/* QR Code Settings */}
        {qrType === 'payment' && (
          <View style={styles.settingsContainer}>
            <Text style={styles.sectionTitle}>Payment Settings</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Amount (Optional)</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={styles.descriptionInput}
                placeholder="What's this for?"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        )}

        {renderQRTypes()}
        {renderRecentQRs()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  qrCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  qrCodeContainer: {
    alignItems: 'center',
  },
  qrCodeLoading: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCode: {
    width: 200,
    height: 200,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  qrCodePattern: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
  },
  qrCodeDot: {
    width: '12.5%',
    height: '12.5%',
  },
  qrCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#000',
  },
  qrAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginTop: 16,
  },
  qrDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  qrInstruction: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    minWidth: 80,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#1976d2',
    marginTop: 4,
    fontWeight: '500',
  },
  settingsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    height: 80,
    textAlignVertical: 'top',
  },
  typesContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  typeItemSelected: {
    borderColor: '#1976d2',
    backgroundColor: '#f3f9ff',
  },
  typeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeDetails: {
    marginLeft: 12,
    flex: 1,
  },
  typeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  typeDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  selectedBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedBadgeText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  recentContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1976d2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  amountBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  amountBadgeText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  recentDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  recentDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});

export default QRCodeScreen;
