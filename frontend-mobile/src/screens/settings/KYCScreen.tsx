import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  List,
  Divider,
  ActivityIndicator,
  ProgressBar,
  Chip,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState, AppDispatch } from '@store';
import { SettingsStackParamList } from '@navigation/AppNavigator';
import { customTheme } from '@theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { KYCStatus } from '@types/user.types';

type KYCScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'KYC'>;

const KYCScreen: React.FC = () => {
  const navigation = useNavigation<KYCScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { profile } = useSelector((state: RootState) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [kycDocuments, setKycDocuments] = useState<any[]>([]);

  const kycSteps = [
    {
      id: 'personal_info',
      title: 'Personal Information',
      description: 'Complete your profile details',
      icon: 'account',
      completed: true,
    },
    {
      id: 'identity_document',
      title: 'Identity Document',
      description: 'Upload government-issued ID',
      icon: 'card-account-details',
      completed: false,
    },
    {
      id: 'address_proof',
      title: 'Address Proof',
      description: 'Upload proof of address',
      icon: 'home',
      completed: false,
    },
    {
      id: 'selfie',
      title: 'Selfie Verification',
      description: 'Take a selfie for verification',
      icon: 'camera',
      completed: false,
    },
  ];

  useEffect(() => {
    loadKYCDocuments();
  }, []);

  const loadKYCDocuments = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement actual API call to load KYC documents
      setTimeout(() => {
        setIsLoading(false);
        // Mock data loading
      }, 1000);
    } catch (error) {
      console.error('Error loading KYC documents:', error);
      setIsLoading(false);
    }
  };

  const getKYCStatusColor = (status: KYCStatus) => {
    switch (status) {
      case KYCStatus.VERIFIED:
        return customTheme.colors.primary;
      case KYCStatus.PENDING:
        return customTheme.colors.tertiary;
      case KYCStatus.REJECTED:
        return customTheme.colors.error;
      default:
        return customTheme.colors.onSurfaceVariant;
    }
  };

  const getKYCStatusIcon = (status: KYCStatus) => {
    switch (status) {
      case KYCStatus.VERIFIED:
        return 'check-circle';
      case KYCStatus.PENDING:
        return 'clock';
      case KYCStatus.REJECTED:
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const handleUploadDocument = (documentType: string) => {
    Alert.alert(
      'Upload Document',
      `Upload your ${documentType.toLowerCase()} for verification.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Upload',
          onPress: () => {
            // TODO: Implement document upload
            Alert.alert('Upload', 'Document upload feature coming soon!');
          },
        },
      ]
    );
  };

  const handleTakeSelfie = () => {
    Alert.alert(
      'Selfie Verification',
      'Take a clear selfie for identity verification.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Take Selfie',
          onPress: () => {
            // TODO: Implement selfie capture
            Alert.alert('Selfie', 'Selfie capture feature coming soon!');
          },
        },
      ]
    );
  };

  const calculateProgress = () => {
    const completedSteps = kycSteps.filter(step => step.completed).length;
    return completedSteps / kycSteps.length;
  };

  const renderKYCStep = (step: any, index: number) => (
    <Card key={step.id} style={styles.stepCard}>
      <Card.Content style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <View style={styles.stepInfo}>
            <View style={[
              styles.stepIcon,
              { backgroundColor: step.completed ? customTheme.colors.primary : customTheme.colors.outlineVariant }
            ]}>
              <Icon
                name={step.completed ? 'check' : step.icon}
                size={24}
                color={step.completed ? customTheme.colors.onPrimary : customTheme.colors.onSurfaceVariant}
              />
            </View>
            <View style={styles.stepDetails}>
              <Text variant="bodyLarge" style={styles.stepTitle}>
                {step.title}
              </Text>
              <Text variant="bodySmall" style={styles.stepDescription}>
                {step.description}
              </Text>
            </View>
          </View>
          <View style={styles.stepActions}>
            {step.completed ? (
              <Chip
                mode="outlined"
                textStyle={styles.completedChip}
                style={styles.completedChipContainer}
              >
                Completed
              </Chip>
            ) : (
              <Button
                mode="outlined"
                onPress={() => {
                  if (step.id === 'selfie') {
                    handleTakeSelfie();
                  } else {
                    handleUploadDocument(step.title);
                  }
                }}
                style={styles.stepButton}
                compact
              >
                {step.id === 'selfie' ? 'Take Selfie' : 'Upload'}
              </Button>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderKYCStatus = () => (
    <Card style={styles.statusCard}>
      <Card.Content>
        <View style={styles.statusHeader}>
          <Icon
            name={getKYCStatusIcon(profile?.kycStatus || KYCStatus.PENDING)}
            size={32}
            color={getKYCStatusColor(profile?.kycStatus || KYCStatus.PENDING)}
          />
          <View style={styles.statusInfo}>
            <Text variant="headlineSmall" style={styles.statusTitle}>
              KYC Status
            </Text>
            <Text
              variant="bodyLarge"
              style={[
                styles.statusText,
                { color: getKYCStatusColor(profile?.kycStatus || KYCStatus.PENDING) }
              ]}
            >
              {(profile?.kycStatus || KYCStatus.PENDING).toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <Text variant="bodyMedium" style={styles.progressLabel}>
            Verification Progress
          </Text>
          <ProgressBar
            progress={calculateProgress()}
            color={customTheme.colors.primary}
            style={styles.progressBar}
          />
          <Text variant="bodySmall" style={styles.progressText}>
            {Math.round(calculateProgress() * 100)}% Complete
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderDocumentsList = () => (
    <Card style={styles.documentsCard}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Uploaded Documents
        </Text>
        
        {kycDocuments.length > 0 ? (
          kycDocuments.map((doc, index) => (
            <List.Item
              key={index}
              title={doc.name}
              description={`Uploaded on ${new Date(doc.uploadedAt).toLocaleDateString()}`}
              left={(props) => <List.Icon {...props} icon="file-document" />}
              right={(props) => (
                <Chip
                  mode="outlined"
                  textStyle={[
                    styles.statusChip,
                    { color: getKYCStatusColor(doc.status) }
                  ]}
                  style={[
                    styles.statusChipContainer,
                    { borderColor: getKYCStatusColor(doc.status) }
                  ]}
                >
                  {doc.status}
                </Chip>
              )}
              style={styles.documentItem}
            />
          ))
        ) : (
          <View style={styles.emptyDocuments}>
            <Icon name="file-document-outline" size={48} color={customTheme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={styles.emptyText}>
              No documents uploaded yet
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            KYC Verification
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Complete your identity verification
          </Text>
        </View>

        {/* KYC Status */}
        {renderKYCStatus()}

        {/* KYC Steps */}
        <View style={styles.stepsContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Verification Steps
          </Text>
          {kycSteps.map((step, index) => renderKYCStep(step, index))}
        </View>

        {/* Documents List */}
        {renderDocumentsList()}

        {/* Information Card */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <Icon name="info" size={24} color={customTheme.colors.primary} />
              <Text variant="titleSmall" style={styles.infoTitle}>
                Verification Requirements
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.infoText}>
              • Government-issued ID (Driver's License, Passport, National ID){'\n'}
              • Proof of address (Utility bill, Bank statement){'\n'}
              • Clear selfie photo{'\n'}
              • All documents must be valid and not expired{'\n'}
              • Verification usually takes 1-3 business days
            </Text>
          </Card.Content>
        </Card>

        {/* Security Notice */}
        <Card style={styles.securityCard}>
          <Card.Content>
            <View style={styles.securityHeader}>
              <Icon name="security" size={20} color={customTheme.colors.primary} />
              <Text variant="bodyMedium" style={styles.securityTitle}>
                Data Security
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.securityText}>
              Your documents are encrypted and stored securely. We comply with international 
              data protection standards and never share your information with third parties.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: customTheme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: customTheme.spacing.lg,
    paddingTop: customTheme.spacing.xl,
  },
  title: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: customTheme.spacing.xs,
  },
  subtitle: {
    color: customTheme.colors.onSurfaceVariant,
  },
  statusCard: {
    margin: customTheme.spacing.lg,
    marginTop: 0,
    elevation: 2,
    borderRadius: customTheme.borderRadius.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: customTheme.spacing.lg,
  },
  statusInfo: {
    marginLeft: customTheme.spacing.md,
  },
  statusTitle: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: customTheme.spacing.xs,
  },
  statusText: {
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: customTheme.spacing.md,
  },
  progressLabel: {
    color: customTheme.colors.onSurfaceVariant,
    marginBottom: customTheme.spacing.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: customTheme.spacing.sm,
  },
  progressText: {
    color: customTheme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  stepsContainer: {
    paddingHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.lg,
  },
  sectionTitle: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: customTheme.spacing.md,
  },
  stepCard: {
    marginBottom: customTheme.spacing.md,
    elevation: 1,
    borderRadius: customTheme.borderRadius.lg,
  },
  stepContent: {
    paddingVertical: customTheme.spacing.md,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: customTheme.spacing.md,
  },
  stepDetails: {
    flex: 1,
  },
  stepTitle: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: customTheme.spacing.xs,
  },
  stepDescription: {
    color: customTheme.colors.onSurfaceVariant,
  },
  stepActions: {
    marginLeft: customTheme.spacing.md,
  },
  stepButton: {
    borderRadius: customTheme.borderRadius.lg,
  },
  completedChip: {
    fontSize: 12,
    fontWeight: '500',
  },
  completedChipContainer: {
    height: 24,
    borderColor: customTheme.colors.primary,
  },
  documentsCard: {
    marginHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.md,
    elevation: 2,
    borderRadius: customTheme.borderRadius.lg,
  },
  documentItem: {
    paddingVertical: customTheme.spacing.xs,
  },
  statusChip: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusChipContainer: {
    height: 24,
  },
  emptyDocuments: {
    alignItems: 'center',
    paddingVertical: customTheme.spacing.xl,
  },
  emptyText: {
    color: customTheme.colors.onSurfaceVariant,
    marginTop: customTheme.spacing.md,
  },
  infoCard: {
    marginHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.md,
    elevation: 1,
    borderRadius: customTheme.borderRadius.lg,
    backgroundColor: customTheme.colors.primaryContainer,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: customTheme.spacing.sm,
  },
  infoTitle: {
    color: customTheme.colors.onPrimaryContainer,
    fontWeight: 'bold',
    marginLeft: customTheme.spacing.sm,
  },
  infoText: {
    color: customTheme.colors.onPrimaryContainer,
    lineHeight: 20,
  },
  securityCard: {
    margin: customTheme.spacing.lg,
    marginTop: 0,
    elevation: 1,
    borderRadius: customTheme.borderRadius.lg,
    backgroundColor: customTheme.colors.surfaceVariant,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: customTheme.spacing.sm,
  },
  securityTitle: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
    marginLeft: customTheme.spacing.sm,
  },
  securityText: {
    color: customTheme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
});

export default KYCScreen;
