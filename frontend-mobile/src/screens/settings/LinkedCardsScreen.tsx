import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  List,
  Divider,
  ActivityIndicator,
  FAB,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState, AppDispatch } from '@store';
import { SettingsStackParamList } from '@navigation/AppNavigator';
import { customTheme } from '@theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

type LinkedCardsScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'LinkedCards'>;

const LinkedCardsScreen: React.FC = () => {
  const navigation = useNavigation<LinkedCardsScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { linkedCards, isLoading } = useSelector((state: RootState) => state.cards);

  const [isAddingCard, setIsAddingCard] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      // TODO: Implement actual API call to load cards
      // For now, simulate loading
      setTimeout(() => {
        // Mock data loading
      }, 1000);
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const handleAddCard = () => {
    navigation.navigate('Cards', { screen: 'AddCard' });
  };

  const handleRemoveCard = (cardId: string) => {
    Alert.alert(
      'Remove Card',
      'Are you sure you want to remove this card?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            dispatch({
              type: 'cards/removeCard',
              payload: cardId,
            });
            Alert.alert('Success', 'Card removed successfully');
          },
        },
      ]
    );
  };

  const handleSetPrimary = (cardId: string) => {
    dispatch({
      type: 'cards/setPrimaryCard',
      payload: cardId,
    });
    Alert.alert('Success', 'Primary card updated successfully');
  };

  const getCardIcon = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case 'visa':
        return 'credit-card';
      case 'mastercard':
        return 'credit-card';
      case 'amex':
        return 'credit-card';
      default:
        return 'payment';
    }
  };

  const getCardColor = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case 'visa':
        return '#1A1F71';
      case 'mastercard':
        return '#EB001B';
      case 'amex':
        return '#006FCF';
      default:
        return customTheme.colors.primary;
    }
  };

  const renderCard = (card: any) => (
    <Card key={card.id} style={styles.cardItem}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <View style={[styles.cardIcon, { backgroundColor: getCardColor(card.cardType) }]}>
              <Icon
                name={getCardIcon(card.cardType)}
                size={24}
                color="#FFFFFF"
              />
            </View>
            <View style={styles.cardDetails}>
              <Text variant="bodyLarge" style={styles.cardName}>
                {card.bankName} •••• {card.cardLastFour}
              </Text>
              <Text variant="bodySmall" style={styles.cardType}>
                {card.cardType.toUpperCase()} • {card.cardholderName}
              </Text>
              {card.isPrimary && (
                <Text variant="bodySmall" style={styles.primaryLabel}>
                  PRIMARY CARD
                </Text>
              )}
            </View>
          </View>
          <View style={styles.cardActions}>
            {!card.isPrimary && (
              <Button
                mode="text"
                onPress={() => handleSetPrimary(card.id)}
                style={styles.actionButton}
                textColor={customTheme.colors.primary}
              >
                Set Primary
              </Button>
            )}
            <Button
              mode="text"
              onPress={() => handleRemoveCard(card.id)}
              style={styles.actionButton}
              textColor={customTheme.colors.error}
            >
              Remove
            </Button>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <Card style={styles.emptyCard}>
      <Card.Content style={styles.emptyContent}>
        <Icon name="credit-card" size={64} color={customTheme.colors.onSurfaceVariant} />
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          No Cards Linked
        </Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          Link your debit or credit cards to make payments and manage your finances
        </Text>
        <Button
          mode="contained"
          onPress={handleAddCard}
          style={styles.emptyButton}
        >
          Link Your First Card
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Linked Cards
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Manage your linked payment cards
          </Text>
        </View>

        {/* Cards List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={customTheme.colors.primary} />
            <Text variant="bodyMedium" style={styles.loadingText}>
              Loading cards...
            </Text>
          </View>
        ) : linkedCards.length > 0 ? (
          <View style={styles.cardsContainer}>
            {linkedCards.map(renderCard)}
          </View>
        ) : (
          renderEmptyState()
        )}

        {/* Card Information */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoHeader}>
              <Icon name="info" size={24} color={customTheme.colors.primary} />
              <Text variant="titleSmall" style={styles.infoTitle}>
                About Linked Cards
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.infoText}>
              • Cards are securely encrypted and stored{'\n'}
              • You can set one card as primary for quick payments{'\n'}
              • Remove cards anytime from this screen{'\n'}
              • All transactions are PCI DSS compliant
            </Text>
          </Card.Content>
        </Card>

        {/* Security Notice */}
        <Card style={styles.securityCard}>
          <Card.Content>
            <View style={styles.securityHeader}>
              <Icon name="security" size={20} color={customTheme.colors.primary} />
              <Text variant="bodyMedium" style={styles.securityTitle}>
                Security Notice
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.securityText}>
              Your card information is protected with bank-level security. 
              We never store your full card number or CVV.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddCard}
        label="Add Card"
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: customTheme.spacing.xxl,
  },
  loadingText: {
    color: customTheme.colors.onSurfaceVariant,
    marginTop: customTheme.spacing.md,
  },
  cardsContainer: {
    paddingHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.lg,
  },
  cardItem: {
    marginBottom: customTheme.spacing.md,
    elevation: 2,
    borderRadius: customTheme.borderRadius.lg,
  },
  cardContent: {
    paddingVertical: customTheme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: customTheme.spacing.md,
  },
  cardDetails: {
    flex: 1,
  },
  cardName: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: customTheme.spacing.xs,
  },
  cardType: {
    color: customTheme.colors.onSurfaceVariant,
    marginBottom: customTheme.spacing.xs,
  },
  primaryLabel: {
    color: customTheme.colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: customTheme.spacing.sm,
  },
  emptyCard: {
    margin: customTheme.spacing.lg,
    elevation: 1,
    borderRadius: customTheme.borderRadius.lg,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: customTheme.spacing.xxl,
  },
  emptyTitle: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
    marginTop: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.sm,
  },
  emptyText: {
    color: customTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: customTheme.spacing.lg,
    lineHeight: 20,
  },
  emptyButton: {
    borderRadius: customTheme.borderRadius.lg,
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
  fab: {
    position: 'absolute',
    margin: customTheme.spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: customTheme.colors.primary,
  },
});

export default LinkedCardsScreen;
