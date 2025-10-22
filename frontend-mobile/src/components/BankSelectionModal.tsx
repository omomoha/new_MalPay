import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Modal,
  Searchbar,
  Card,
  Icon,
} from 'react-native-paper';
import { customTheme } from '@theme';

interface Bank {
  code: string;
  name: string;
}

interface BankSelectionModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSelectBank: (bank: Bank) => void;
  selectedBankCode?: string;
}

const BankSelectionModal: React.FC<BankSelectionModalProps> = ({
  visible,
  onDismiss,
  onSelectBank,
  selectedBankCode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const banks: Bank[] = [
    { code: '044', name: 'Access Bank' },
    { code: '014', name: 'Afribank Nigeria Plc' },
    { code: '023', name: 'Citibank Nigeria Limited' },
    { code: '050', name: 'Ecobank Nigeria Plc' },
    { code: '011', name: 'First Bank of Nigeria' },
    { code: '214', name: 'First City Monument Bank' },
    { code: '070', name: 'Fidelity Bank Nigeria' },
    { code: '058', name: 'Guaranty Trust Bank' },
    { code: '030', name: 'Heritage Bank' },
    { code: '301', name: 'Jaiz Bank' },
    { code: '082', name: 'Keystone Bank' },
    { code: '221', name: 'Stanbic IBTC Bank' },
    { code: '068', name: 'Standard Chartered Bank' },
    { code: '232', name: 'Sterling Bank' },
    { code: '032', name: 'Union Bank of Nigeria' },
    { code: '033', name: 'United Bank for Africa' },
    { code: '215', name: 'Unity Bank' },
    { code: '035', name: 'Wema Bank' },
    { code: '057', name: 'Zenith Bank' },
  ];

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bank.code.includes(searchQuery)
  );

  const handleSelectBank = (bank: Bank) => {
    onSelectBank(bank);
    onDismiss();
  };

  const renderBankItem = ({ item }: { item: Bank }) => (
    <TouchableOpacity onPress={() => handleSelectBank(item)}>
      <Card style={[
        styles.bankItem,
        selectedBankCode === item.code && styles.selectedBankItem
      ]}>
        <Card.Content style={styles.bankItemContent}>
          <View style={styles.bankInfo}>
            <Text variant="bodyLarge" style={styles.bankName}>
              {item.name}
            </Text>
            <Text variant="bodySmall" style={styles.bankCode}>
              Code: {item.code}
            </Text>
          </View>
          {selectedBankCode === item.code && (
            <Icon
              name="check-circle"
              size={24}
              color={customTheme.colors.primary}
            />
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={styles.modalContainer}
    >
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Select Bank
        </Text>
        <Searchbar
          placeholder="Search banks..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>
      
      <FlatList
        data={filteredBanks}
        renderItem={renderBankItem}
        keyExtractor={(item) => item.code}
        style={styles.bankList}
        showsVerticalScrollIndicator={false}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: customTheme.colors.surface,
    margin: customTheme.spacing.lg,
    borderRadius: customTheme.borderRadius.lg,
    maxHeight: '80%',
  },
  header: {
    padding: customTheme.spacing.lg,
    paddingBottom: customTheme.spacing.md,
  },
  title: {
    color: customTheme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: customTheme.spacing.md,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: customTheme.colors.surfaceVariant,
  },
  bankList: {
    maxHeight: 400,
  },
  bankItem: {
    marginHorizontal: customTheme.spacing.lg,
    marginBottom: customTheme.spacing.sm,
    elevation: 1,
  },
  selectedBankItem: {
    borderWidth: 2,
    borderColor: customTheme.colors.primary,
  },
  bankItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    color: customTheme.colors.onSurface,
    fontWeight: '500',
  },
  bankCode: {
    color: customTheme.colors.onSurfaceVariant,
    marginTop: customTheme.spacing.xs,
  },
});

export default BankSelectionModal;
