import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import {
  ANNUAL_SUBSCRIPTION_PRICE_WON,
  TOKEN_PACKAGE_AMOUNTS,
  TOKEN_PRICE_WON_PER_TOKEN,
} from '@/constants/tokens';
import { useTokenPurchase } from '@/hooks/use-token-purchase';
import { formatKrw } from '@/utils/format-krw';

const H_PADDING = 20;
const CHIP_GAP = 10;
const COLS = 3;

const TokenPurchaseScreen = (): React.JSX.Element => {
  const { width: windowWidth } = useWindowDimensions();
  const {
    selection,
    selectAnnual,
    selectTokenPackage,
    confirmPurchase,
    canConfirm,
    isPurchasing,
  } = useTokenPurchase();

  const chipWidth = useMemo(() => {
    const available = windowWidth - H_PADDING * 2;
    return Math.floor((available - CHIP_GAP * (COLS - 1)) / COLS);
  }, [windowWidth]);

  const isAnnualSelected = selection === 'annual';
  const isTokenSelected = (amount: number): boolean =>
    selection === amount;

  const handlePay = (): void => {
    if (!canConfirm || isPurchasing) {
      if (!canConfirm) {
        Alert.alert('선택 필요', '연간 구독 또는 토큰 패키지를 선택해 주세요.');
      }
      return;
    }
    void confirmPurchase();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.light.text} />
        </Pressable>
        <Text style={styles.title}>토큰구매</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>연간 구독</Text>
        <Pressable
          style={({ pressed }) => [
            styles.subscriptionBox,
            isAnnualSelected && styles.subscriptionBoxSelected,
            pressed && styles.pressed,
          ]}
          onPress={selectAnnual}
        >
          <View style={styles.subscriptionIconWrap}>
            <MaterialIcons name="workspace-premium" size={28} color="#fff" />
          </View>
          <View style={styles.subscriptionTextCol}>
            <Text style={styles.subscriptionTitle}>토큰 연간 구독</Text>
            <Text style={styles.subscriptionDesc}>
              1년간 토큰 차감 없이 이용 · {formatKrw(ANNUAL_SUBSCRIPTION_PRICE_WON)}
            </Text>
          </View>
          {isAnnualSelected && (
            <MaterialIcons name="check-circle" size={24} color="#007AFF" />
          )}
        </Pressable>

        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
          토큰 충전
        </Text>
        <Text style={styles.priceHint}>
          토큰당 {formatKrw(TOKEN_PRICE_WON_PER_TOKEN)}
        </Text>
        <View style={styles.tokenGrid}>
          {TOKEN_PACKAGE_AMOUNTS.map((amount) => (
            <Pressable
              key={amount}
              style={({ pressed }) => [
                styles.tokenChip,
                { width: chipWidth },
                isTokenSelected(amount) && styles.tokenChipSelected,
                pressed && styles.pressed,
              ]}
              onPress={() => selectTokenPackage(amount)}
            >
              <Text style={styles.tokenChipAmount}>{amount}</Text>
              <Text style={styles.tokenChipUnit}>토큰</Text>
              <Text style={styles.tokenChipPrice}>
                {formatKrw(amount * TOKEN_PRICE_WON_PER_TOKEN)}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footerSafe}>
        <Pressable
          style={({ pressed }) => [
            styles.payButton,
            (!canConfirm || isPurchasing) && styles.payButtonDisabled,
            pressed && canConfirm && !isPurchasing && styles.pressed,
          ]}
          onPress={handlePay}
          disabled={!canConfirm || isPurchasing}
        >
          <Text style={styles.payButtonText}>
            {isPurchasing ? '인증 중…' : '결제하기'}
          </Text>
        </Pressable>
      </SafeAreaView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PADDING,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  placeholder: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.icon,
    marginBottom: 10,
  },
  sectionLabelSpaced: {
    marginTop: 24,
  },
  priceHint: {
    fontSize: 12,
    color: Colors.light.icon,
    marginBottom: 10,
    marginTop: -4,
  },
  subscriptionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  subscriptionBoxSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#EFF6FF',
  },
  subscriptionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscriptionTextCol: {
    flex: 1,
    gap: 4,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subscriptionDesc: {
    fontSize: 13,
    color: Colors.light.icon,
  },
  tokenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CHIP_GAP,
  },
  tokenChip: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenChipSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#EFF6FF',
  },
  tokenChipAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  tokenChipUnit: {
    fontSize: 12,
    color: Colors.light.icon,
    marginTop: 2,
  },
  tokenChipPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 6,
  },
  footerSafe: {
    paddingHorizontal: H_PADDING,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: Colors.light.background,
  },
  payButton: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  pressed: {
    opacity: 0.85,
  },
});

export default TokenPurchaseScreen;
