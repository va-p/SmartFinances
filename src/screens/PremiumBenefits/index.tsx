import React from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { Container } from './styles';

import { Button } from '@components/Button';

import { PurchasesPackage } from 'react-native-purchases';
import { useRevenueCat } from 'src/providers/RevenueCatProvider';

import theme from '@themes/theme';

export function PremiumBenefits() {
  const { user, packages, purchasePackage, restorePurchasesUser } =
    useRevenueCat();
  console.log('user ===>', user);
  console.log('packages ===>', packages);

  async function handlePurchase(pack: PurchasesPackage) {
    await purchasePackage(pack);
  }

  return (
    <Container>
      <ScrollView>
        {packages.map((pack) => (
          <TouchableOpacity
            key={pack.identifier}
            style={styles.button}
            onPress={() => handlePurchase(pack)}
          >
            <View style={styles.text}>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                  fontSize: 14,
                }}
              >
                {pack.product.title}
              </Text>
              <Text style={styles.desc}>{pack.product.description}</Text>
            </View>
            <View style={styles.price}>
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                {pack.product.priceString}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <Button.Root onPress={async () => await restorePurchasesUser()}>
          <Button.Text text='Buscar dados Restore' />
        </Button.Root>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    margin: 8,
    gap: 8,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  text: {
    flexGrow: 1,
  },
  desc: {
    color: '#FFFFFF',
    paddingVertical: 4,
    fontSize: 12,
  },
  button: {
    backgroundColor: theme.colors.shape,
    padding: 12,
    paddingTop: 34,
    paddingBottom: 34,
    borderRadius: 4,
    flexDirection: 'row',
    width: '100%',
  },
  price: {
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#44c604',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
});
