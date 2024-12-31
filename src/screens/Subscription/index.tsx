import React, { useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { Container } from './styles';

import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { ModalView } from '@components/ModalView';
import { SectionTitle } from '@components/SectionTitle';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { PurchasesPackage } from 'react-native-purchases';
import { useRevenueCat } from 'src/providers/RevenueCatProvider';
import theme from '@themes/theme';

export function Subscription() {
  // const subscriptionsBottomSheetRef = useRef<BottomSheetModal>(null);

  const { user, packages, purchasePackage, restorePurchasesUser } =
    useRevenueCat();

  async function handlePurchase(pack: PurchasesPackage) {
    await purchasePackage(pack);
  }

  return (
    <Container>
      {/* <Header.Root>
        <Header.BackButton />
        <Header.Title title={'Assinar Smart Finances Premium'} />
      </Header.Root> */}

      {/* <SectionTitle title='Benefícios' /> */}

      {/* <Button type='secondary' title={'Assinar'} onPress={() => null} /> */}

      <ScrollView>
        <View style={styles.container}>
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
                    fontSize: 16,
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
        </View>

        <Text>{JSON.stringify(user, null, 2)}</Text>

        <Button
          title='Buscar dados Restore'
          onPress={async () => await restorePurchasesUser()}
        />
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
