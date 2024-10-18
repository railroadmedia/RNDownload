import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { stopDownload } from '../img/svgs';

interface ICircularProgressBar {
  size: number;
  strokeWidth?: number;
  color: string;
}

const CircularProgressBar = forwardRef<
  { updateProgress: (p: number) => void },
  ICircularProgressBar
>((props, ref) => {
  const { size = 20, strokeWidth = 2, color } = props;
  const [percentage, setPercentage] = React.useState<number>(0);
  const radius = (size - strokeWidth) / 2;
  const circum = radius * 2 * Math.PI;

  useImperativeHandle(ref, () => ({
    updateProgress: (p: number) => {
      setPercentage(p);
    },
  }));

  return (
    <>
      <View style={styles?.containerStatus}>
        {stopDownload({ fill: color, height: size / 1.7, width: size / 1.7 })}
      </View>
      <Svg width={size} height={size} style={styles.svgStyle}>
        <Circle
          stroke={'transparent'}
          fill={'transparent'}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke='#FFAE00'
          fill='none'
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={`${circum} ${circum}`}
          strokeDashoffset={radius * Math.PI * 2 * (1 - percentage)}
          strokeLinecap='round'
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
          strokeWidth={strokeWidth}
        />
      </Svg>
    </>
  );
});

const styles = StyleSheet.create({
  containerStatus: {
    zIndex: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgStyle: {
    position: 'absolute',
  },
});

export default CircularProgressBar;