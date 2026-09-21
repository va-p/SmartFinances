import React from 'react';
import type { RefObject } from 'react';

import { useTheme } from 'styled-components';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

// Icons
import {PlayIcon} from 'phosphor-react-native/src/icons/Play';
import {YoutubeLogoIcon} from 'phosphor-react-native/src/icons/YoutubeLogo';
import {SpotifyLogoIcon} from 'phosphor-react-native/src/icons/SpotifyLogo';
import {GameControllerIcon} from 'phosphor-react-native/src/icons/GameController';
import {WindowsLogoIcon} from 'phosphor-react-native/src/icons/WindowsLogo';
import {AppleLogoIcon} from 'phosphor-react-native/src/icons/AppleLogo';
import {GooglePlayLogoIcon} from 'phosphor-react-native/src/icons/GooglePlayLogo';
import {ShoppingCartIcon} from 'phosphor-react-native/src/icons/ShoppingCart';
import {DownloadIcon} from 'phosphor-react-native/src/icons/Download';
import {MonitorIcon} from 'phosphor-react-native/src/icons/Monitor';

// Components
import { Button } from '@components/Button';
import { ModalView } from '@components/Modals/ModalView';

import {
  ContentScroll,
  IconsRow,
  OverlappingIcon,
  OverlappingIconFirst,
  Explanation,
  ExamplesTitle,
  CategoryRow,
  CategoryIconCircle,
  CategoryTextContainer,
  CategoryTitle,
  CategoryExamples,
  Footer,
} from './styles';

import { ThemeProps } from '@interfaces/theme';

type Props = {
  bottomSheetRef: RefObject<BottomSheetModal | null>;
  close: () => void;
};

const CATEGORY_EXAMPLES = [
  {
    Icon: PlayIcon,
    title: 'Serviços de transmissão (Streaming)',
    examples: 'Netflix, Disney+, Spotify, YouTube.',
  },
  {
    Icon: DownloadIcon,
    title: 'Armazenamento em nuvem',
    examples: 'Apple iCloud, Google One, OneDrive.',
  },
  {
    Icon: ShoppingCartIcon,
    title: 'Programas de varejo',
    examples: 'Amazon Prime, Meli+, Clube iFood.',
  },
  {
    Icon: MonitorIcon,
    title: 'Licenças de software',
    examples: 'Microsoft, Adobe, Canva.',
  },
];

/**
 * Tela 2 — explains what the app classifies as "Assinaturas" with service
 * category examples (spec.md R13). Shared by the Subscriptions (Tela 1) and
 * SubscriptionPayments (Tela 5) screens.
 */
export function SubscriptionHelpSheet({ bottomSheetRef, close }: Props) {
  const theme = useTheme() as ThemeProps;

  return (
    <ModalView
      title='Ajuda'
      bottomSheetRef={bottomSheetRef}
      closeModal={close}
      snapPoints={['85%']}
    >
      <ContentScroll>
        <IconsRow>
          <OverlappingIconFirst>
            <YoutubeLogoIcon size={22} weight='fill' color='#FF0000' />
          </OverlappingIconFirst>
          <OverlappingIcon>
            <SpotifyLogoIcon size={22} weight='fill' color={theme.colors.success} />
          </OverlappingIcon>
          <OverlappingIcon>
            <GameControllerIcon size={22} weight='fill' color={theme.colors.attention} />
          </OverlappingIcon>
          <OverlappingIcon>
            <AppleLogoIcon size={22} weight='fill' color={theme.colors.text} />
          </OverlappingIcon>
          <OverlappingIcon>
            <GooglePlayLogoIcon size={22} weight='fill' color='#FBBC04' />
          </OverlappingIcon>
          <OverlappingIcon>
            <WindowsLogoIcon size={22} weight='fill' color='#00A4EF' />
          </OverlappingIcon>
          <OverlappingIcon>
            <ShoppingCartIcon size={22} weight='fill' color={theme.colors.primary} />
          </OverlappingIcon>
        </IconsRow>

        <Explanation>
          Acompanhe aqui seus pagamentos classificados como "Assinaturas"
        </Explanation>
        <ExamplesTitle>
          Exemplos de serviços nesta categoria no aplicativo:
        </ExamplesTitle>

        {CATEGORY_EXAMPLES.map(({ Icon, title, examples }) => (
          <CategoryRow key={title}>
            <CategoryIconCircle>
              <Icon size={20} weight='fill' color={theme.colors.primary} />
            </CategoryIconCircle>
            <CategoryTextContainer>
              <CategoryTitle>{title}</CategoryTitle>
              <CategoryExamples>{examples}</CategoryExamples>
            </CategoryTextContainer>
          </CategoryRow>
        ))}
      </ContentScroll>

      <Footer>
        <Button.Root onPress={close}>
          <Button.Text text='Entendi' />
        </Button.Root>
      </Footer>
    </ModalView>
  );
}
