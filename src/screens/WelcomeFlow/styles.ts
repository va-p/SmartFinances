import styled from 'styled-components/native';

type BulletProps = {
  isActive?: boolean;
};

export const Container = styled.View`
  flex: 1;
  width: 100%;
`;

export const StepIndicatorContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 0 4px 0;
  width: 100%;
`;

export const StepBullet = styled.TouchableOpacity<BulletProps>`
  width: ${({ isActive }) => (isActive ? 24 : 8)}px;
  height: 8px;
  border-radius: 4px;
  margin-horizontal: 4px;
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.text};
`;
