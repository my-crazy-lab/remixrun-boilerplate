import styled, { keyframes } from 'styled-components';

const rotate = (y: number) => keyframes`
  0% {
    transform: translateY(${-((y + 5) * 2)}px);
  }

  100% {
    transform: translateY(${(y + 5) * 2}px);
  }
`;

export const LoadingGlobalContainer = styled.section`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 3;
`;

export const LoadingUL = styled.ul`
  display: flex;
  padding: 0;
`;

export const LoadingLI = styled.li`
  width: 12px;
  height: 12px;
  margin: 10px;
  list-style-type: none;
  -webkit-transition: all 0.5s ease;
  transition: all 0.5s ease;
  border-radius: 6px;
  &:first-child {
    animation: ${rotate(2)} 0.81s alternate infinite !important;
    background-color: #fe9f6f;
  }
`;

export const LoadingLISecond = styled.li`
  width: 12px;
  height: 12px;
  margin: 10px;
  list-style-type: none;
  transition: all 0.5s ease;
  border-radius: 6px;
  &:nth-child(2) {
    animation: ${rotate(3)} 0.82s alternate infinite !important;
    background-color: #fe9f6f;
  }
`;

export const LoadingLIThird = styled.li`
  width: 12px;
  height: 12px;
  margin: 10px;
  list-style-type: none;
  transition: all 0.5s ease;
  border-radius: 6px;
  &:nth-child(3) {
    animation: ${rotate(5)} 0.83s alternate infinite !important;
    background-color: #fe9f6f;
  }
`;


const LoadingGlobal = ({ backgroundColor = 'transparent' }) => (
  <LoadingGlobalContainer style={{ backgroundColor }}>
    <LoadingUL>
      <LoadingLI />
      <LoadingLISecond />
      <LoadingLIThird />
    </LoadingUL>
  </LoadingGlobalContainer>
);

export default LoadingGlobal;
